import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { BookCard, type Book } from "@/components/BookCard";
import { StoreSidebar } from "@/components/StoreSidebar";
import { StorePagination } from "@/components/StorePagination";
import { StoreSortBar } from "@/components/StoreSortBar";
import api from "@/lib/api";

export const metadata: Metadata = { title: "Store" };

interface StoreSearchParams {
  page?:      string;
  genre?:     string;
  book_type?: string;
  min_price?: string;
  max_price?: string;
  sort_by?:   string;
  order?:     string;
  [key: string]: string | undefined;
}

async function getBooks(params: StoreSearchParams) {
  try {
    const { data } = await api.get("/books", { params: { limit: 20, ...params } });
    return data;
  } catch {
    return { data: [], pagination: { total: 0, total_pages: 0, page: 1, limit: 20 } };
  }
}

async function getGenres() {
  try {
    const { data } = await api.get("/genres");
    return data.data ?? [];
  } catch {
    return [];
  }
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: StoreSearchParams;
}) {
  const [result, genres] = await Promise.all([
    getBooks(searchParams),
    getGenres(),
  ]);

  const books: Book[]     = result.data ?? [];
  const pagination        = result.pagination ?? {};
  const currentPage       = parseInt(searchParams.page ?? "1", 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Store</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {pagination.total ?? 0} judul tersedia
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <StoreSidebar
            genres={genres}
            currentGenre={searchParams.genre}
            currentType={searchParams.book_type}
            currentMinPrice={searchParams.min_price}
            currentMaxPrice={searchParams.max_price}
          />
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <StoreSortBar
            currentSort={searchParams.sort_by}
            currentOrder={searchParams.order}
            currentType={searchParams.book_type}
          />

          {books.length === 0 ? (
            <div className="card p-16 text-center mt-4">
              <SlidersHorizontal size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Tidak ada buku yang cocok dengan filter ini.
              </p>
              <p className="text-sm text-slate-400 mt-1">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
                {books.map((book) => <BookCard key={book.id} book={book} />)}
              </div>

              {pagination.total_pages > 1 && (
                <StorePagination
                  currentPage={currentPage}
                  totalPages={pagination.total_pages}
                  searchParams={searchParams}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
