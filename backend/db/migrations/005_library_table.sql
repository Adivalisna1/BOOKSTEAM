-- =============================================
-- Migration: Create Libraries Table
-- =============================================

CREATE TABLE IF NOT EXISTS libraries (
    id               CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    user_id          CHAR(36)     NOT NULL,
    book_id          CHAR(36)     NOT NULL,
    transaction_id   CHAR(36),
    progress_pages   INT          NOT NULL DEFAULT 0,
    progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    last_read_at     DATETIME,
    acquired_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_book (user_id, book_id),
    CONSTRAINT fk_lib_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_lib_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_libraries_user_id ON libraries(user_id);
CREATE INDEX idx_libraries_book_id ON libraries(book_id);
