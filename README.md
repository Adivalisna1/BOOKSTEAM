# 📚 BookSteam — Platform Jual Beli Buku Digital

> Platform jual beli dan baca buku digital bergaya Steam, dilengkapi sistem gamifikasi EXP, Family Sharing, dan ekosistem publisher terintegrasi.

---

## 📑 Daftar Isi

- [Gambaran Umum](#-gambaran-umum)
- [User Roles](#-user-roles)
- [Fitur Utama](#-fitur-utama)
- [Business Rules](#-business-rules)
  - [Return Policy](#return-policy)
  - [EXP & Leveling System](#exp--leveling-system)
  - [Family Sharing](#family-sharing)
  - [Revenue Share](#revenue-share)
  - [Sistem Pembayaran](#sistem-pembayaran)
- [Tech Stack](#-tech-stack)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Data Flow Diagram (DFD)](#-data-flow-diagram-dfd)
- [Workflow Diagram](#-workflow-diagram)
- [Activity Diagram](#-activity-diagram)
- [Flowchart](#-flowchart)
- [Database Map (ERD)](#-database-map-erd)
- [Halaman & Routing](#-halaman--routing)
- [Cara Menjalankan](#-cara-menjalankan-development)
- [Akun Development](#-akun-development-seed-data)
- [Roadmap Pengembangan](#-roadmap-pengembangan)

---

## 🌐 Gambaran Umum

BookSteam adalah platform buku digital yang mengadopsi model ekosistem Steam ke dunia literasi. User dapat membeli, membaca, dan meminjamkan buku digital. Publisher dapat menerbitkan karya mereka dan mendapatkan revenue. Seluruh aktivitas pengguna menghasilkan EXP yang digunakan untuk membuka fitur-fitur eksklusif.

---

## 👥 User Roles

| Role | Deskripsi |
|---|---|
| **Public** | Pengunjung tanpa akun. Dapat melihat landing page, homepage, katalog, halaman detail buku, dan menggunakan fitur search. **Tidak bisa** membeli atau membaca buku. |
| **User** | Public yang telah mendaftar (email + username + password). Dapat membeli buku, membaca buku yang dimiliki, melakukan return, dan menggunakan Family Sharing setelah level EXP mencukupi. |
| **Publisher / Jurnalis** | Akun yang telah diverifikasi admin. Dapat mengupload buku, mengedit harga dan metadata, serta melihat histori penjualan dan penarikan dana. |
| **Admin** | Pengelola platform. Dapat menghapus, mengedit, dan mengupload informasi & event di dashboard beranda, serta memoderasi buku dan publisher. |

---

## ⚡ Fitur Utama

### Untuk Public
- ✅ Lihat Landing Page
- ✅ Browse katalog buku
- ✅ Lihat halaman detail buku (judul, deskripsi, cover, harga)
- ✅ Search & filter buku

### Untuk User (Terdaftar)
- ✅ Semua fitur Public
- ✅ Beli buku via e-wallet, kartu kredit, atau Platform Wallet
- ✅ Top-up Platform Wallet
- ✅ Membaca buku yang dimiliki (Reader in-app)
- ✅ Return buku (sesuai policy)
- ✅ Wishlist
- ✅ Tulis review & rating
- ✅ Mendapatkan EXP dari aktivitas
- ✅ Family Sharing (unlock via EXP)
- ✅ Friendlist

### Untuk Publisher
- ✅ Upload buku baru (pending review admin)
- ✅ Edit harga & metadata buku
- ✅ Toggle Family Sharing per buku
- ✅ Lihat histori penjualan
- ✅ Request penarikan dana (withdrawal)

### Untuk Admin
- ✅ Review & approve/reject aplikasi publisher
- ✅ Review & approve/reject buku yang diupload
- ✅ Takedown buku yang melanggar aturan
- ✅ Kelola event & banner di beranda
- ✅ Manajemen user (ban/suspend)

---

## 📋 Business Rules

### Return Policy

| Tipe Buku | Return Window | Batas Progress Baca |
|---|---|---|
| Novel / Non-fiksi | **5 hari** setelah pembelian | Maksimal **30%** halaman dibaca |
| Komik / Manga / Webtoon | **1 hari** setelah pembelian | Maksimal **30%** halaman dibaca |

> **Catatan:** Refund dikembalikan ke Platform Wallet user, bukan ke metode pembayaran asal. EXP yang didapat dari pembelian tersebut juga ikut dikurangi saat return berhasil.

---

### EXP & Leveling System

#### Sumber EXP

| Aktivitas | EXP Didapat |
|---|---|
| Beli Buku | +50 EXP per buku |
| Selesai Membaca Buku | +100 EXP per buku |
| Tulis Review (diapprove) | +25 EXP per review |
| Login Harian | +5 EXP per hari (streak) |
| Referral (ajak teman) | +200 EXP per referral berhasil |
| Return Buku | **-50 EXP** (deduction) |

#### Level & Unlock

| Level | Total EXP | Fitur Terbuka |
|---|---|---|
| Level 1 | 0 EXP | Akun dasar, beli & baca buku |
| Level 5 | 500 EXP | 🔓 Family Sharing (maks. 3 anggota) |
| Level 10 | 1.500 EXP | 🔓 Family Sharing diperluas (maks. 6 anggota) |
| Level 15 | 3.000 EXP | 🔓 Early Access buku baru |

---

### Family Sharing

- Hanya bisa dibuat oleh user yang telah mencapai **Level 5 (500 EXP)**
- Owner membuat Family Group dan mengundang teman dari friendlist
- Publisher **bebas memilih** apakah buku mereka dapat di-share (toggle ON/OFF per buku)
- Buku yang di-share hanya dapat diakses satu orang pada satu waktu (owner **ATAU** anggota, tidak bersamaan)
- Jika owner return buku, akses family sharing untuk buku tersebut otomatis dicabut

---

### Revenue Share

```
Setiap penjualan buku:
├── Publisher mendapat: 65%
└── Platform mendapat:  35%
```

#### Alur Dana

1. User beli buku → Dana masuk **escrow** (ditahan)
2. Return window berjalan (1 atau 5 hari)
3. Jika **tidak di-return** → Dana dilepas → dibagi 65/35
4. Jika **di-return** → Refund penuh ke wallet user, tidak ada pembagian revenue
5. Publisher dapat request **withdrawal** setelah dana tersedia di balance

---

### Sistem Pembayaran

| Metode | Tipe |
|---|---|
| GoPay | E-wallet |
| OVO | E-wallet |
| ShopeePay | E-wallet |
| QRIS | E-wallet / QR |
| Visa / Mastercard | Kartu Kredit |
| Platform Wallet | Saldo internal (seperti Steam Wallet) |

> **Payment Gateway:** Midtrans (untuk e-wallet & kartu kredit)

---

## 🛠 Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS |
| **Backend** | Node.js 22 + Express |
| **Database** | MySQL 8.4 |
| **Cache / Session** | Redis 7 |
| **File Storage** | AWS S3 / Cloudflare R2 |
| **Payment** | Midtrans |
| **Email** | SendGrid / Nodemailer |
| **Auth** | JWT + Refresh Token |
| **Containerization** | Docker + Docker Compose |

---

## 🏗 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│          Next.js 14 (App Router + React Server Components)  │
│                    Tailwind CSS UI                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST API
┌──────────────────────────▼──────────────────────────────────┐
│                       API Layer                             │
│               Node.js 22 + Express — REST API               │
│               JWT Auth Middleware + RBAC                    │
└──────┬─────────────┬──────────────┬──────────────┬──────────┘
       │             │              │              │
┌──────▼──┐   ┌──────▼──┐   ┌──────▼──┐   ┌──────▼──────────┐
│Midtrans │   │  AWS S3  │   │SendGrid │   │  MySQL 8.4       │
│Payment  │   │  Storage │   │  Email  │   │  + Redis 7 Cache │
└─────────┘   └──────────┘   └─────────┘   └─────────────────┘

```

### 🐳 Arsitektur Docker

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Compose Stack                        │
│                      (booksteam_net)                            │
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────────────────────┐ │
│  │   booksteam_api  │      │         booksteam_migrate        │ │
│  │  (Node.js 22)    │      │   (run-once migration job)       │ │
│  │  :3000 → :3000   │      │   node src/config/runMigrations  │ │
│  └────────┬─────────┘      └──────────────┬───────────────────┘ │
│           │ depends_on (healthy)           │ depends_on (healthy)│
│           └──────────────┬────────────────┘                     │
│                          │                                      │
│            ┌─────────────▼──────────────┐                       │
│            │       booksteam_db         │                       │
│            │       MySQL 8.4            │                       │
│            │       :3306 → :3306        │                       │
│            │       volume: db_data      │                       │
│            └────────────────────────────┘                       │
│                                                                  │
│            ┌────────────────────────────┐                       │
│            │      booksteam_redis       │                       │
│            │      Redis 7-alpine        │                       │
│            │      :6379 → :6379         │                       │
│            │      volume: redis_data    │                       │
│            └────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### Struktur File

```
booksteam/
├── docker-compose.yml          ← Orkestrasi semua service
├── backend/
│   ├── Dockerfile              ← Multi-stage build (deps + runtime)
│   ├── .dockerignore
│   ├── .env                    ← Konfigurasi lokal (tidak masuk image)
│   ├── package.json
│   ├── db/
│   │   └── migrations/
│   │       ├── 001_initial_schema.sql
│   │       └── 002_seed_data.sql
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   ├── database.js     ← mysql2 connection pool
│       │   └── runMigrations.js
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/public/
│       └── services/
└── README.md
```

---

## 📊 Data Flow Diagram (DFD)

### Level 0 — Context Diagram

```mermaid
graph LR
    PUBLIC([👤 Public])
    USER([👤 User Terdaftar])
    PUBLISHER([📰 Publisher])
    ADMIN([🛡️ Admin])
    PAYMENT([💳 Payment Gateway Midtrans])
    STORAGE([☁️ Cloud Storage S3])

    PUBLIC -->|Browse, Search, Lihat Buku| SYSTEM((📚 BookSteam Platform))
    USER -->|Beli, Baca, Return, Family Share| SYSTEM
    PUBLISHER -->|Upload, Edit, Tarik Dana| SYSTEM
    ADMIN -->|Kelola User, Buku, Event| SYSTEM
    SYSTEM -->|Request Pembayaran| PAYMENT
    PAYMENT -->|Konfirmasi Transaksi| SYSTEM
    SYSTEM -->|Upload/Download File Buku| STORAGE
    STORAGE -->|Signed URL Konten| SYSTEM
```

---

### Level 1 — Proses Utama

```mermaid
graph TB
    subgraph EXTERNAL["External Entities"]
        U([User])
        P([Publisher])
        A([Admin])
        PG([Payment Gateway])
    end

    subgraph PROCESSES["Proses Utama"]
        P1[1.0 Manajemen Akun dan Auth]
        P2[2.0 Manajemen Buku dan Katalog]
        P3[3.0 Transaksi dan Pembayaran]
        P4[4.0 Reader dan Library]
        P5[5.0 Family Sharing dan Social]
        P6[6.0 EXP dan Gamifikasi]
        P7[7.0 Revenue dan Withdrawal]
        P8[8.0 Admin Panel dan Moderasi]
    end

    subgraph DATASTORES["Data Store"]
        D1[(Users)]
        D2[(Books)]
        D3[(Transactions)]
        D4[(Library)]
        D5[(Family Groups)]
        D6[(EXP Events)]
        D7[(Publisher Balance)]
        D8[(Admin Events)]
    end

    U -->|Login/Register| P1
    P1 <--> D1
    U -->|Browse/Upload Buku| P2
    P -->|Upload Buku| P2
    P2 <--> D2
    U -->|Beli/Return| P3
    P3 -->|Request Bayar| PG
    PG -->|Callback| P3
    P3 <--> D3
    U -->|Baca Buku| P4
    P4 <--> D4
    U -->|Buat/Join Group| P5
    P5 <--> D5
    P3 -->|Trigger EXP| P6
    P6 <--> D6
    P -->|Lihat dan Tarik Dana| P7
    P3 -->|Split Revenue| P7
    P7 <--> D7
    A -->|Kelola Platform| P8
    P8 <--> D8
    P8 <--> D1
    P8 <--> D2
```

---

### Level 2 — Detail Alur Transaksi & Escrow

```mermaid
graph TB
    U([User])
    PG([Payment Gateway])

    U -->|Pilih buku dan klik beli| P3_1[3.1 Validasi Saldo Wallet]
    P3_1 -->|Saldo cukup| P3_2[3.2 Buat Order dan Invoice]
    P3_1 -->|Saldo kurang| P3_3[3.3 Top-up Wallet]
    P3_3 -->|Redirect| PG
    PG -->|Konfirmasi top-up| P3_3
    P3_3 -->|Saldo updated| P3_2
    P3_2 -->|Potong wallet| P3_4[3.4 Escrow Dana]
    P3_4 -->|Akses diberikan| P3_5[3.5 Update Library User]
    P3_4 -->|Mulai countdown| P3_6[3.6 Return Window Timer]
    P3_6 -->|Window expired| P3_7[3.7 Release Dana 65/35 Split]
    P3_6 -->|User minta return| P3_8[3.8 Validasi Return Eligibility]
    P3_8 -->|Eligible| P3_9[3.9 Refund ke Wallet]
    P3_8 -->|Tidak eligible| P3_10[3.10 Tolak Return]
    P3_7 -->|65 persen| D7[(Publisher Balance)]
    P3_7 -->|35 persen| D8[(Platform Revenue)]
    D1[(Wallet User)]
    P3_1 <--> D1
    P3_3 --> D1
    P3_9 --> D1
```

---

## 🔀 Workflow Diagram

### User Journey Lengkap

```mermaid
flowchart TD
    START([Kunjungi Website]) --> LANDING[Lihat Landing Page]
    LANDING --> BROWSE[Browse Katalog Buku]
    BROWSE --> DETAIL[Lihat Detail Buku]
    DETAIL --> AUTH{Sudah Login?}

    AUTH -->|Tidak| REG[Register atau Login]
    AUTH -->|Ya| OWNED{Sudah Punya Buku ini?}
    REG --> OWNED

    OWNED -->|Ya| READ[Baca Buku]
    OWNED -->|Tidak| CART[Tambah ke Cart atau Beli Langsung]

    CART --> WALLET{Saldo Cukup?}
    WALLET -->|Ya| CHECKOUT[Checkout dan Bayar]
    WALLET -->|Tidak| TOPUP[Top-up Wallet]
    TOPUP --> PGWAY[Payment Gateway GoPay atau OVO atau Kredit]
    PGWAY --> WALLET

    CHECKOUT --> SUCCESS[Pembelian Berhasil]
    SUCCESS --> LIB[Buku Masuk Library]
    SUCCESS --> EXP[EXP Ditambahkan]
    LIB --> READ

    READ --> RETURN{Mau Return?}
    RETURN -->|Ya| CHECK_RETURN{Eligible? Max 30 persen dibaca dan dalam window}
    CHECK_RETURN -->|Ya| REFUND[Refund ke Wallet]
    CHECK_RETURN -->|Tidak| DENIED[Return Ditolak]
    RETURN -->|Tidak| FINISH([Selesai Membaca])
```

---

### Publisher Journey

```mermaid
flowchart TD
    START([Publisher Daftar]) --> APPLY[Isi Form Aplikasi Publisher]
    APPLY --> SUBMIT[Submit dan Upload Dokumen Verifikasi]
    SUBMIT --> WAIT[Menunggu Review Admin]

    WAIT --> DECISION{Admin Memutuskan}
    DECISION -->|Ditolak| REJECT[Notifikasi Ditolak beserta Alasan]
    DECISION -->|Disetujui| APPROVED[Akun Publisher Aktif]

    APPROVED --> DASHBOARD[Masuk Publisher Dashboard]
    DASHBOARD --> UPLOAD[Upload Buku Baru]

    UPLOAD --> FILL[Isi Metadata Judul Deskripsi Genre Harga Tipe Cover]
    FILL --> TOGGLE[Set Family Sharing ON atau OFF]
    TOGGLE --> SUBMIT_BOOK[Submit untuk Review Admin]

    SUBMIT_BOOK --> REVIEW{Admin Review Buku}
    REVIEW -->|Ditolak| REJECTED_BOOK[Buku Ditolak beserta Feedback]
    REVIEW -->|Disetujui| LIVE[Buku Live di Platform]

    LIVE --> SALES[Buku Mulai Terjual]
    SALES --> REVENUE[Revenue Masuk Publisher Balance 65 persen]
    REVENUE --> WITHDRAW_REQ[Request Withdraw setelah Window Expired]
    WITHDRAW_REQ --> TRANSFER[Transfer ke Rekening Bank]
```

---

### Admin Moderasi

```mermaid
flowchart TD
    START([Admin Login]) --> DASHBOARD[Admin Dashboard]
    DASHBOARD --> MENU{Pilih Menu}

    MENU -->|Publisher| PUB_QUEUE[Antrian Verifikasi Publisher]
    PUB_QUEUE --> REVIEW_PUB[Review Dokumen Publisher]
    REVIEW_PUB --> PUB_DEC{Keputusan}
    PUB_DEC -->|Approve| NOTIF_APP[Notifikasi Approve]
    PUB_DEC -->|Reject| NOTIF_REJ[Notifikasi Reject beserta Alasan]

    MENU -->|Buku| BOOK_QUEUE[Antrian Review Buku]
    BOOK_QUEUE --> REVIEW_BOOK[Review Konten Buku]
    REVIEW_BOOK --> BOOK_DEC{Keputusan}
    BOOK_DEC -->|Approve| BOOK_LIVE[Buku Live]
    BOOK_DEC -->|Reject| BOOK_REJ[Buku Ditolak beserta Feedback]
    BOOK_DEC -->|Takedown| BOOK_DOWN[Buku Diturunkan dari Platform]

    MENU -->|Event| EVENT[Kelola Event dan Promosi di Beranda]
    EVENT --> ADD_EVENT[Tambah atau Edit atau Hapus Banner dan Event]

    MENU -->|Users| USER_MAN[Manajemen User]
    USER_MAN --> BAN[Ban atau Suspend User]
    USER_MAN --> RESET[Reset Password User]
```

---

## 🔁 Activity Diagram

### Register & Login

```mermaid
stateDiagram-v2
    [*] --> LandingPage
    LandingPage --> ClickRegister : Klik Register
    ClickRegister --> FillForm : Isi Email Username Password
    FillForm --> Validate : Submit Form
    Validate --> EmailExist : Email sudah terdaftar
    EmailExist --> FillForm : Tampil error
    Validate --> CreateAccount : Data valid
    CreateAccount --> SendVerification : Kirim email verifikasi
    SendVerification --> VerifyEmail : User klik link
    VerifyEmail --> ActiveAccount : Akun aktif role USER
    ActiveAccount --> [*]

    LandingPage --> ClickLogin : Klik Login
    ClickLogin --> FillCredentials : Isi Email dan Password
    FillCredentials --> CheckCredentials : Submit
    CheckCredentials --> WrongCreds : Kredensial salah
    WrongCreds --> FillCredentials : Tampil error
    CheckCredentials --> CheckRole : Kredensial benar
    CheckRole --> UserDashboard : Role User
    CheckRole --> PublisherDashboard : Role Publisher
    CheckRole --> AdminDashboard : Role Admin
    UserDashboard --> [*]
    PublisherDashboard --> [*]
    AdminDashboard --> [*]
```

---

### Family Sharing

```mermaid
stateDiagram-v2
    [*] --> CheckLevel : User Ingin Gunakan Family Sharing
    CheckLevel --> NotEligible : Level EXP belum cukup
    NotEligible --> [*] : Tampil pesan dan progress EXP

    CheckLevel --> EligibleFS : Level EXP cukup
    EligibleFS --> CreateGroup : Buat Family Group
    CreateGroup --> NameGroup : Beri nama group
    NameGroup --> InviteFriends : Kirim undangan ke Friendlist
    InviteFriends --> FriendAccept : Teman terima undangan
    InviteFriends --> FriendDecline : Teman tolak undangan
    FriendDecline --> InviteFriends : Undang orang lain
    FriendAccept --> GroupFormed : Group terbentuk
    GroupFormed --> ShareBook : Owner pilih buku untuk di-share

    ShareBook --> CheckShareable : Cek apakah buku shareable
    CheckShareable --> NotShareable : Buku tidak shareable
    NotShareable --> ShareBook : Pilih buku lain
    CheckShareable --> Shareable : Buku shareable
    Shareable --> CheckConcurrent : Cek apakah owner sedang baca
    CheckConcurrent --> OwnerReading : Owner sedang baca buku ini
    OwnerReading --> MemberWait : Anggota harus tunggu
    CheckConcurrent --> Available : Owner tidak sedang baca
    Available --> MemberAccess : Anggota dapat akses buku
    MemberAccess --> [*]
```

---

## 🔄 Flowchart

### Sistem EXP & Leveling

```mermaid
flowchart TD
    ACTION[User Melakukan Aksi] --> TYPE{Tipe Aksi}

    TYPE -->|Beli Buku| EXP_BUY[tambah 50 EXP]
    TYPE -->|Selesai Baca| EXP_READ[tambah 100 EXP]
    TYPE -->|Tulis Review| EXP_REVIEW[tambah 25 EXP]
    TYPE -->|Login Harian| EXP_DAILY[tambah 5 EXP]
    TYPE -->|Referral| EXP_REF[tambah 200 EXP]

    EXP_BUY --> ADD_EXP[Tambahkan EXP ke Total]
    EXP_READ --> ADD_EXP
    EXP_REVIEW --> ADD_EXP
    EXP_DAILY --> ADD_EXP
    EXP_REF --> ADD_EXP

    ADD_EXP --> CHECK_LEVEL{Melewati Threshold Level?}
    CHECK_LEVEL -->|Ya| LEVEL_UP[Level Up!]
    CHECK_LEVEL -->|Tidak| NO_CHANGE[EXP Updated Level Sama]

    LEVEL_UP --> CHECK_UNLOCK{Ada Fitur Terbuka?}
    CHECK_UNLOCK -->|Ya| UNLOCK[Fitur Terbuka beserta Notifikasi]
    CHECK_UNLOCK -->|Tidak| NOTIF_LEVEL[Notifikasi Level Baru]

    subgraph LEVELS["Level dan Reward"]
        LV1["Level 1 - 0 EXP - Beli dan Baca Buku"]
        LV5["Level 5 - 500 EXP - Family Sharing max 3 anggota"]
        LV10["Level 10 - 1500 EXP - Family Sharing max 6 anggota"]
        LV15["Level 15 - 3000 EXP - Early Access"]
    end
```

---

### Return Buku

```mermaid
flowchart TD
    START([User Klik Return Buku]) --> GET_INFO[Ambil Data Transaksi]
    GET_INFO --> CHECK_TYPE{Tipe Buku?}

    CHECK_TYPE -->|Novel atau Non-fiksi| WINDOW_NOV{Dalam 5 hari setelah beli?}
    CHECK_TYPE -->|Komik atau Manga| WINDOW_COM{Dalam 1 hari setelah beli?}

    WINDOW_NOV -->|Tidak| EXPIRED_N[Return Window Habis]
    WINDOW_COM -->|Tidak| EXPIRED_C[Return Window Habis]

    WINDOW_NOV -->|Ya| CHECK_READ{Progress Baca di bawah 30 persen?}
    WINDOW_COM -->|Ya| CHECK_READ

    CHECK_READ -->|Tidak| TOO_MUCH[Sudah Dibaca Terlalu Banyak]
    CHECK_READ -->|Ya| ELIGIBLE[Return Eligible]

    ELIGIBLE --> CONFIRM[Tampilkan Konfirmasi Return]
    CONFIRM -->|Batal| CANCEL([Kembali ke Library])
    CONFIRM -->|Konfirmasi| PROCESS[Proses Return]

    PROCESS --> REVOKE[Cabut Akses Buku dari Library]
    REVOKE --> REFUND[Refund Penuh ke Platform Wallet]
    REFUND --> CANCEL_REVENUE[Batalkan Revenue Split Publisher]
    CANCEL_REVENUE --> NOTIF[Notifikasi Sukses Refund]
    NOTIF --> EXP_DEDUCT[Kurangi 50 EXP]
    EXP_DEDUCT --> END([Selesai])
```

---

## 🗃️ Database Map (ERD)

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string username UK
        string password_hash
        enum role "public|user|publisher|admin"
        int exp_total
        int level
        decimal wallet_balance
        boolean is_verified
        boolean is_banned
        timestamp created_at
        timestamp updated_at
    }

    PUBLISHER_PROFILES {
        uuid id PK
        uuid user_id FK
        string display_name
        string bio
        string document_url
        enum status "pending|approved|rejected"
        string rejection_reason
        decimal balance_pending
        decimal balance_available
        timestamp approved_at
    }

    BOOKS {
        uuid id PK
        uuid publisher_id FK
        string title
        string description
        string cover_url
        string file_url
        decimal price
        enum book_type "novel|comic|textbook|journal"
        string genre
        string language
        boolean is_family_shareable
        boolean is_early_access
        enum status "pending|approved|rejected|takedown"
        int total_pages
        float avg_rating
        int review_count
        int sales_count
        timestamp published_at
    }

    BOOK_TAGS {
        uuid id PK
        uuid book_id FK
        string tag
    }

    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        uuid book_id FK
        decimal amount
        enum payment_method "wallet|gopay|ovo|shopeepay|credit_card"
        enum status "pending|completed|refunded"
        timestamp purchase_at
        timestamp return_window_expires_at
        timestamp completed_at
    }

    LIBRARIES {
        uuid id PK
        uuid user_id FK
        uuid book_id FK
        uuid transaction_id FK
        int progress_pages
        float progress_percent
        timestamp last_read_at
        timestamp acquired_at
    }

    REVENUE_SPLITS {
        uuid id PK
        uuid transaction_id FK
        uuid publisher_id FK
        decimal total_amount
        decimal publisher_share
        decimal platform_share
        decimal publisher_percent
        enum status "holding|released|refunded"
        timestamp release_at
    }

    REFUND_REQUESTS {
        uuid id PK
        uuid transaction_id FK
        uuid user_id FK
        enum status "pending|approved|rejected"
        string reason
        timestamp requested_at
        timestamp processed_at
    }

    WITHDRAWAL_REQUESTS {
        uuid id PK
        uuid publisher_id FK
        decimal amount
        string bank_name
        string account_number
        enum status "pending|processing|completed|failed"
        timestamp requested_at
        timestamp completed_at
    }

    TOP_UP_HISTORY {
        uuid id PK
        uuid user_id FK
        decimal amount
        enum payment_method "gopay|ovo|shopeepay|credit_card"
        string external_transaction_id
        enum status "pending|success|failed"
        timestamp created_at
    }

    EXP_EVENTS {
        uuid id PK
        uuid user_id FK
        int exp_amount
        enum source "purchase|finish_read|review|daily_login|referral|return_deduct"
        uuid reference_id
        string description
        timestamp created_at
    }

    REVIEWS {
        uuid id PK
        uuid user_id FK
        uuid book_id FK
        int rating
        string content
        boolean is_approved
        int helpful_count
        timestamp created_at
    }

    FAMILY_GROUPS {
        uuid id PK
        uuid owner_id FK
        string group_name
        int max_members
        boolean is_active
        timestamp created_at
    }

    FAMILY_MEMBERSHIPS {
        uuid id PK
        uuid group_id FK
        uuid user_id FK
        enum status "pending|active|removed"
        timestamp joined_at
    }

    FAMILY_SHARED_BOOKS {
        uuid id PK
        uuid group_id FK
        uuid book_id FK
        uuid library_id FK
        boolean is_active
        timestamp shared_at
    }

    WISHLISTS {
        uuid id PK
        uuid user_id FK
        uuid book_id FK
        timestamp added_at
    }

    FRIEND_REQUESTS {
        uuid id PK
        uuid sender_id FK
        uuid receiver_id FK
        enum status "pending|accepted|rejected"
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string title
        string message
        enum type "purchase|return|level_up|family|review|system"
        boolean is_read
        timestamp created_at
    }

    ADMIN_EVENTS {
        uuid id PK
        uuid admin_id FK
        string title
        string description
        string banner_url
        timestamp start_date
        timestamp end_date
        boolean is_active
    }

    USERS ||--o{ TRANSACTIONS : "melakukan"
    USERS ||--o{ LIBRARIES : "memiliki"
    USERS ||--o{ REVIEWS : "menulis"
    USERS ||--o{ WISHLISTS : "menyimpan"
    USERS ||--o{ EXP_EVENTS : "mendapat"
    USERS ||--o{ NOTIFICATIONS : "menerima"
    USERS ||--|| PUBLISHER_PROFILES : "memiliki"
    USERS ||--o{ FAMILY_GROUPS : "memiliki"
    USERS ||--o{ FAMILY_MEMBERSHIPS : "bergabung"
    PUBLISHER_PROFILES ||--o{ BOOKS : "menerbitkan"
    PUBLISHER_PROFILES ||--o{ WITHDRAWAL_REQUESTS : "mengajukan"
    PUBLISHER_PROFILES ||--o{ REVENUE_SPLITS : "mendapat"
    BOOKS ||--o{ TRANSACTIONS : "dibeli dalam"
    BOOKS ||--o{ LIBRARIES : "ada dalam"
    BOOKS ||--o{ REVIEWS : "menerima"
    BOOKS ||--o{ WISHLISTS : "ada dalam"
    BOOKS ||--o{ BOOK_TAGS : "memiliki"
    BOOKS ||--o{ FAMILY_SHARED_BOOKS : "di-share dalam"
    TRANSACTIONS ||--|| REVENUE_SPLITS : "menghasilkan"
    TRANSACTIONS ||--o| REFUND_REQUESTS : "dapat di-return"
    FAMILY_GROUPS ||--o{ FAMILY_MEMBERSHIPS : "memiliki"
    FAMILY_GROUPS ||--o{ FAMILY_SHARED_BOOKS : "berbagi"
    TOP_UP_HISTORY }o--|| USERS : "milik"
```

---

## 🗂️ Halaman & Routing

```
/                           → Landing Page (Public)
/store                      → Browse Katalog Buku (Public)
/store/:bookId              → Halaman Detail Buku (Public)
/search                     → Hasil Pencarian (Public)
/login                      → Halaman Login
/register                   → Halaman Register

/user/library               → Library Buku yang Dimiliki
/user/read/:bookId          → In-App Reader
/user/profile               → Profil User (EXP, Level, Achievement)
/user/wishlist              → Wishlist
/user/transactions          → Riwayat Transaksi
/user/wallet                → Saldo & Riwayat Top-up
/user/family                → Manajemen Family Group
/user/friends               → Friendlist

/publisher/dashboard        → Dashboard Publisher
/publisher/upload           → Upload Buku Baru
/publisher/books            → Manajemen Buku Publisher
/publisher/analytics        → Histori Penjualan & Analytics
/publisher/balance          → Saldo & Withdrawal

/admin/dashboard            → Dashboard Admin
/admin/publishers           → Antrian Verifikasi Publisher
/admin/books                → Antrian Review & Moderasi Buku
/admin/users                → Manajemen User
/admin/events               → Kelola Event & Banner Beranda
```

---

## 🚀 Roadmap Pengembangan

### Phase 1 — MVP Core
- [x] Desain & Dokumentasi Sistem
- [x] Setup project Backend (Node.js + Express + MySQL + Docker)
- [x] Public API — Browse, Search, Genre, Event
- [ ] Auth system (register, login, role-based)
- [ ] Browse & halaman detail buku
- [ ] Sistem pembayaran & top-up wallet (Midtrans)
- [ ] Library & in-app reader dasar
- [ ] Dashboard publisher (upload + lihat penjualan)
- [ ] Admin panel (moderasi buku & publisher)

### Phase 2 — Gamifikasi
- [ ] EXP system & leveling
- [ ] Achievement & badge
- [ ] Wishlist
- [ ] Review & rating
- [ ] Notifikasi

### Phase 3 — Social & Sharing
- [ ] Friendlist
- [ ] Family Sharing & Group
- [ ] Activity feed

### Phase 4 — Polish & Scale
- [ ] Advanced search & filter
- [ ] Analitik publisher lebih detail
- [ ] Anti-screenshot & watermark (DRM)
- [ ] Moderasi konten 18+ / age gate
- [ ] Dark mode
- [ ] Mobile optimization

---

## ⚙️ Cara Menjalankan (Development)

### Prasyarat
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah terinstall dan berjalan

### 1. Clone & Konfigurasi

```bash
# Salin environment file
cp backend/.env.example backend/.env
# Edit sesuai kebutuhan (opsional, default sudah siap untuk Docker)
```

### 2. Jalankan Semua Service

```bash
# Build image dan jalankan seluruh stack
docker compose up -d --build

# Lihat status container
docker compose ps
```

### 3. Jalankan Migration & Seed Data

```bash
# Migration dijalankan otomatis oleh service 'migrate'
# Untuk menjalankan ulang manual:
docker compose run --rm migrate
```

### 4. Akses API

| Service | URL |
|---|---|
| **API** | http://localhost:3000 |
| **Health Check** | http://localhost:3000/health |
| **MySQL** | localhost:3306 |
| **Redis** | localhost:6379 |

### 5. Perintah Berguna

```bash
# Lihat log API
docker compose logs -f api

# Lihat log database
docker compose logs -f db

# Stop semua service
docker compose down

# Stop dan hapus volume (reset database)
docker compose down -v

# Rebuild ulang image setelah perubahan kode
docker compose up -d --build api
```

---

## 🔑 Akun Development (Seed Data)

> Credential akun development tersedia di file `README.dev.md` (tidak di-push ke GitHub).
> Jalankan seed migration terlebih dahulu, lalu buka file tersebut secara lokal.

> Untuk membuat akun baru, daftar lewat `http://localhost:3003/register`

---

*Dokumen ini diperbarui secara berkala seiring perkembangan proyek.*
