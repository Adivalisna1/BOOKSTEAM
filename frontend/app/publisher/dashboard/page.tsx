"use client";

import Link from "next/link";
import { Upload, Book, DollarSign, Activity } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";

export default function PublisherDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Halo, {user?.username} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Selamat datang di Dashboard Publisher BookSteam.
          </p>
        </div>
        
        <Link 
          href="/publisher/upload" 
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Upload size={18} />
          Upload Buku Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder Stats */}
        <div className="card p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <Book size={20} className="text-blue-500" />
            <h3 className="font-medium">Total Buku</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">0</p>
        </div>

        <div className="card p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <Activity size={20} className="text-green-500" />
            <h3 className="font-medium">Buku Terjual</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">0</p>
        </div>

        <div className="card p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <DollarSign size={20} className="text-amber-500" />
            <h3 className="font-medium">Saldo Penjualan</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">Rp 0</p>
        </div>
      </div>

      <div className="card p-8 text-center border-dashed">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
          Mulai Terbitkan Buku Pertamamu
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          Unggah karya terbaikmu ke BookSteam dan dapatkan penghasilan dari penjualan buku digital dengan sistem pembagian hasil yang transparan.
        </p>
        <Link 
          href="/publisher/upload" 
          className="inline-flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-lg font-medium transition-transform hover:scale-105"
        >
          <Upload size={18} />
          Mulai Upload
        </Link>
      </div>
    </div>
  );
}
