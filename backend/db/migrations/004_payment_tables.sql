-- =============================================
-- BookSteam — Payment Tables (MySQL)
-- =============================================

CREATE TABLE IF NOT EXISTS transactions (
    id                      CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
    user_id                 CHAR(36)      NOT NULL,
    book_id                 CHAR(36)      NOT NULL,
    amount                  DECIMAL(15,2) NOT NULL,
    payment_method          ENUM('wallet','gopay','ovo','shopeepay','qris','credit_card') NOT NULL,
    status                  ENUM('pending','completed','refunded') NOT NULL DEFAULT 'pending',
    midtrans_order_id       VARCHAR(100)  UNIQUE,
    midtrans_transaction_id VARCHAR(100),
    midtrans_payment_url    TEXT,
    return_window_expires_at DATETIME,
    purchase_at             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at            DATETIME,
    created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tx_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tx_user_id   ON transactions(user_id);
CREATE INDEX idx_tx_book_id   ON transactions(book_id);
CREATE INDEX idx_tx_status    ON transactions(status);
CREATE INDEX idx_tx_order_id  ON transactions(midtrans_order_id);

-- =============================================
CREATE TABLE IF NOT EXISTS revenue_splits (
    id                CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
    transaction_id    CHAR(36)      NOT NULL,
    publisher_id      CHAR(36)      NOT NULL,
    total_amount      DECIMAL(15,2) NOT NULL,
    publisher_share   DECIMAL(15,2) NOT NULL,
    platform_share    DECIMAL(15,2) NOT NULL,
    publisher_percent DECIMAL(5,2)  NOT NULL DEFAULT 65.00,
    status            ENUM('holding','released','refunded') NOT NULL DEFAULT 'holding',
    release_at        DATETIME,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_rs_transaction (transaction_id),
    CONSTRAINT fk_rs_tx        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_rs_publisher FOREIGN KEY (publisher_id)   REFERENCES publisher_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_rs_publisher_id ON revenue_splits(publisher_id);
CREATE INDEX idx_rs_status        ON revenue_splits(status);

-- =============================================
CREATE TABLE IF NOT EXISTS libraries (
    id              CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    user_id         CHAR(36)     NOT NULL,
    book_id         CHAR(36)     NOT NULL,
    transaction_id  CHAR(36)     NOT NULL,
    progress_pages  INT          NOT NULL DEFAULT 0,
    progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    last_read_at    DATETIME,
    acquired_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_library_user_book (user_id, book_id),
    CONSTRAINT fk_lib_user FOREIGN KEY (user_id)        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_lib_book FOREIGN KEY (book_id)        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_lib_tx   FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_lib_user_id ON libraries(user_id);
CREATE INDEX idx_lib_book_id ON libraries(book_id);

-- =============================================
CREATE TABLE IF NOT EXISTS top_up_history (
    id                      CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
    user_id                 CHAR(36)      NOT NULL,
    amount                  DECIMAL(15,2) NOT NULL,
    payment_method          ENUM('gopay','ovo','shopeepay','qris','credit_card') NOT NULL,
    midtrans_order_id       VARCHAR(100)  UNIQUE,
    midtrans_transaction_id VARCHAR(100),
    midtrans_payment_url    TEXT,
    status                  ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
    created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tuh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tuh_user_id  ON top_up_history(user_id);
CREATE INDEX idx_tuh_order_id ON top_up_history(midtrans_order_id);

-- =============================================
CREATE TABLE IF NOT EXISTS refund_requests (
    id             CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
    transaction_id CHAR(36)    NOT NULL,
    user_id        CHAR(36)    NOT NULL,
    status         ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    reason         TEXT,
    requested_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at   DATETIME,
    updated_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_refund_tx (transaction_id),
    CONSTRAINT fk_rf_tx   FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_rf_user FOREIGN KEY (user_id)        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
