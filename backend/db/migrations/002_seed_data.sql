-- =============================================
-- BookSteam — Seed Data for Development (MySQL)
-- =============================================

-- =============================================
-- USERS (admin + publishers + regular users)
-- =============================================

INSERT INTO users (id, email, username, password_hash, role, exp_total, level, is_verified) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'admin@booksteam.com',      'admin',           '$2b$10$placeholder_admin_hash', 'admin',     0,    1, 1),
    ('a0000000-0000-0000-0000-000000000002', 'gramedia@publisher.com',   'gramedia_official','$2b$10$placeholder_hash_1',    'publisher', 0,    1, 1),
    ('a0000000-0000-0000-0000-000000000003', 'mizan@publisher.com',      'mizan_books',     '$2b$10$placeholder_hash_2',    'publisher', 0,    1, 1),
    ('a0000000-0000-0000-0000-000000000004', 'indie@publisher.com',      'indie_author',    '$2b$10$placeholder_hash_3',    'publisher', 0,    1, 1),
    ('a0000000-0000-0000-0000-000000000005', 'budi@mail.com',            'budi_reader',     '$2b$10$placeholder_hash_4',    'user',      750,  6, 1),
    ('a0000000-0000-0000-0000-000000000006', 'sari@mail.com',            'sari_bookworm',   '$2b$10$placeholder_hash_5',    'user',      1200, 8, 1),
    ('a0000000-0000-0000-0000-000000000007', 'andi@mail.com',            'andi_reader',     '$2b$10$placeholder_hash_6',    'user',      200,  3, 1);

-- =============================================
-- PUBLISHER PROFILES
-- =============================================

INSERT INTO publisher_profiles (id, user_id, display_name, bio, status, approved_at) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002',
     'Gramedia Pustaka', 'Penerbit buku terbesar di Indonesia dengan koleksi ribuan judul.', 'approved', NOW()),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003',
     'Mizan Publishing', 'Grup penerbit yang menghadirkan buku-buku berkualitas untuk keluarga Indonesia.', 'approved', NOW()),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004',
     'Indie Author Press', 'Platform untuk penulis independen Indonesia.', 'approved', NOW());

-- =============================================
-- BOOKS
-- =============================================

INSERT INTO books (id, publisher_id, title, description, cover_url, price, book_type, genre, language, is_family_shareable, is_featured, status, total_pages, avg_rating, review_count, sales_count, published_at) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
     'Laskar Pelangi', 'Kisah inspiratif tentang sepuluh anak Belitung yang berjuang mengejar impian mereka melalui pendidikan.',
     '/covers/laskar-pelangi.jpg', 89000.00, 'novel', 'fiction', 'id', 1, 1, 'approved', 529, 4.70, 342, 15200, '2024-01-15 00:00:00'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
     'Bumi Manusia', 'Tetralogi Buru karya Pramoedya Ananta Toer. Kisah perjuangan kaum pribumi di era kolonial Belanda.',
     '/covers/bumi-manusia.jpg', 95000.00, 'novel', 'fiction', 'id', 1, 1, 'approved', 535, 4.85, 521, 22300, '2023-11-20 00:00:00'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001',
     'Atomic Habits', 'Terjemahan bestseller James Clear tentang bagaimana kebiasaan kecil bisa mengubah hidup.',
     '/covers/atomic-habits.jpg', 109000.00, 'novel', 'self-help', 'id', 0, 1, 'approved', 352, 4.60, 876, 45000, '2024-03-01 00:00:00'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001',
     'Sapiens', 'Yuval Noah Harari menjelajahi sejarah manusia dari zaman batu hingga era digital.',
     '/covers/sapiens.jpg', 125000.00, 'novel', 'science', 'id', 1, 0, 'approved', 464, 4.50, 298, 12000, '2024-02-10 00:00:00'),
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001',
     'Filosofi Teras', 'Filosofi Stoa untuk kehidupan modern Indonesia oleh Henry Manampiring.',
     '/covers/filosofi-teras.jpg', 78000.00, 'novel', 'philosophy', 'id', 1, 0, 'approved', 320, 4.40, 205, 18500, '2024-05-20 00:00:00'),
    ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002',
     'Si Anak Kuat', 'Kisah anak-anak petualang yang belajar tentang persahabatan dan keberanian di pedesaan Jawa.',
     '/covers/si-anak-kuat.jpg', 55000.00, 'novel', 'children', 'id', 1, 0, 'approved', 180, 4.30, 89, 5600, '2024-06-10 00:00:00'),
    ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002',
     'Matematika Asyik untuk SMA', 'Buku pelajaran matematika dengan pendekatan fun dan visual untuk siswa SMA.',
     '/covers/matematika-asyik.jpg', 65000.00, 'textbook', 'education', 'id', 0, 0, 'approved', 400, 4.10, 45, 3200, '2024-04-15 00:00:00'),
    ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002',
     'Sejarah Nusantara Modern', 'Kompilasi jurnal akademik tentang sejarah Indonesia dari Sriwijaya hingga Reformasi.',
     '/covers/sejarah-nusantara.jpg', 145000.00, 'journal', 'history', 'id', 0, 0, 'approved', 620, 4.20, 32, 1800, '2024-07-01 00:00:00'),
    ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000002',
     'Ayat-Ayat Cinta', 'Novel best-seller karya Habiburrahman El Shirazy tentang cinta, iman, dan pengorbanan di Mesir.',
     '/covers/ayat-ayat-cinta.jpg', 82000.00, 'novel', 'romance', 'id', 1, 0, 'approved', 418, 4.55, 410, 25000, '2023-12-05 00:00:00'),
    ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002',
     'Negeri 5 Menara', 'Kisah persahabatan enam santri di sebuah pesantren dan impian besar mereka.',
     '/covers/negeri-5-menara.jpg', 75000.00, 'novel', 'fiction', 'id', 1, 1, 'approved', 365, 4.65, 312, 19800, '2024-01-25 00:00:00'),
    ('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000003',
     'Kode Nusantara', 'Thriller sci-fi Indonesia tentang programmer yang menemukan kode tersembunyi di candi Borobudur.',
     '/covers/kode-nusantara.jpg', 49000.00, 'novel', 'sci-fi', 'id', 1, 0, 'approved', 280, 4.35, 67, 3400, '2024-08-01 00:00:00'),
    ('c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000003',
     'Pahlawan Komik: Vol 1', 'Komik aksi Indonesia dengan superhero lokal yang melindungi Jakarta.',
     '/covers/pahlawan-komik.jpg', 35000.00, 'comic', 'action', 'id', 0, 0, 'approved', 96, 4.25, 156, 8700, '2024-07-15 00:00:00'),
    ('c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000003',
     'Cerita Rakyat Nusantara: Manga Edition', 'Kumpulan cerita rakyat Indonesia dalam format manga modern.',
     '/covers/cerita-rakyat-manga.jpg', 42000.00, 'comic', 'folklore', 'id', 1, 1, 'approved', 128, 4.45, 198, 11200, '2024-06-25 00:00:00'),
    ('c0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000003',
     'Python untuk Pemula', 'Panduan belajar pemrograman Python dari nol dengan contoh project Indonesia.',
     '/covers/python-pemula.jpg', 72000.00, 'textbook', 'technology', 'id', 0, 0, 'approved', 350, 4.15, 88, 4200, '2024-05-01 00:00:00'),
    ('c0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000003',
     'Jurnal Psikologi Remaja Indonesia', 'Kumpulan penelitian tentang kesehatan mental remaja di era digital.',
     '/covers/jurnal-psikologi.jpg', 95000.00, 'journal', 'psychology', 'id', 0, 0, 'approved', 280, 3.90, 15, 620, '2024-08-05 00:00:00');

-- =============================================
-- BOOK TAGS
-- =============================================

INSERT INTO book_tags (book_id, tag) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'inspiratif'),
    ('c0000000-0000-0000-0000-000000000001', 'pendidikan'),
    ('c0000000-0000-0000-0000-000000000001', 'indonesia'),
    ('c0000000-0000-0000-0000-000000000002', 'sastra'),
    ('c0000000-0000-0000-0000-000000000002', 'sejarah'),
    ('c0000000-0000-0000-0000-000000000002', 'kolonial'),
    ('c0000000-0000-0000-0000-000000000003', 'produktivitas'),
    ('c0000000-0000-0000-0000-000000000003', 'kebiasaan'),
    ('c0000000-0000-0000-0000-000000000003', 'bestseller'),
    ('c0000000-0000-0000-0000-000000000004', 'sejarah'),
    ('c0000000-0000-0000-0000-000000000004', 'sains'),
    ('c0000000-0000-0000-0000-000000000005', 'stoicism'),
    ('c0000000-0000-0000-0000-000000000005', 'self-improvement'),
    ('c0000000-0000-0000-0000-000000000006', 'anak-anak'),
    ('c0000000-0000-0000-0000-000000000006', 'petualangan'),
    ('c0000000-0000-0000-0000-000000000007', 'matematika'),
    ('c0000000-0000-0000-0000-000000000007', 'sma'),
    ('c0000000-0000-0000-0000-000000000008', 'akademik'),
    ('c0000000-0000-0000-0000-000000000008', 'sejarah'),
    ('c0000000-0000-0000-0000-000000000009', 'islami'),
    ('c0000000-0000-0000-0000-000000000009', 'romansa'),
    ('c0000000-0000-0000-0000-000000000010', 'pesantren'),
    ('c0000000-0000-0000-0000-000000000010', 'persahabatan'),
    ('c0000000-0000-0000-0000-000000000011', 'sci-fi'),
    ('c0000000-0000-0000-0000-000000000011', 'thriller'),
    ('c0000000-0000-0000-0000-000000000012', 'komik'),
    ('c0000000-0000-0000-0000-000000000012', 'superhero'),
    ('c0000000-0000-0000-0000-000000000013', 'manga'),
    ('c0000000-0000-0000-0000-000000000013', 'folklore'),
    ('c0000000-0000-0000-0000-000000000014', 'programming'),
    ('c0000000-0000-0000-0000-000000000014', 'python'),
    ('c0000000-0000-0000-0000-000000000015', 'psikologi'),
    ('c0000000-0000-0000-0000-000000000015', 'riset');

-- =============================================
-- REVIEWS
-- =============================================

INSERT INTO reviews (user_id, book_id, rating, content, is_approved, helpful_count, created_at) VALUES
    ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 5,
     'Buku yang sangat menginspirasi! Ceritanya bikin terharu dan semangat.', 1, 45, '2024-02-01 10:00:00'),
    ('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 4,
     'Ceritanya bagus, menggambarkan perjuangan pendidikan di daerah terpencil.', 1, 23, '2024-02-15 14:30:00'),
    ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 5,
     'Masterpiece sastra Indonesia. Pramoedya adalah jenius.', 1, 89, '2024-01-10 09:00:00'),
    ('a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002', 5,
     'Tidak ada kata yang cukup untuk mendeskripsikan betapa bagusnya novel ini.', 1, 67, '2024-01-20 16:00:00'),
    ('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 5,
     'Bukunya sangat praktis dan actionable. Langsung bisa diterapkan di kehidupan sehari-hari.', 1, 112, '2024-04-01 08:00:00'),
    ('a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 4,
     'Bagus, tapi beberapa bagian terasa repetitif. Overall tetap recommended.', 1, 34, '2024-04-10 12:00:00'),
    ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000011', 4,
     'Konsep sci-fi Indonesia yang unik! Plot twist-nya keren. Nunggu volume 2.', 1, 18, '2024-08-10 20:00:00'),
    ('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000012', 4,
     'Art style-nya keren! Superhero Indonesia yang tidak terasa cringe.', 1, 25, '2024-07-20 15:00:00'),
    ('a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000012', 5,
     'Akhirnya komik superhero lokal yang berkualitas! Support penulis lokal!', 1, 31, '2024-07-25 11:00:00'),
    ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000013', 5,
     'Ide brilian! Cerita rakyat dalam format manga bikin generasi muda tertarik baca.', 1, 42, '2024-07-01 09:30:00');

-- =============================================
-- ADMIN EVENTS (homepage banners)
-- =============================================

INSERT INTO admin_events (id, admin_id, title, description, banner_url, link_url, start_date, end_date, is_active) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
     'Sale Kemerdekaan', 'Diskon hingga 45% untuk semua buku bertema Indonesia!',
     '/banners/merdeka-sale.jpg', '/store?tag=indonesia', '2024-08-01 00:00:00', '2024-08-31 23:59:59', 1),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
     'Penulis Baru Minggu Ini', 'Temukan karya-karya segar dari penulis independen Indonesia yang baru bergabung.',
     '/banners/new-authors.jpg', '/store?sort_by=newest', '2024-08-05 00:00:00', '2024-08-12 23:59:59', 1),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
     'Komik Lokal Festival', 'Eksplor dunia komik dan manga karya anak bangsa.',
     '/banners/comic-fest.jpg', '/store?book_type=comic', '2024-08-10 00:00:00', '2024-09-10 23:59:59', 1),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
     'Flash Sale Weekend', 'Hanya Sabtu-Minggu! Buku pilihan mulai dari Rp 25.000.',
     '/banners/flash-sale.jpg', '/store?max_price=50000', '2024-08-03 00:00:00', '2024-08-04 23:59:59', 0);
