"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest",  label: "Terbaru"     },
  { value: "popular", label: "Terpopuler"  },
  { value: "rating",  label: "Rating"      },
  { value: "price",   label: "Harga ↑",    order: "asc"  },
  { value: "price",   label: "Harga ↓",    order: "desc" },
];

const BOOK_TYPES = [
  { value: "",         label: "Semua" },
  { value: "novel",    label: "Novel" },
  { value: "comic",    label: "Komik" },
  { value: "textbook", label: "Buku Teks" },
  { value: "journal",  label: "Jurnal" },
];

interface Props {
  currentSort?:  string;
  currentOrder?: string;
  currentType?:  string;
}

export function StoreSortBar({ currentSort, currentOrder, currentType }: Props) {
  const router = useRouter();
  const sp     = useSearchParams();

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete("page");
    router.push(`/store?${params.toString()}`);
  }

  const activeSort = SORT_OPTIONS.find(
    (o) => o.value === (currentSort ?? "newest") && (!o.order || o.order === currentOrder)
  ) ?? SORT_OPTIONS[0];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Mobile: type chips */}
      <div className="lg:hidden flex gap-1 overflow-x-auto w-full pb-1">
        {BOOK_TYPES.map((t) => (
          <button key={t.value}
            onClick={() => updateParams({ book_type: t.value })}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              (currentType ?? "") === t.value
                ? "bg-primary-600 text-white border-primary-600"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Sort tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {SORT_OPTIONS.map((o) => (
          <button key={o.label}
            onClick={() => updateParams({ sort_by: o.value, order: o.order ?? "desc" })}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              activeSort.label === o.label
                ? "bg-primary-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
