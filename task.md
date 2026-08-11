# BookSteam — API Task Tracker

---

## ✅ Public API (Selesai)

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/books` | List buku (filter: genre, book_type, price, sort) |
| GET | `/api/v1/books/featured` | Buku featured untuk homepage |
| GET | `/api/v1/books/new-releases` | Buku terbaru |
| GET | `/api/v1/books/top-rated` | Buku rating tertinggi |
| GET | `/api/v1/books/:id` | Detail buku |
| GET | `/api/v1/books/:id/reviews` | Review buku (paginated) |
| GET | `/api/v1/search` | Search buku by keyword + filter |
| GET | `/api/v1/genres` | List semua genre + jumlah buku |
| GET | `/api/v1/events` | List event/banner aktif |

---

## ✅ Admin API (Selesai)

> Semua endpoint butuh: `Authorization: Bearer <token>` + role `admin`

### Books
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/admin/books` | List semua buku (filter: status, book_type, genre) |
| GET | `/api/v1/admin/books/:id` | Detail buku |
| PATCH | `/api/v1/admin/books/:id/approve` | Approve buku pending |
| PATCH | `/api/v1/admin/books/:id/reject` | Reject buku + reason |
| PATCH | `/api/v1/admin/books/:id/takedown` | Takedown buku + reason |
| PATCH | `/api/v1/admin/books/:id/toggle-featured` | Toggle featured |

### Publishers
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/admin/publishers` | List publisher (filter: status) |
| GET | `/api/v1/admin/publishers/:id` | Detail publisher |
| PATCH | `/api/v1/admin/publishers/:id/approve` | Approve + upgrade role user |
| PATCH | `/api/v1/admin/publishers/:id/reject` | Reject + reason |

### Users
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/admin/users` | List user (filter: role, is_banned, search) |
| GET | `/api/v1/admin/users/:id` | Detail user |
| PATCH | `/api/v1/admin/users/:id/ban` | Ban user |
| PATCH | `/api/v1/admin/users/:id/unban` | Unban user |

### Events / Banners
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/admin/events` | List semua event (filter: is_active) |
| GET | `/api/v1/admin/events/:id` | Detail event |
| POST | `/api/v1/admin/events` | Buat event baru |
| PUT | `/api/v1/admin/events/:id` | Update event |
| DELETE | `/api/v1/admin/events/:id` | Hapus event |

---

## ✅ Auth API (Selesai)

> Semua endpoint public kecuali `/me` dan `/resend-verification` yang butuh JWT.

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| POST | `/api/v1/auth/register` | - | Register user baru, auto-login, kirim token verifikasi |
| POST | `/api/v1/auth/login` | - | Login → dapat access_token + refresh_token |
| POST | `/api/v1/auth/logout` | - | Logout → revoke refresh_token dari DB |
| POST | `/api/v1/auth/refresh` | - | Tukar refresh_token → access_token baru |
| GET | `/api/v1/auth/me` | JWT | Get profil user yang sedang login |
| POST | `/api/v1/auth/verify-email` | - | Verifikasi email via token |
| POST | `/api/v1/auth/resend-verification` | JWT | Kirim ulang email verifikasi |
| POST | `/api/v1/auth/forgot-password` | - | Request reset password (anti user enumeration) |
| POST | `/api/v1/auth/reset-password` | - | Reset password via token + revoke semua session |

---

## ✅ User API (Selesai)

> Semua endpoint butuh: `Authorization: Bearer <token>` + role `user` / `publisher` / `admin`

### Profile
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/user/profile` | Lihat profil sendiri (EXP, level, badge) |
| PUT | `/api/v1/user/profile` | Update profil (username, avatar_url) |
| GET | `/api/v1/user/profile/exp` | Riwayat EXP events |

### Library
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/user/library` | List buku yang dimiliki (sort: newest, title, last_read, progress) |
| GET | `/api/v1/user/library/:bookId` | Detail buku di library + progress baca |
| PATCH | `/api/v1/user/library/:bookId/progress` | Update progress baca |

### Wishlist
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/user/wishlist` | List wishlist |
| POST | `/api/v1/user/wishlist/:bookId` | Tambah ke wishlist |
| DELETE | `/api/v1/user/wishlist/:bookId` | Hapus dari wishlist |

### Reviews
| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/v1/user/reviews/:bookId` | Tulis review (wajib punya buku) |
| PUT | `/api/v1/user/reviews/:bookId` | Edit review |
| DELETE | `/api/v1/user/reviews/:bookId` | Hapus review |

### Wallet & Transaksi
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/user/wallet` | Saldo + total topup + total spent |
| GET | `/api/v1/user/wallet/topup-history` | Riwayat top-up |
| GET | `/api/v1/user/wallet/transactions` | Riwayat transaksi |
| GET | `/api/v1/user/wallet/transactions/:id` | Detail transaksi |

### Notifications
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/user/notifications` | List notifikasi (filter: unread_only) |
| PATCH | `/api/v1/user/notifications/read-all` | Tandai semua sudah dibaca |
| PATCH | `/api/v1/user/notifications/:id/read` | Tandai satu notifikasi sudah dibaca |

---

## ✅ Publisher API (Selesai)

> Semua endpoint butuh: `Authorization: Bearer <token>`

### Apply & Profile
| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| POST | `/api/v1/publisher/apply` | user | Daftar jadi publisher (submit ke admin) |
| GET | `/api/v1/publisher/profile` | publisher | Lihat profil publisher |
| PUT | `/api/v1/publisher/profile` | publisher | Update display_name, bio, document_url |

### Books
| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| GET | `/api/v1/publisher/books` | publisher | List buku milik publisher (filter: status, book_type) |
| GET | `/api/v1/publisher/books/:id` | publisher | Detail buku |
| POST | `/api/v1/publisher/books` | publisher | Upload buku baru (status: pending) |
| PUT | `/api/v1/publisher/books/:id` | publisher | Edit buku (re-submit jika live: hanya price, cover, shareable) |
| DELETE | `/api/v1/publisher/books/:id` | publisher | Hapus buku (hanya pending/rejected) |
| GET | `/api/v1/publisher/books/:id/sales` | publisher | Riwayat penjualan per buku |

### Analytics
| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| GET | `/api/v1/publisher/analytics` | publisher | Overview stats, monthly revenue 12 bulan, top 5 buku |

### Balance & Withdrawal
| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| GET | `/api/v1/publisher/balance` | publisher | Saldo available + pending + total withdrawn |
| GET | `/api/v1/publisher/balance/revenue` | publisher | Riwayat revenue splits (filter: status) |
| POST | `/api/v1/publisher/balance/withdraw` | publisher | Request withdrawal (min Rp 50.000) |
| GET | `/api/v1/publisher/balance/withdrawals` | publisher | Riwayat withdrawal (filter: status) |

---

## ✅ Payment & Checkout API (Selesai)

> Checkout + topup butuh JWT. Webhook PUBLIC (Midtrans server-to-server).

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| POST | `/api/v1/checkout` | JWT | Beli buku — wallet (instant) atau Midtrans Snap |
| POST | `/api/v1/topup` | JWT | Top-up wallet via Midtrans Snap |
| POST | `/api/v1/payment/webhook` | — | Callback Midtrans, verify signature, update DB |
| GET | `/api/v1/transactions/:id/return/check` | JWT | Preview eligibility return tanpa commit |
| POST | `/api/v1/transactions/:id/return` | JWT | Proses return → refund ke wallet + revoke library |

---

## ⏸️ Family Sharing API (Di-skip, dikerjakan nanti)

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/family` | Lihat family group |
| POST | `/api/v1/family` | Buat family group |
| POST | `/api/v1/family/invite/:userId` | Undang teman ke group |
| PATCH | `/api/v1/family/invite/:inviteId/accept` | Terima undangan |
| DELETE | `/api/v1/family/members/:userId` | Keluarkan anggota |
| GET | `/api/v1/family/books` | List buku yang di-share di group |

---

## ✅ Friends API (Selesai)

> Semua endpoint butuh: `Authorization: Bearer <token>`

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/friends` | List semua teman (filter: search) |
| GET | `/api/v1/friends/requests/pending` | List request masuk yang belum direspon |
| GET | `/api/v1/friends/requests/sent` | List request yang sudah dikirim |
| GET | `/api/v1/friends/status/:userId` | Cek status pertemanan dengan user tertentu |
| POST | `/api/v1/friends/request/:userId` | Kirim friend request |
| PATCH | `/api/v1/friends/request/:requestId/accept` | Terima friend request |
| PATCH | `/api/v1/friends/request/:requestId/decline` | Tolak friend request |
| DELETE | `/api/v1/friends/request/:requestId` | Batalkan request yang sudah dikirim |
| DELETE | `/api/v1/friends/:userId` | Hapus teman |

---

## Infrastructure

- [x] Express + Node.js setup
- [x] MySQL 8.4 (migrasi dari PostgreSQL)
- [x] Docker Compose (api, db, redis, migrate)
- [x] Migration system (schema_migrations tracking)
- [x] Seed data (15 buku, 3 publisher, 7 user, 4 events)
- [x] JWT Auth middleware (authenticate + authorize)
- [x] Auth system (register/login/logout/refresh/verify email/reset password)
- [ ] Redis integration (cache + session)
- [ ] File upload (S3/R2 untuk cover & file buku)
- [ ] Midtrans payment integration
- [ ] Email service (SendGrid/Nodemailer)

---

## ✅ Frontend — User Dashboard (Selesai)

> Next.js 14 App Router + Zustand auth store + Tailwind CSS

### Pages
| Route | Halaman | Keterangan |
|---|---|---|
| `/dashboard/library` | Library | Grid buku, progress bar per buku, sort, pagination |
| `/dashboard/wishlist` | Wishlist | List buku tersimpan, remove, link beli |
| `/dashboard/profile` | Profil | Edit username/avatar, EXP bar, level milestones, riwayat EXP |
| `/dashboard/wallet` | Wallet | Summary saldo, tabs transaksi & topup, status badge |
| `/dashboard/notifications` | Notifikasi | Mark one/all read, type badge, unread dot |

### Auth
| File | Keterangan |
|---|---|
| `lib/authStore.ts` | Zustand store (persist): user, tokens, login, logout, fetchMe |
| `lib/api.ts` | Axios dengan auto-attach token dari zustand store |
| `app/login/page.tsx` | Login → simpan ke authStore |
| `app/register/page.tsx` | Register → auto-login ke authStore |

### Updated Components
| Component | Update |
|---|---|
| `Navbar` | Avatar + dropdown (library, wishlist, wallet, notifikasi, profil, logout) kalau sudah login |
| `DashboardSidebar` | User card + EXP bar + nav links + logout |

> Next.js 14 App Router + Tailwind CSS + Light/Dark Theme

### Pages
| Route | Halaman | Keterangan |
|---|---|---|
| `/` | Landing Page | Hero, events banner, featured books, new releases, fitur, CTA |
| `/store` | Store / Browse | Sidebar filter (genre, tipe, harga), sort bar, grid buku, pagination |
| `/store/[bookId]` | Detail Buku | Cover, info, sinopsis, rating, tags, reviews, related books |
| `/search` | Search Results | Filter tipe buku, grid hasil, pagination |
| `/login` | Login | Form email + password, show/hide password |
| `/register` | Register | Form + validasi password real-time, auto-login setelah daftar |
| `*` | 404 | Not found page |

### Components
| Component | Fungsi |
|---|---|
| `Navbar` | Logo, nav links, search bar desktop+mobile, auth buttons, hamburger |
| `Footer` | Links, brand, copyright |
| `ThemeToggle` | Toggle light/dark dengan sun/moon icon |
| `BookCard` | Card buku reusable: cover, badge tipe, family sharing, rating, harga |
| `StoreSidebar` | Filter tipe buku, genre (dengan count), price range |
| `StoreSortBar` | Sort tabs (terbaru, terpopuler, rating, harga) + filter chip mobile |
| `StorePagination` | Pagination dengan ellipsis |

## ⏳ Frontend — Selanjutnya

- [ ] Dashboard user (library, wishlist, profil, notifikasi)
- [ ] Halaman checkout & top-up
- [ ] Publisher dashboard
- [ ] Admin panel
