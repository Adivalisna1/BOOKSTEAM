"use client";

import { useEffect, useState } from "react";
import {
  Wallet, ArrowDownCircle, ArrowUpCircle,
  Loader2, Clock, CheckCircle2, XCircle, ReceiptText,
} from "lucide-react";
import api from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type TabType = "transactions" | "topup";

interface Transaction {
  id:                       string;
  amount:                   number;
  payment_method:           string;
  status:                   string;
  purchase_at:              string;
  return_window_expires_at: string | null;
  book_title:               string;
  cover_url:                string | null;
}

interface TopUp {
  id:             string;
  amount:         number;
  payment_method: string;
  status:         string;
  created_at:     string;
}

interface WalletSummary {
  wallet_balance: number;
  total_topup:    number;
  total_spent:    number;
}

const STATUS_BADGE: Record<string, string> = {
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  refunded:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  success:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  failed:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={14} />,
  success:   <CheckCircle2 size={14} />,
  pending:   <Clock size={14} />,
  refunded:  <ArrowUpCircle size={14} />,
  failed:    <XCircle size={14} />,
};

export default function WalletPage() {
  const [summary,  setSummary]  = useState<WalletSummary | null>(null);
  const [tab,      setTab]      = useState<TabType>("transactions");
  const [txList,   setTxList]   = useState<Transaction[]>([]);
  const [topupList, setTopupList] = useState<TopUp[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get("/user/wallet").then(({ data }) => setSummary(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchList();
  }, [tab, page]);

  async function fetchList() {
    setLoading(true);
    try {
      const endpoint = tab === "transactions"
        ? "/user/wallet/transactions"
        : "/user/wallet/topup-history";
      const { data } = await api.get(endpoint, { params: { page, limit: 10 } });
      if (tab === "transactions") setTxList(data.data ?? []);
      else setTopupList(data.data ?? []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.total_pages ?? 1);
    } catch {
      if (tab === "transactions") setTxList([]);
      else setTopupList([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Wallet size={22} /> Wallet
      </h1>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Saldo",         value: summary.wallet_balance, icon: <Wallet size={18} />,          color: "text-primary-600 dark:text-primary-400" },
            { label: "Total Top-Up",  value: summary.total_topup,    icon: <ArrowDownCircle size={18} />, color: "text-green-600 dark:text-green-400" },
            { label: "Total Pengeluaran", value: summary.total_spent, icon: <ArrowUpCircle size={18} />,  color: "text-red-500 dark:text-red-400" },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <div className={`mb-2 ${s.color}`}>{s.icon}</div>
              <p className={`text-2xl font-extrabold ${s.color}`}>{formatPrice(s.value)}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {(["transactions", "topup"] as TabType[]).map((t) => (
          <button key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t
                ? "border-primary-600 text-primary-700 dark:text-primary-400 dark:border-primary-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}>
            {t === "transactions" ? `Transaksi (${total})` : `Riwayat Top-Up (${total})`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-primary-500" />
        </div>
      )}

      {!loading && tab === "transactions" && txList.length === 0 && (
        <div className="card p-12 text-center">
          <ReceiptText size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Belum ada transaksi.</p>
        </div>
      )}

      {!loading && tab === "transactions" && txList.length > 0 && (
        <div className="space-y-3">
          {txList.map((tx) => (
            <div key={tx.id} className="card p-4 flex items-center gap-4">
              <ArrowUpCircle size={20} className="text-red-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {tx.book_title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {tx.payment_method.toUpperCase()} · {formatDate(tx.purchase_at)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {formatPrice(tx.amount)}
                </p>
                <span className={cn("badge text-xs mt-1 flex items-center gap-1", STATUS_BADGE[tx.status])}>
                  {STATUS_ICON[tx.status]}
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "topup" && topupList.length === 0 && (
        <div className="card p-12 text-center">
          <ArrowDownCircle size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Belum ada riwayat top-up.</p>
        </div>
      )}

      {!loading && tab === "topup" && topupList.length > 0 && (
        <div className="space-y-3">
          {topupList.map((t) => (
            <div key={t.id} className="card p-4 flex items-center gap-4">
              <ArrowDownCircle size={20} className="text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Top-Up Wallet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.payment_method.toUpperCase()} · {formatDate(t.created_at)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  +{formatPrice(t.amount)}
                </p>
                <span className={cn("badge text-xs mt-1 flex items-center gap-1", STATUS_BADGE[t.status])}>
                  {STATUS_ICON[t.status]}
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2">
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
    </div>
  );
}
