"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2, BellOff } from "lucide-react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Notification {
  id:         string;
  title:      string;
  message:    string;
  type:       string;
  is_read:    boolean | number;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  purchase:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  return:    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  level_up:  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  family:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  review:    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  system:    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

export default function NotificationsPage() {
  const [notifs,   setNotifs]   = useState<Notification[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [unread,   setUnread]   = useState(0);
  const [marking,  setMarking]  = useState(false);

  useEffect(() => { fetchNotifs(); }, []);

  async function fetchNotifs() {
    setLoading(true);
    try {
      const { data } = await api.get("/user/notifications", { params: { limit: 50 } });
      setNotifs(data.data ?? []);
      setUnread(data.unread_count ?? 0);
    } catch {
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    setMarking(true);
    try {
      await api.patch("/user/notifications/read-all");
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch { /* ignore */ }
    finally { setMarking(false); }
  }

  async function markOneRead(id: string) {
    try {
      await api.patch(`/user/notifications/${id}/read`);
      setNotifs((prev) =>
        prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch { /* ignore */ }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell size={22} /> Notifikasi
          </h1>
          {unread > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {unread} belum dibaca
            </p>
          )}
        </div>

        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="btn-secondary text-sm flex items-center gap-2 py-2"
          >
            {marking
              ? <Loader2 size={14} className="animate-spin" />
              : <CheckCheck size={14} />}
            Tandai semua dibaca
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      )}

      {!loading && notifs.length === 0 && (
        <div className="card p-16 text-center">
          <BellOff size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">Tidak ada notifikasi</p>
        </div>
      )}

      {!loading && notifs.length > 0 && (
        <div className="space-y-2">
          {notifs.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markOneRead(n.id)}
              className={cn(
                "card p-4 flex gap-4 transition-all cursor-pointer",
                !n.is_read && "border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10"
              )}
            >
              {/* Unread dot */}
              <div className="mt-1 shrink-0">
                {!n.is_read
                  ? <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                  : <div className="w-2.5 h-2.5 rounded-full bg-transparent" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className={cn(
                    "text-sm font-semibold",
                    n.is_read
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-slate-900 dark:text-slate-100"
                  )}>
                    {n.title}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("badge text-xs", TYPE_COLORS[n.type] ?? TYPE_COLORS.system)}>
                      {n.type}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(n.created_at)}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
