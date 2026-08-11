const crypto   = require('crypto');
const db       = require('../../config/database');
const midtrans = require('../../config/midtransHelper');
const { AppError } = require('../../middlewares/errorHandler');

// Revenue split constants
const PUBLISHER_PERCENT = 65.00;
const PLATFORM_PERCENT  = 35.00;

// Return window in days per book type
const RETURN_WINDOW_DAYS = { novel: 5, textbook: 5, journal: 5, comic: 1 };

/**
 * Buy a book.
 * - payment_method = 'wallet'        → immediate deduction, tx completed instantly
 * - payment_method = anything else   → Midtrans Snap, tx stays 'pending' until webhook
 */
async function checkout(userId, { bookId, payment_method }) {
  // ── 1. Validate book ──────────────────────────────────────────────────
  const { rows: bookRows } = await db.query(
    `SELECT b.id, b.title, b.price, b.book_type, b.publisher_id, b.status
     FROM books b WHERE b.id = ? AND b.status = 'approved'`,
    [bookId]
  );
  if (bookRows.length === 0) throw new AppError('Book not found or not available', 404);

  const book = bookRows[0];
  if (book.price <= 0) throw new AppError('This book is free — no checkout needed', 400);

  // ── 2. Check not already owned ───────────────────────────────────────
  const { rows: owned } = await db.query(
    `SELECT id FROM libraries
     WHERE user_id = ? AND book_id = ?`,
    [userId, bookId]
  );
  if (owned.length > 0) throw new AppError('You already own this book', 409);

  // Check no pending transaction for same book
  const { rows: pendingTx } = await db.query(
    `SELECT id FROM transactions
     WHERE user_id = ? AND book_id = ? AND status = 'pending'`,
    [userId, bookId]
  );
  if (pendingTx.length > 0) throw new AppError('You have a pending transaction for this book', 409);

  // ── 3. Get user info ──────────────────────────────────────────────────
  const { rows: userRows } = await db.query(
    'SELECT id, email, username, wallet_balance FROM users WHERE id = ?',
    [userId]
  );
  if (userRows.length === 0) throw new AppError('User not found', 404);
  const user = userRows[0];

  // ── 4. Get publisher profile id ───────────────────────────────────────
  const { rows: pubRows } = await db.query(
    'SELECT id FROM publisher_profiles WHERE id = ?',
    [book.publisher_id]
  );
  if (pubRows.length === 0) throw new AppError('Publisher not found', 500);
  const publisherId = pubRows[0].id;

  const windowDays     = RETURN_WINDOW_DAYS[book.book_type] || 5;
  const returnWindowAt = new Date(Date.now() + windowDays * 24 * 3600 * 1000);
  const txId           = crypto.randomUUID();

  // ── 5. WALLET payment — atomic transaction ────────────────────────────
  if (payment_method === 'wallet') {
    if (parseFloat(user.wallet_balance) < parseFloat(book.price)) {
      throw new AppError('Insufficient wallet balance. Please top up first.', 400);
    }

    const publisherShare = parseFloat((book.price * PUBLISHER_PERCENT / 100).toFixed(2));
    const platformShare  = parseFloat((book.price * PLATFORM_PERCENT  / 100).toFixed(2));
    const rsId           = crypto.randomUUID();
    const libId          = crypto.randomUUID();

    const client = await db.getClient();
    try {
      await client.beginTransaction();

      // Deduct wallet
      await client.execute(
        'UPDATE users SET wallet_balance = wallet_balance - ?, updated_at = NOW() WHERE id = ?',
        [book.price, userId]
      );

      // Create completed transaction
      await client.execute(
        `INSERT INTO transactions
          (id, user_id, book_id, amount, payment_method, status,
           return_window_expires_at, purchase_at, completed_at)
         VALUES (?, ?, ?, ?, 'wallet', 'completed', ?, NOW(), NOW())`,
        [txId, userId, bookId, book.price, returnWindowAt]
      );

      // Create revenue split (holding until return window expires)
      await client.execute(
        `INSERT INTO revenue_splits
          (id, transaction_id, publisher_id, total_amount, publisher_share, platform_share,
           publisher_percent, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'holding')`,
        [rsId, txId, publisherId, book.price, publisherShare, platformShare, PUBLISHER_PERCENT]
      );

      // Add to library
      await client.execute(
        `INSERT INTO libraries (id, user_id, book_id, transaction_id)
         VALUES (?, ?, ?, ?)`,
        [libId, userId, bookId, txId]
      );

      // Increment sales count
      await client.execute(
        'UPDATE books SET sales_count = sales_count + 1, updated_at = NOW() WHERE id = ?',
        [bookId]
      );

      // EXP +50 for purchase
      const expId = crypto.randomUUID();
      await client.execute(
        `INSERT INTO exp_events (id, user_id, exp_amount, source, reference_id, description)
         VALUES (?, ?, 50, 'purchase', ?, ?)`,
        [expId, userId, txId, `Purchased: ${book.title}`]
      );
      await client.execute(
        `UPDATE users
         SET exp_total = exp_total + 50,
             level = FLOOR(1 + SQRT(exp_total + 50) / 10),
             updated_at = NOW()
         WHERE id = ?`,
        [userId]
      );

      await client.commit();
    } catch (err) {
      await client.rollback();
      throw err;
    } finally {
      client.release();
    }

    return {
      message: 'Purchase successful',
      transaction_id: txId,
      payment_method: 'wallet',
      amount: book.price,
      book_title: book.title,
      return_window_expires_at: returnWindowAt,
    };
  }

  // ── 6. MIDTRANS payment ───────────────────────────────────────────────
  const orderId = `BS-BOOK-${txId}`;

  // Create pending transaction first
  await db.query(
    `INSERT INTO transactions
      (id, user_id, book_id, amount, payment_method, status,
       midtrans_order_id, return_window_expires_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [txId, userId, bookId, book.price, payment_method, orderId, returnWindowAt]
  );

  try {
    const snapResult = await midtrans.createSnapTransaction({
      orderId,
      grossAmount: book.price,
      customerDetails: {
        first_name: user.username,
        email:      user.email,
      },
      itemDetails: [{
        id:       bookId,
        price:    Math.round(book.price),
        quantity: 1,
        name:     book.title.substring(0, 50),
      }],
      paymentType: payment_method !== 'wallet' ? payment_method : undefined,
    });

    await db.query(
      'UPDATE transactions SET midtrans_payment_url = ?, updated_at = NOW() WHERE id = ?',
      [snapResult.redirect_url, txId]
    );

    return {
      message:         'Payment initiated. Complete payment via the provided URL.',
      transaction_id:  txId,
      payment_method,
      amount:          book.price,
      book_title:      book.title,
      snap_token:      snapResult.snap_token,
      payment_url:     snapResult.redirect_url,
      return_window_expires_at: returnWindowAt,
    };
  } catch (err) {
    // Clean up pending tx if Midtrans call fails
    await db.query('DELETE FROM transactions WHERE id = ?', [txId]);
    throw new AppError(`Payment gateway error: ${err.message}`, 502);
  }
}

module.exports = { checkout };
