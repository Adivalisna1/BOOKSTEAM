import type { Metadata } from "next";
import { Search } from "lucide-react";
import { BookCard, type Book } from "@/components/BookCard";
import { StorePagination } from "@/components/StorePagination";
import api from "@/lib/api";

export const metadata: Metadata = { title: "Cari Buku" };

async function searchBooks(params: Record<string, string | undefined>) {
  try {
    const { data } = await api.get("/search", { params: { limit: 20, ...params } });
    return data;
  } catch {
    return { query: "", books: [], pagination: { total: 0, total_pages: 0, page: 1, limit: 20 } };
  }
}

const BOOK_TYPES = [
  { value: "",         label: "Semua" },
  { value: "novel",    label: "Novel" },
  { value: "comic",    label: "Komik" },
  { value: "textbook", label: "Buku Teks" },
  { value: "journal",  label: "Jurnal" },
];

interface SearchParams {
  q?:         string;
  page?:      string;
  book_type?: string;
  min_price?: string;
  max_price?: string;
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, page, book_type, min_price, max_price } = searchParams;
  const result = await searchBooks({ q, page, book_type, min_price, max_price });

  const books: Book[] = result.books ?? [];
  const pagination    = result.pagination ?? {};
  const currentPage   = parseInt(page ?? "1", 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Search size={22} />
          {q ? `Hasil untuk "${q}"` : "Cari Buku"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {pagination.total ?? 0} hasil ditemukan
        </p>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {BOOK_TYPES.map((t) => {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (t.value) params.set("book_type", t.value);
          const isActive = (book_type ?? "") === t.value;
          return (
            <a key={t.value}
               href={`/search?${params.toString()}`}
               className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
                 ${isActive
                   ? "bg-primary-600 text-white border-primary-600"
                   : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-400"
                 }`}>
              {t.label}
            </a>
          );
        })}
      </div>

      {/* No results */}
      {books.length === 0 && (
        <div className="card p-16 text-center">
          <Search size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-lg">
            {q ? `Tidak ada hasil untuk "${q}"` : "Masukkan kata kunci untuk mencari"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Coba gunakan kata kunci yang berbeda atau lebih umum.
          </p>
        </div>
      )}

      {/* Results */}
      {books.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => <BookCard key={book.id} book={book} />)}
          </div>

          {pagination.total_pages > 1 && (
            <StorePagination
              currentPage={currentPage}
              totalPages={pagination.total_pages}
              searchParams={{ ...searchParams, page: undefined }}
            />
          )}
        </>
      )}
    </div>
  );
}
