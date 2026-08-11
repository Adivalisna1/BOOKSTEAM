const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Auth routes
const authRoutes    = require('./routes/authRoutes');
const friendRoutes  = require('./routes/friendRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Public routes
const bookRoutes    = require('./routes/public/bookRoutes');
const searchRoutes  = require('./routes/public/searchRoutes');
const genreRoutes   = require('./routes/public/genreRoutes');
const eventRoutes   = require('./routes/public/eventRoutes');

// Publisher routes
const publisherProfileRoutes   = require('./routes/publisher/publisherProfileRoutes');
const publisherBookRoutes      = require('./routes/publisher/publisherBookRoutes');
const publisherAnalyticsRoutes = require('./routes/publisher/publisherAnalyticsRoutes');
const publisherBalanceRoutes   = require('./routes/publisher/publisherBalanceRoutes');

// User routes
const userProfileRoutes      = require('./routes/user/userProfileRoutes');
const userLibraryRoutes      = require('./routes/user/userLibraryRoutes');
const userWishlistRoutes     = require('./routes/user/userWishlistRoutes');
const userReviewRoutes       = require('./routes/user/userReviewRoutes');
const userWalletRoutes       = require('./routes/user/userWalletRoutes');
const userNotificationRoutes = require('./routes/user/userNotificationRoutes');

// Admin routes
const adminBookRoutes      = require('./routes/admin/adminBookRoutes');
const adminEventRoutes     = require('./routes/admin/adminEventRoutes');
const adminUserRoutes      = require('./routes/admin/adminUserRoutes');
const adminPublisherRoutes = require('./routes/admin/adminPublisherRoutes');

// Middlewares
const { errorHandler }       = require('./middlewares/errorHandler');
const { authenticate, authorize } = require('./middlewares/auth');

const app = express();

// =============================================
// Security & Parsing Middleware
// =============================================
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// =============================================
// Logging
// =============================================
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// =============================================
// Health Check
// =============================================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'booksteam-api',
    timestamp: new Date().toISOString(),
  });
});

// =============================================
// Auth API Routes — no auth required (public)
// =============================================
app.use('/api/v1/auth', authRoutes);

// =============================================
// Payment & Checkout Routes
// (auth handled per-route inside paymentRoutes
//  because webhook must be public)
// =============================================
app.use('/api/v1', paymentRoutes);

// =============================================
// Public API Routes — no auth required
// =============================================
app.use('/api/v1/books',   bookRoutes);
app.use('/api/v1/search',  searchRoutes);
app.use('/api/v1/genres',  genreRoutes);
app.use('/api/v1/events',  eventRoutes);

// =============================================
// Publisher Apply — any logged-in user can apply
// =============================================
const publisherProfileController = require('./controllers/publisher/publisherProfileController');
const { body: bodyVal } = require('express-validator');
const { validateRequest: valReq } = require('./middlewares/validateRequest');

app.post(
  '/api/v1/publisher/apply',
  authenticate,
  authorize('user', 'publisher', 'admin'),
  [
    bodyVal('display_name').isString().trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('display_name is required'),
    bodyVal('bio').optional().isString().trim().isLength({ max: 1000 }),
    bodyVal('document_url').optional().isURL().withMessage('document_url must be a valid URL'),
  ],
  valReq,
  publisherProfileController.applyAsPublisher
);

// =============================================
// Publisher API Routes — JWT + publisher role
// =============================================
app.use('/api/v1/publisher/profile',   authenticate, authorize('publisher'), publisherProfileRoutes);
app.use('/api/v1/publisher/books',     authenticate, authorize('publisher'), publisherBookRoutes);
app.use('/api/v1/publisher/analytics', authenticate, authorize('publisher'), publisherAnalyticsRoutes);
app.use('/api/v1/publisher/balance',   authenticate, authorize('publisher'), publisherBalanceRoutes);

// =============================================
// Friends API Routes — JWT + any logged-in role
// =============================================
app.use(
  '/api/v1/friends',
  authenticate,
  authorize('user', 'publisher', 'admin'),
  friendRoutes
);

// =============================================
// User API Routes — JWT + user/publisher/admin role
// =============================================
app.use('/api/v1/user/profile',       authenticate, authorize('user', 'publisher', 'admin'), userProfileRoutes);
app.use('/api/v1/user/library',       authenticate, authorize('user', 'publisher', 'admin'), userLibraryRoutes);
app.use('/api/v1/user/wishlist',      authenticate, authorize('user', 'publisher', 'admin'), userWishlistRoutes);
app.use('/api/v1/user/reviews',       authenticate, authorize('user', 'publisher', 'admin'), userReviewRoutes);
app.use('/api/v1/user/wallet',        authenticate, authorize('user', 'publisher', 'admin'), userWalletRoutes);
app.use('/api/v1/user/notifications', authenticate, authorize('user', 'publisher', 'admin'), userNotificationRoutes);

// =============================================
// Admin API Routes — JWT + admin role required
// =============================================
app.use(
  '/api/v1/admin/books',
  authenticate,
  authorize('admin'),
  adminBookRoutes
);
app.use(
  '/api/v1/admin/events',
  authenticate,
  authorize('admin'),
  adminEventRoutes
);
app.use(
  '/api/v1/admin/users',
  authenticate,
  authorize('admin'),
  adminUserRoutes
);
app.use(
  '/api/v1/admin/publishers',
  authenticate,
  authorize('admin'),
  adminPublisherRoutes
);

// =============================================
// 404 Handler
// =============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// =============================================
// Global Error Handler (must be last)
// =============================================
app.use(errorHandler);

module.exports = app;
