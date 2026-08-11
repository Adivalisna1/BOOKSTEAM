const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');
const db        = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

// =============================================
// Helpers
// =============================================

/** Generate a signed access token (short-lived). */
function _generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, level: user.level },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

/** Generate a signed refresh token (long-lived). */
function _generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

/** SHA-256 hash of a plain token string — stored in DB, never the raw token. */
function _hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Random URL-safe token for email verification / password reset. */
function _randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

/** Parse '7d' / '15m' style strings into a JS Date. */
function _expiresAtFromString(str) {
  const units = { s: 1, m: 60, h: 3600, d: 86400 };
  const match = String(str).match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiry string: ${str}`);
  const seconds = parseInt(match[1], 10) * units[match[2]];
  return new Date(Date.now() + seconds * 1000);
}

/** Persist a refresh token hash in DB, removing old ones for that user (max 5 active sessions). */
async function _saveRefreshToken(userId, refreshToken) {
  const hash      = _hashToken(refreshToken);
  const expiresAt = _expiresAtFromString(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
  const id        = crypto.randomUUID();

  // Keep only the latest 5 sessions per user
  const { rows: existing } = await db.query(
    'SELECT id FROM refresh_tokens WHERE user_id = ? ORDER BY created_at ASC',
    [userId]
  );
  if (existing.length >= 5) {
    const toDelete = existing.slice(0, existing.length - 4).map((r) => r.id);
    const placeholders = toDelete.map(() => '?').join(', ');
    await db.query(`DELETE FROM refresh_tokens WHERE id IN (${placeholders})`, toDelete);
  }

  await db.query(
    'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [id, userId, hash, expiresAt]
  );
}

// =============================================
// Auth Operations
// =============================================

/**
 * Register a new user.
 * Returns access + refresh tokens immediately (auto-login after register).
 */
async function register({ email, username, password }) {
  // Check duplicate email
  const { rows: emailCheck } = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email.toLowerCase()]
  );
  if (emailCheck.length > 0) throw new AppError('Email is already registered', 409);

  // Check duplicate username
  const { rows: usernameCheck } = await db.query(
    'SELECT id FROM users WHERE username = ?',
    [username]
  );
  if (usernameCheck.length > 0) throw new AppError('Username is already taken', 409);

  const password_hash = await bcrypt.hash(password, 12);
  const userId        = crypto.randomUUID();

  await db.query(
    `INSERT INTO users (id, email, username, password_hash, role, is_verified)
     VALUES (?, ?, ?, ?, 'user', 0)`,
    [userId, email.toLowerCase(), username, password_hash]
  );

  // Create email verification token
  const verifyToken     = _randomToken();
  const verifyHash      = _hashToken(verifyToken);
  const verifyExpiresAt = new Date(Date.now() + 24 * 3600 * 1000); // 24h
  const verifyId        = crypto.randomUUID();

  await db.query(
    'INSERT INTO email_verifications (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [verifyId, userId, verifyHash, verifyExpiresAt]
  );

  const user = { id: userId, email: email.toLowerCase(), username, role: 'user', level: 1 };

  const accessToken  = _generateAccessToken(user);
  const refreshToken = _generateRefreshToken(user);
  await _saveRefreshToken(userId, refreshToken);

  return {
    message: 'Registration successful. Please verify your email.',
    // In production, send verifyToken via email — returned here for dev/testing only
    verify_token: process.env.NODE_ENV !== 'production' ? verifyToken : undefined,
    access_token: accessToken,
    refresh_token: refreshToken,
    user: { id: userId, email: user.email, username, role: 'user', level: 1, is_verified: false },
  };
}

/** Login with email + password. Returns access + refresh tokens. */
async function login({ email, password }) {
  const { rows } = await db.query(
    `SELECT id, email, username, password_hash, role, level,
            wallet_balance, is_verified, is_banned
     FROM users WHERE email = ?`,
    [email.toLowerCase()]
  );

  if (rows.length === 0) throw new AppError('Invalid email or password', 401);

  const user = rows[0];

  if (user.is_banned) throw new AppError('Your account has been banned. Contact support.', 403);

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) throw new AppError('Invalid email or password', 401);

  const accessToken  = _generateAccessToken(user);
  const refreshToken = _generateRefreshToken(user);
  await _saveRefreshToken(user.id, refreshToken);

  return {
    access_token:  accessToken,
    refresh_token: refreshToken,
    user: {
      id:             user.id,
      email:          user.email,
      username:       user.username,
      role:           user.role,
      level:          user.level,
      wallet_balance: user.wallet_balance,
      is_verified:    Boolean(user.is_verified),
    },
  };
}

/** Logout: delete the given refresh token from DB. */
async function logout(refreshToken) {
  if (!refreshToken) throw new AppError('Refresh token is required', 400);
  const hash = _hashToken(refreshToken);
  await db.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [hash]);
  return { message: 'Logged out successfully' };
}

/** Issue a new access token using a valid refresh token. */
async function refreshAccessToken(refreshToken) {
  if (!refreshToken) throw new AppError('Refresh token is required', 400);

  // Verify JWT signature first
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Check it exists in DB and is not expired
  const hash = _hashToken(refreshToken);
  const { rows } = await db.query(
    'SELECT id, expires_at FROM refresh_tokens WHERE token_hash = ? AND user_id = ?',
    [hash, payload.id]
  );

  if (rows.length === 0) throw new AppError('Refresh token not found or already revoked', 401);
  if (new Date(rows[0].expires_at) < new Date()) {
    await db.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [hash]);
    throw new AppError('Refresh token expired. Please log in again.', 401);
  }

  // Get current user data
  const { rows: userRows } = await db.query(
    'SELECT id, email, username, role, level, is_banned FROM users WHERE id = ?',
    [payload.id]
  );
  if (userRows.length === 0) throw new AppError('User not found', 404);
  if (userRows[0].is_banned)  throw new AppError('Account is banned', 403);

  const newAccessToken = _generateAccessToken(userRows[0]);

  return { access_token: newAccessToken };
}

/** Get current user profile from their token. */
async function getMe(userId) {
  const { rows } = await db.query(
    `SELECT id, email, username, role, exp_total, level,
            wallet_balance, avatar_url, is_verified, created_at
     FROM users WHERE id = ?`,
    [userId]
  );
  if (rows.length === 0) throw new AppError('User not found', 404);
  return rows[0];
}

/** Verify email using a raw token (sent via email link). */
async function verifyEmail(token) {
  if (!token) throw new AppError('Token is required', 400);

  const hash = _hashToken(token);
  const { rows } = await db.query(
    'SELECT id, user_id, expires_at, used_at FROM email_verifications WHERE token_hash = ?',
    [hash]
  );

  if (rows.length === 0) throw new AppError('Invalid verification token', 400);
  if (rows[0].used_at)   throw new AppError('Token has already been used', 400);
  if (new Date(rows[0].expires_at) < new Date()) {
    throw new AppError('Verification token expired. Request a new one.', 400);
  }

  const client = await db.getClient();
  try {
    await client.beginTransaction();
    await client.execute('UPDATE users SET is_verified = 1, updated_at = NOW() WHERE id = ?', [rows[0].user_id]);
    await client.execute('UPDATE email_verifications SET used_at = NOW() WHERE id = ?', [rows[0].id]);
    await client.commit();
  } catch (err) {
    await client.rollback();
    throw err;
  } finally {
    client.release();
  }

  return { message: 'Email verified successfully' };
}

/**
 * Resend email verification token.
 * Invalidates all previous unused tokens for the user.
 */
async function resendVerification(userId) {
  const { rows } = await db.query(
    'SELECT id, is_verified FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0)  throw new AppError('User not found', 404);
  if (rows[0].is_verified) throw new AppError('Email is already verified', 400);

  // Expire old tokens
  await db.query(
    "UPDATE email_verifications SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL",
    [userId]
  );

  const token       = _randomToken();
  const hash        = _hashToken(token);
  const expiresAt   = new Date(Date.now() + 24 * 3600 * 1000);
  const id          = crypto.randomUUID();

  await db.query(
    'INSERT INTO email_verifications (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [id, userId, hash, expiresAt]
  );

  return {
    message: 'Verification email sent.',
    verify_token: process.env.NODE_ENV !== 'production' ? token : undefined,
  };
}

/**
 * Initiate forgot password — creates a reset token.
 * Always returns success (avoid user enumeration).
 */
async function forgotPassword(email) {
  const { rows } = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email.toLowerCase()]
  );

  // Always return OK — don't reveal whether email exists
  if (rows.length === 0) {
    return { message: 'If that email is registered, a reset link has been sent.' };
  }

  const userId = rows[0].id;

  // Expire old unused tokens
  await db.query(
    "UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL",
    [userId]
  );

  const token     = _randomToken();
  const hash      = _hashToken(token);
  const expiresAt = new Date(Date.now() + 1 * 3600 * 1000); // 1 hour
  const id        = crypto.randomUUID();

  await db.query(
    'INSERT INTO password_resets (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [id, userId, hash, expiresAt]
  );

  // In production: send token via email. Returning here for dev/testing only.
  return {
    message: 'If that email is registered, a reset link has been sent.',
    reset_token: process.env.NODE_ENV !== 'production' ? token : undefined,
  };
}

/** Reset password using the raw token + new password. */
async function resetPassword(token, newPassword) {
  if (!token)       throw new AppError('Token is required', 400);
  if (!newPassword) throw new AppError('New password is required', 400);

  const hash = _hashToken(token);
  const { rows } = await db.query(
    'SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = ?',
    [hash]
  );

  if (rows.length === 0) throw new AppError('Invalid reset token', 400);
  if (rows[0].used_at)   throw new AppError('Token has already been used', 400);
  if (new Date(rows[0].expires_at) < new Date()) {
    throw new AppError('Reset token expired. Request a new one.', 400);
  }

  const password_hash = await bcrypt.hash(newPassword, 12);

  const client = await db.getClient();
  try {
    await client.beginTransaction();
    await client.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [password_hash, rows[0].user_id]
    );
    await client.execute(
      'UPDATE password_resets SET used_at = NOW() WHERE id = ?',
      [rows[0].id]
    );
    // Revoke all refresh tokens — force re-login everywhere
    await client.execute(
      'DELETE FROM refresh_tokens WHERE user_id = ?',
      [rows[0].user_id]
    );
    await client.commit();
  } catch (err) {
    await client.rollback();
    throw err;
  } finally {
    client.release();
  }

  return { message: 'Password reset successfully. Please log in with your new password.' };
}

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};
