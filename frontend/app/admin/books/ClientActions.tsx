"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export function ClientActions({ bookId, currentStatus }: { bookId: string, currentStatus: string }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | "takedown" | null>(null);
  
  const [showModal, setShowModal] = useState<"reject" | "takedown" | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function handleApprove() {
    if (!confirm("Yakin ingin menyetujui buku ini untuk dipublikasikan?")) return;
    setLoadingAction("approve");
    try {
      await api.patch(`/admin/books/${bookId}/approve`);
      router.refresh();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menyetujui.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleReasonSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (reason.length < 5) {
      setError("Alasan minimal 5 karakter.");
      return;
    }
    
    const action = showModal!;
    setLoadingAction(action);
    setError("");
    
    try {
      await api.patch(`/admin/books/${bookId}/${action}`, { reason });
      setShowModal(null);
      setReason("");
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message || `Gagal melakukan ${action}.`);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {currentStatus === "pending" && (
          <>
            <button
              onClick={handleApprove}
              disabled={loadingAction !== null}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {loadingAction === "approve" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Setujui
            </button>
            <button
              onClick={() => setShowModal("reject")}
              disabled={loadingAction !== null}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 bg-red-600 hover:bg-red-700"
            >
              <XCircle size={14} />
              Tolak
            </button>
          </>
        )}
        
        {currentStatus === "approved" && (
          <button
            onClick={() => setShowModal("takedown")}
            disabled={loadingAction !== null}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 bg-amber-600 hover:bg-amber-700"
          >
            <AlertTriangle size={14} />
            Takedown
          </button>
        )}
        
        {currentStatus !== "pending" && currentStatus !== "approved" && (
          <span className="text-xs text-slate-400 italic">Selesai</span>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              {showModal === "reject" ? "Tolak Buku" : "Takedown Buku"}
            </h3>
            <form onSubmit={handleReasonSubmit}>
              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Alasan {showModal === "reject" ? "Penolakan" : "Takedown"}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input min-h-[100px] resize-y"
                  placeholder="Berikan alasan detail (minimal 5 karakter)..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="btn-secondary"
                  disabled={loadingAction !== null}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`btn-primary ${showModal === "takedown" ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700"}`}
                  disabled={loadingAction !== null}
                >
                  {loadingAction ? "Menyimpan..." : "Konfirmasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
