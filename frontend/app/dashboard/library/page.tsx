"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, BarChart2, Loader2, BookMarked } from "lucide-react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface LibraryBook {
  library_id:       string;
  book_id:          string;
  title:            string;
  cover_url:        string | null;
  book_type:        string;
  genre:            string;
  total_pages:      number;
  publisher_name:   string;
  progress_pages:   number;
  progress_percent: number;
  last_read_at:     string | null;
  acquired_at:      string;
}

const SORT_OPTIONS = [
  { value: "newest",    label: "Terbaru Dibeli"  },
  { value: "last_read", label: "Terakhir Dibaca" },
  { value: "progress",  label: "Progress"        },
  { value: "title",     label: "Judul"           },
];

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${
          pct >= 100 ? "bg-green-500" : "bg-primary-500"
        }`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

export default function LibraryPage() {
  const [books,    setBooks]    = useState<LibraryBook[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [sortBy,   setSortBy]   = useState("newest");
  const [page,     setPage]     = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,    setTotal]    = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get("/user/library", { params: { sort_by: sortBy, page, limit: 12 } })
      .then(({ data }) => {
        setBooks(data.data ?? []);
        setTotalPages(data.pagination?.total_pages ?? 1);
        setTotal(data.pagination?.total ?? 0);
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [sortBy, page]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookMarked size={22} /> Library
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {total} buku dimiliki
          </p>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          className="input py-2 text-sm w-auto"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      )}

      {/* Empty */}
      {!loading && books.length === 0 && (
        <div className="card p-16 text-center">
          <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-lg">
            Library-mu masih kosong
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
            Beli buku pertamamu dan mulai membaca!
          </p>
          <Link href="/store" className="btn-primary inline-flex items-center gap-2">
            <BookOpen size={16} /> Ke Store
          </Link>
        </div>
      )}

      {/* Grid */}
      {!loading && books.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {books.map((book) => (
              <div key={book.library_id} className="card p-4 flex gap-4 hover:shadow-md transition-shadow">
                {/* Cover */}
                <div className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden
                                bg-slate-100 dark:bg-slate-800">
                  {book.cover_url ? (
                    <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen size={20} className="text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {book.publisher_name}
                  </p>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100
                                  line-clamp-2 leading-snug">
                    {book.title}
                  </h3>

                  {/* Progress */}
                  <div className="mt-auto pt-2">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <BarChart2 size={10} />
                        {book.progress_percent >= 100
                          ? "Selesai"
                          : `${book.progress_pages} / ${book.total_pages} hal`}
                      </span>
                      <span>{Math.min(Math.round(book.progress_percent), 100)}%</span>
                    </div>
                    <ProgressBar pct={book.progress_percent} />
                  </div>

                  {/* Last read */}
                  {book.last_read_at && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Clock size={10} />
                      {formatDate(book.last_read_at)}
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Link
                      href={`/store/book/${book.book_id}`}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Detail
                    </Link>
                    <Link
                      href={`/dashboard/library/read/${book.book_id}`}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                    >
                      Baca
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">
                ← Prev
              </button>
              <span className="flex items-center px-4 text-sm text-slate-600 dark:text-slate-400">
                {page} / {totalPages}
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
