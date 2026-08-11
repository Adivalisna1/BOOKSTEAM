import Link from "next/link";
import Image from "next/image";
import { Star, Users } from "lucide-react";
import { formatPrice, truncate } from "@/lib/utils";

export interface Book {
  id: string;
  title: string;
  cover_url: string | null;
  price: number;
  avg_rating: number;
  review_count: number;
  book_type: string;
  genre: string;
  is_family_shareable: boolean | number;
  published_at: string | null;
  publisher_name: string;
}

interface BookCardProps {
  book: Book;
}

const BOOK_TYPE_LABELS: Record<string, string> = {
  novel:    "Novel",
  comic:    "Komik",
  textbook: "Buku Teks",
  journal:  "Jurnal",
};

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/store/${book.id}`}
      className="card group flex flex-col overflow-hidden
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      {/* Cover */}
      <div className="relative aspect-[3/4] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center
                          text-slate-400 dark:text-slate-600 text-xs font-medium p-4 text-center">
            {book.title}
          </div>
        )}

        {/* Book type badge */}
        <span className="absolute top-2 left-2 badge bg-white/90 dark:bg-slate-900/90
                         text-slate-700 dark:text-slate-300 shadow-sm">
          {BOOK_TYPE_LABELS[book.book_type] ?? book.book_type}
        </span>

        {/* Family shareable badge */}
        {Boolean(book.is_family_shareable) && (
          <span className="absolute top-2 right-2 badge bg-green-100 text-green-700
                           dark:bg-green-900/50 dark:text-green-400">
            <Users size={10} className="mr-1" /> Sharing
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {book.publisher_name}
        </p>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
          {truncate(book.title, 50)}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-auto pt-1">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {Number(book.avg_rating) > 0 ? Number(book.avg_rating).toFixed(1) : "—"}
          </span>
          {book.review_count > 0 && (
            <span className="text-xs text-slate-400">({book.review_count})</span>
          )}
        </div>

        {/* Price */}
        <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-0.5">
          {formatPrice(book.price)}
        </p>
      </div>
    </Link>
  );
}
