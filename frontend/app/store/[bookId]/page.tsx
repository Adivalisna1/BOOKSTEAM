import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Users, BookOpen, Calendar, Globe, ChevronRight, Tag } from "lucide-react";
import { BookCard, type Book } from "@/components/BookCard";
import { formatPrice, formatDate, truncate } from "@/lib/utils";
import api from "@/lib/api";
import { ClientActions } from "./ClientActions";

async function getBook(bookId: string) {
  try {
    const { data } = await api.get(`/books/${bookId}`);
    return data.data;
  } catch {
    return null;
  }
}

async function getReviews(bookId: string) {
  try {
    const { data } = await api.get(`/books/${bookId}/reviews`, { params: { limit: 6 } });
    return data.reviews ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { bookId: string } }): Promise<Metadata> {
  const book = await getBook(params.bookId);
  if (!book) return { title: "Buku tidak ditemukan" };
  return {
    title: book.title,
    description: truncate(book.description ?? "", 160),
  };
}

const BOOK_TYPE_LABELS: Record<string, string> = {
  novel: "Novel", comic: "Komik", textbook: "Buku Teks", journal: "Jurnal",
};

interface BookReview {
  id: string;
  username?: string;
  rating: number;
  content?: string;
  created_at?: string;
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={size}
          className={i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"} />
      ))}
    </div>
  );
}

export default async function BookDetailPage({ params }: { params: { bookId: string } }) {
  const [book, reviews] = await Promise.all([
    getBook(params.bookId),
    getReviews(params.bookId),
  ]);

  if (!book) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">Beranda</Link>
        <ChevronRight size={14} />
        <Link href="/store" className="hover:text-primary-600 dark:hover:text-primary-400">Store</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{book.title}</span>
      </nav>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left — Cover + Purchase */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card overflow-hidden aspect-[3/4] relative w-full max-w-xs mx-auto lg:mx-0">
            {book.cover_url ? (
              <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="(max-width: 768px) 80vw, 300px" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center
                              text-slate-400 text-sm p-6 text-center bg-slate-100 dark:bg-slate-800">
                {book.title}
              </div>
            )}
          </div>

          {/* Price card */}
          <div className="card p-5 space-y-3">
            <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
              {formatPrice(book.price)}
            </p>

            <ClientActions bookId={book.id} />

            {Boolean(book.is_family_shareable) && (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400
                              bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                <Users size={14} />
                Mendukung Family Sharing
              </div>
            )}
          </div>

          {/* Book meta */}
          <div className="card p-5 space-y-3 text-sm">
            {[
              { icon: <BookOpen size={14} />,  label: "Tipe",       val: BOOK_TYPE_LABELS[book.book_type] },
              { icon: <Tag size={14} />,        label: "Genre",      val: book.genre },
              { icon: <Globe size={14} />,      label: "Bahasa",     val: book.language?.toUpperCase() },
              { icon: <BookOpen size={14} />,   label: "Halaman",    val: book.total_pages > 0 ? `${book.total_pages} hal` : "—" },
              { icon: <Calendar size={14} />,   label: "Rilis",      val: book.published_at ? formatDate(book.published_at) : "—" },
            ].map(({ icon, label, val }) => (
              <div key={label} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="shrink-0 text-slate-400">{icon}</span>
                <span className="w-20 shrink-0 text-slate-500 dark:text-slate-500">{label}</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium capitalize">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Details */}
        <div className="lg:col-span-2 space-y-8">

          {/* Title + publisher */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                {BOOK_TYPE_LABELS[book.book_type]}
              </span>
              <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 capitalize">
                {book.genre}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              {book.title}
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              oleh{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {book.publisher_name}
              </span>
            </p>

            {/* Rating row */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <StarRating rating={Number(book.avg_rating)} />
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {Number(book.avg_rating) > 0 ? Number(book.avg_rating).toFixed(1) : "—"}
                </span>
                <span className="text-sm text-slate-500">
                  ({book.review_count} ulasan)
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-sm text-slate-500">
                {(book.sales_count ?? 0).toLocaleString("id-ID")} terjual
              </span>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">Sinopsis</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {book.tags?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">Tag</h2>
              <div className="flex flex-wrap gap-2">
                {book.tags.map((tag: string) => (
                  <Link key={tag} href={`/store?tag=${tag}`}
                    className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400
                               hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-900/30
                               dark:hover:text-primary-400 transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
                Ulasan ({book.review_count})
              </h2>
              <div className="space-y-4">
                {reviews.map((r: BookReview) => (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30
                                      flex items-center justify-center shrink-0 text-primary-700
                                      dark:text-primary-400 text-sm font-bold">
                        {r.username?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                            {r.username}
                          </span>
                          <div className="flex items-center gap-2">
                            <StarRating rating={r.rating} size={12} />
                            <span className="text-xs text-slate-400">{r.created_at ? formatDate(r.created_at) : ""}</span>
                          </div>
                        </div>
                        {r.content && (
                          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {r.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related books */}
          {book.related_books?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
                Buku Serupa
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {book.related_books.map((rb: Book) => <BookCard key={rb.id} book={rb} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
