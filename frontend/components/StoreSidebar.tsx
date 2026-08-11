"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const BOOK_TYPES = [
  { value: "",          label: "Semua Tipe"  },
  { value: "novel",     label: "Novel"       },
  { value: "comic",     label: "Komik"       },
  { value: "textbook",  label: "Buku Teks"   },
  { value: "journal",   label: "Jurnal"      },
];

interface Props {
  genres: { genre: string; book_count: number }[];
  currentGenre?: string;
  currentType?:  string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
}

export function StoreSidebar({ genres, currentGenre, currentType, currentMinPrice, currentMaxPrice }: Props) {
  const router = useRouter();
  const sp     = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/store?${params.toString()}`);
  }

  function clearAll() {
    router.push("/store");
  }

  const hasFilters = currentGenre || currentType || currentMinPrice || currentMaxPrice;

  return (
    <div className="space-y-6">
      {hasFilters && (
        <button onClick={clearAll}
          className="text-xs text-red-500 hover:underline">
          Reset semua filter
        </button>
      )}

      {/* Book type */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Tipe Buku</h3>
        <ul className="space-y-1">
          {BOOK_TYPES.map((t) => (
            <li key={t.value}>
              <button
                onClick={() => updateParam("book_type", t.value)}
                className={cn(
                  "w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors",
                  (currentType ?? "") === t.value
                    ? "bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Genre */}
      {genres.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Genre</h3>
          <ul className="space-y-1 max-h-64 overflow-y-auto">
            <li>
              <button
                onClick={() => updateParam("genre", "")}
                className={cn(
                  "w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors",
                  !currentGenre
                    ? "bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                Semua Genre
              </button>
            </li>
            {genres.map((g) => (
              <li key={g.genre}>
                <button
                  onClick={() => updateParam("genre", g.genre)}
                  className={cn(
                    "w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors flex justify-between",
                    currentGenre === g.genre
                      ? "bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <span className="capitalize">{g.genre}</span>
                  <span className="text-xs text-slate-400">{g.book_count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price range */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Harga (Rp)</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            defaultValue={currentMinPrice ?? ""}
            onBlur={(e) => updateParam("min_price", e.target.value)}
            className="input py-1.5 text-xs w-full"
          />
          <span className="text-slate-400 shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={currentMaxPrice ?? ""}
            onBlur={(e) => updateParam("max_price", e.target.value)}
            className="input py-1.5 text-xs w-full"
          />
        </div>
        <div className="mt-2 flex gap-1 flex-wrap">
          {[["0","50000","s/d 50rb"],["50000","100000","50–100rb"],["100000","","100rb+"]].map(([min,max,label]) => (
            <button key={label}
              onClick={() => {
                updateParam("min_price", min);
                updateParam("max_price", max);
              }}
              className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800
                         text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
