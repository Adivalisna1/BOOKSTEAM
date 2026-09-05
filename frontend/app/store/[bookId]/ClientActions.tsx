"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2, BookMarked } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import api from "@/lib/api";

export function ClientActions({ bookId }: { bookId: string }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleAddToLibrary() {
    if (!user) {
      router.push(`/login?redirect=/store/${bookId}`);
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/user/library/${bookId}/add`);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/library");
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menambahkan ke library";
      if (msg === "Book is already in your library") {
        router.push("/dashboard/library");
      } else {
        alert(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {success ? (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center font-medium">
          Berhasil ditambahkan! Mengalihkan ke rak...
        </div>
      ) : (
        <button
          onClick={handleAddToLibrary}
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
          {user ? "Beli (Klaim Gratis)" : "Masuk untuk Klaim"}
        </button>
      )}

      <button className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
        + Tambah ke Wishlist
      </button>
    </div>
  );
}
