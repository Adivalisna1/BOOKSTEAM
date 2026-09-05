"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export function ClientActions({ publisherId }: { publisherId: string }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function handleApprove() {
    if (!confirm("Yakin ingin menyetujui pendaftaran publisher ini?")) return;
    setLoadingAction("approve");
    try {
      await api.patch(`/admin/publishers/${publisherId}/approve`);
      router.refresh();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menyetujui.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (reason.length < 5) {
      setError("Alasan penolakan minimal 5 karakter.");
      return;
    }
    setLoadingAction("reject");
    setError("");
    try {
      await api.patch(`/admin/publishers/${publisherId}/reject`, { reason });
      setShowRejectModal(false);
      setReason("");
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menolak.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleApprove}
          disabled={loadingAction !== null}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
        >
          {loadingAction === "approve" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          Setujui
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={loadingAction !== null}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
        >
          <XCircle size={14} />
          Tolak
        </button>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Tolak Publisher</h3>
            <form onSubmit={handleReject}>
              {error && (
                <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Alasan Penolakan
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input min-h-[100px] resize-y"
                  placeholder="Berikan alasan detail kenapa pendaftaran ditolak (minimal 5 karakter)..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="btn-secondary"
                  disabled={loadingAction === "reject"}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary bg-red-600 hover:bg-red-700"
                  disabled={loadingAction === "reject"}
                >
                  {loadingAction === "reject" ? "Menyimpan..." : "Konfirmasi Tolak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
