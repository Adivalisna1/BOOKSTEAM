"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  currentPage: number;
  totalPages:  number;
  searchParams: Record<string, string | undefined>;
}

export function StorePagination({ currentPage, totalPages, searchParams }: Props) {
  const router = useRouter();

  function goTo(page: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, v);
    });
    params.set("page", String(page));
    router.push(`/store?${params.toString()}`);
  }

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3)             pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg
                   disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="w-9 text-center text-slate-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p as number)}
            className={cn(
              "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
              p === currentPage
                ? "bg-primary-600 text-white"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg
                   disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
