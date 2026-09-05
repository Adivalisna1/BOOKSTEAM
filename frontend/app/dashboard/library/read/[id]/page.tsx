"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Maximize, Minimize } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";

export default function ReaderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    api.get(`/user/library/${params.id}`)
      .then(({ data }) => {
        setBook(data.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Gagal memuat buku.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id, accessToken]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="card p-12 text-center max-w-lg mx-auto mt-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Terjadi Kesalahan</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <Link href="/dashboard/library" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Kembali ke Library
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-slate-900 transition-all ${isFullscreen ? "fixed inset-0 z-[100]" : "h-[calc(100vh-6rem)] rounded-xl overflow-hidden shadow-2xl"}`}>
      
      {/* Reader Toolbar */}
      <div className="h-14 bg-slate-800 text-slate-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          {!isFullscreen && (
            <Link href="/dashboard/library" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
          )}
          <h1 className="font-semibold text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">
            {book.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      {/* Reader Area */}
      <div className="flex-1 w-full bg-slate-100 dark:bg-slate-900 relative">
        {book.file_url ? (
          <iframe 
            src={book.file_url} 
            className="absolute inset-0 w-full h-full border-0"
            title={book.title}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-400 gap-4">
            <p>File buku tidak tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
