"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, BookOpen, Loader2, Star, ShoppingCart } from "lucide-react";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface WishlistItem {
  wishlist_id:    string;
  book_id:        string;
  title:          string;
  cover_url:      string | null;
  price:          number;
  avg_rating:     number;
  review_count:   number;
  book_type:      string;
  genre:          string;
  publisher_name: string;
  added_at:       string;
}

export default function WishlistPage() {
  const [items,    setItems]    = useState<WishlistItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [total,    setTotal]    = useState(0);

  useEffect(() => { fetchWishlist(); }, []);

  async function fetchWishlist() {
    setLoading(true);
    try {
      const { data } = await api.get("/user/wishlist", { params: { limit: 50 } });
      setItems(data.data ?? []);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(bookId: string) {
    setRemoving(bookId);
    try {
      await api.delete(`/user/wishlist/${bookId}`);
      setItems((prev) => prev.filter((i) => i.book_id !== bookId));
      setTotal((t) => t - 1);
    } catch { /* ignore */ }
    finally { setRemoving(null); }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Heart size={22} className="fill-red-400 text-red-400" /> Wishlist
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {total} buku tersimpan
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="card p-16 text-center">
          <Heart size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-lg">
            Wishlist-mu kosong
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
            Tambahkan buku yang kamu inginkan ke wishlist.
          </p>
          <Link href="/store" className="btn-primary inline-flex items-center gap-2">
            <BookOpen size={16} /> Jelajahi Store
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.wishlist_id} className="card p-4 flex gap-4 group hover:shadow-md transition-shadow">
              {/* Cover */}
              <Link href={`/store/${item.book_id}`}
                className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden
                           bg-slate-100 dark:bg-slate-800">
                {item.cover_url ? (
                  <Image src={item.cover_url} alt={item.title} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen size={20} className="text-slate-400" />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.publisher_name}</p>
                <Link href={`/store/${item.book_id}`}
                  className="text-sm font-semibold text-slate-900 dark:text-slate-100
                             line-clamp-2 leading-snug hover:text-primary-600 dark:hover:text-primary-400">
                  {item.title}
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {Number(item.avg_rating) > 0 ? Number(item.avg_rating).toFixed(1) : "—"}
                    {item.review_count > 0 && ` (${item.review_count})`}
                  </span>
                </div>

                <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-auto">
                  {formatPrice(item.price)}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2">
                  <Link href={`/store/${item.book_id}`}
                    className="flex-1 text-center text-xs btn-primary py-1.5 flex items-center justify-center gap-1">
                    <ShoppingCart size={12} /> Beli
                  </Link>
                  <button
                    onClick={() => removeItem(item.book_id)}
                    disabled={removing === item.book_id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg
                               text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                               transition-colors disabled:opacity-40"
                  >
                    {removing === item.book_id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
