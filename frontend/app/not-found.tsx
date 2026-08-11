import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-primary-200 dark:text-primary-900 mb-2">404</div>
        <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Halaman tidak ditemukan
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Buku yang kamu cari mungkin sudah tidak tersedia atau URL-nya salah.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary flex items-center gap-2">
            <ArrowLeft size={16} /> Ke Beranda
          </Link>
          <Link href="/store" className="btn-secondary">
            Jelajahi Store
          </Link>
        </div>
      </div>
    </div>
  );
}
