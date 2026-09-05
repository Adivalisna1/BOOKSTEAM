"use client";

import { useAuthStore } from "@/lib/authStore";
import { Users, BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Selamat datang, {user?.username}! 👋</h1>
        <p className="mt-2 text-primary-100 opacity-90 max-w-2xl">
          Ini adalah pusat kendali BookSteam. Di sini Anda memiliki akses penuh untuk memoderasi publisher dan memvalidasi buku-buku yang akan dipublikasikan ke store.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/publishers" className="card p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-md cursor-pointer border-t-4 border-t-blue-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Moderasi</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Publisher</h3>
            </div>
          </div>
        </Link>

        <Link href="/admin/books" className="card p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-md cursor-pointer border-t-4 border-t-emerald-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Moderasi</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Buku</h3>
            </div>
          </div>
        </Link>

        <div className="card p-6 border-t-4 border-t-amber-500 opacity-70">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Segera Hadir</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Moderasi Review</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
