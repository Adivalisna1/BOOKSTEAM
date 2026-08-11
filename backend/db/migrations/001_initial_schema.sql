-- =============================================
-- BookSteam — Initial Database Schema (MySQL)
-- =============================================

-- =============================================
-- TABLES
-- =============================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id          CHAR(36)       PRIMARY KEY DEFAULT (UUID()),
    email       VARCHAR(255)   UNIQUE NOT NULL,
    username    VARCHAR(50)    UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role        ENUM('public','user','publisher','admin') NOT NULL DEFAULT 'user',
    exp_total   INT            NOT NULL DEFAULT 0,
    level       INT            NOT NULL DEFAULT 1,
    wallet_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    avatar_url  TEXT,
    is_verified TINYINT(1)     NOT NULL DEFAULT 0,
    is_banned   TINYINT(1)     NOT NULL DEFAULT 0,
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PUBLISHER PROFILES
CREATE TABLE IF NOT EXISTS publisher_profiles (
    id               CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    user_id          CHAR(36)     NOT NULL,
    display_name     VARCHAR(100) NOT NULL,
    bio              TEXT,
    document_url     TEXT,
    status           ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    balance_pending  DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    balance_available DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    approved_at      DATETIME,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_publisher_user (user_id),
    CONSTRAINT fk_pp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BOOKS
CREATE TABLE IF NOT EXISTS books (
    id                 CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    publisher_id       CHAR(36)     NOT NULL,
    title              VARCHAR(255) NOT NULL,
    description        TEXT,
    cover_url          TEXT,
    file_url           TEXT,
    price              DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    book_type          ENUM('novel','comic','textbook','journal') NOT NULL DEFAULT 'novel',
    genre              VARCHAR(50)  NOT NULL DEFAULT 'uncategorized',
    language           VARCHAR(20)  NOT NULL DEFAULT 'id',
    is_family_shareable TINYINT(1)  NOT NULL DEFAULT 0,
    is_early_access    TINYINT(1)   NOT NULL DEFAULT 0,
    is_featured        TINYINT(1)   NOT NULL DEFAULT 0,
    status             ENUM('pending','approved','rejected','takedown') NOT NULL DEFAULT 'pending',
    total_pages        INT          NOT NULL DEFAULT 0,
    avg_rating         DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    review_count       INT          NOT NULL DEFAULT 0,
    sales_count        INT          NOT NULL DEFAULT 0,
    published_at       DATETIME,
    created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_book_publisher FOREIGN KEY (publisher_id) REFERENCES publisher_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BOOK TAGS
CREATE TABLE IF NOT EXISTS book_tags (
    id         CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
    book_id    CHAR(36)    NOT NULL,
    tag        VARCHAR(50) NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bt_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id           CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    user_id      CHAR(36)  NOT NULL,
    book_id      CHAR(36)  NOT NULL,
    rating       INT       NOT NULL,
    content      TEXT,
    is_approved  TINYINT(1) NOT NULL DEFAULT 0,
    helpful_count INT      NOT NULL DEFAULT 0,
    created_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_review_user_book (user_id, book_id),
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ADMIN EVENTS (Banners & Promotions)
CREATE TABLE IF NOT EXISTS admin_events (
    id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    admin_id    CHAR(36),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    banner_url  TEXT,
    link_url    TEXT,
    start_date  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date    DATETIME,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INDEXES (for query performance)
-- =============================================

CREATE INDEX idx_books_status       ON books(status);
CREATE INDEX idx_books_genre        ON books(genre);
CREATE INDEX idx_books_book_type    ON books(book_type);
CREATE INDEX idx_books_price        ON books(price);
CREATE INDEX idx_books_avg_rating   ON books(avg_rating DESC);
CREATE INDEX idx_books_published_at ON books(published_at DESC);
CREATE INDEX idx_books_is_featured  ON books(is_featured);
CREATE INDEX idx_books_sales_count  ON books(sales_count DESC);

-- Full-text search (MySQL native FULLTEXT)
ALTER TABLE books ADD FULLTEXT INDEX ft_books_title_desc (title, description);

CREATE INDEX idx_book_tags_book_id  ON book_tags(book_id);
CREATE INDEX idx_book_tags_tag      ON book_tags(tag);

CREATE INDEX idx_reviews_book_id    ON reviews(book_id);
CREATE INDEX idx_reviews_user_id    ON reviews(user_id);
CREATE INDEX idx_reviews_rating     ON reviews(rating);

CREATE INDEX idx_admin_events_active ON admin_events(is_active, start_date, end_date);
