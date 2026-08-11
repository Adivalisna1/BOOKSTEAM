import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-20
                       bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg
                                       text-primary-600 dark:text-primary-400">
              <BookOpen size={20} />
              <span>BookSteam</span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Platform jual beli dan baca buku digital bergaya Steam. Beli, baca,
              dan bagikan buku favoritmu.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Jelajahi
            </h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/store" className="hover:text-primary-600 dark:hover:text-primary-400">Store</Link></li>
              <li><Link href="/store?book_type=novel" className="hover:text-primary-600 dark:hover:text-primary-400">Novel</Link></li>
              <li><Link href="/store?book_type=comic" className="hover:text-primary-600 dark:hover:text-primary-400">Komik</Link></li>
              <li><Link href="/store?book_type=textbook" className="hover:text-primary-600 dark:hover:text-primary-400">Buku Teks</Link></li>
              <li><Link href="/store?sort_by=newest" className="hover:text-primary-600 dark:hover:text-primary-400">Terbaru</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Akun
            </h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/login" className="hover:text-primary-600 dark:hover:text-primary-400">Masuk</Link></li>
              <li><Link href="/register" className="hover:text-primary-600 dark:hover:text-primary-400">Daftar</Link></li>
              <li><Link href="/publisher/apply" className="hover:text-primary-600 dark:hover:text-primary-400">Jadi Publisher</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800
                        flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} BookSteam. Dibuat untuk portofolio.
          </p>
          <p className="text-xs text-slate-400">
            Next.js · Tailwind CSS · Node.js · MySQL
          </p>
        </div>
      </div>
    </footer>
  );
}
