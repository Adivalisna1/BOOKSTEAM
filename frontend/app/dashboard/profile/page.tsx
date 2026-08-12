"use client";

import { useEffect, useState } from "react";
import { User, Save, Loader2, Star, Trophy, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import { formatDate } from "@/lib/utils";

interface ExpEvent {
  id:          string;
  exp_amount:  number;
  source:      string;
  description: string;
  created_at:  string;
}

const SOURCE_LABELS: Record<string, string> = {
  purchase:     "Pembelian",
  finish_read:  "Selesai Baca",
  review:       "Review",
  daily_login:  "Login Harian",
  referral:     "Referral",
  return_deduct:"Return",
};

const LEVEL_THRESHOLDS = [
  { level: 1,  exp: 0,    unlock: "Akun dasar, beli & baca buku" },
  { level: 5,  exp: 500,  unlock: "🔓 Family Sharing (maks. 3 anggota)" },
  { level: 10, exp: 1500, unlock: "🔓 Family Sharing diperluas (maks. 6)" },
  { level: 15, exp: 3000, unlock: "🔓 Early Access buku baru" },
];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const [form,    setForm]    = useState({ username: "", avatar_url: "" });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const [expHistory, setExpHistory] = useState<ExpEvent[]>([]);
  const [expLoading, setExpLoading] = useState(true);

  useEffect(() => {
    if (user) setForm({ username: user.username, avatar_url: user.avatar_url ?? "" });
  }, [user]);

  useEffect(() => {
    api.get("/user/profile/exp", { params: { limit: 10 } })
      .then(({ data }) => setExpHistory(data.data ?? []))
      .catch(() => setExpHistory([]))
      .finally(() => setExpLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const payload: Record<string, string> = {};
      if (form.username !== user?.username)   payload.username   = form.username;
      if (form.avatar_url !== (user?.avatar_url ?? "")) payload.avatar_url = form.avatar_url;

      if (Object.keys(payload).length === 0) {
        setSaving(false);
        return;
      }

      const { data } = await api.put("/user/profile", payload);
      setUser(data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message ?? "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  // EXP progress to next level
  const exp       = user?.exp_total ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.exp > exp);
  const prevThreshold = [...LEVEL_THRESHOLDS].reverse().find((t) => t.exp <= exp) ?? LEVEL_THRESHOLDS[0];
  const expPct = nextThreshold
    ? ((exp - prevThreshold.exp) / (nextThreshold.exp - prevThreshold.exp)) * 100
    : 100;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <User size={22} /> Profil
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left — edit form */}
        <div className="lg:col-span-3 space-y-6">

          {/* Avatar preview */}
          <div className="card p-6 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/40
                            flex items-center justify-center text-primary-700 dark:text-primary-400
                            font-bold text-3xl shrink-0 overflow-hidden">
              {form.avatar_url
                ? <img src={form.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                : user?.username?.[0]?.toUpperCase()
              }
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{user?.username}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs">
                  <Star size={10} className="mr-1 fill-amber-400 text-amber-400" />
                  Level {user?.level}
                </span>
                {user?.is_verified && (
                  <span className="badge bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                    <CheckCircle2 size={10} className="mr-1" /> Terverifikasi
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Edit Profil</h2>
            <form onSubmit={handleSave} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                                border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400
                                border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 text-sm
                                flex items-center gap-2">
                  <CheckCircle2 size={16} /> Profil berhasil diperbarui!
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Username
                </label>
                <input
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  minLength={3} maxLength={50}
                  pattern="[a-zA-Z0-9_]+"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={form.avatar_url}
                  onChange={(e) => setForm((p) => ({ ...p, avatar_url: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <input value={user?.email ?? ""} disabled className="input opacity-50 cursor-not-allowed" />
                <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah dari sini.</p>
              </div>

              <button type="submit" disabled={saving}
                className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Menyimpan…" : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>

        {/* Right — EXP & Level */}
        <div className="lg:col-span-2 space-y-6">

          {/* EXP Overview */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" /> EXP & Level
            </h2>

            <div className="text-center">
              <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">
                {user?.exp_total?.toLocaleString("id-ID") ?? 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total EXP</p>
            </div>

            {nextThreshold && (
              <>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Level {user?.level}</span>
                  <span>Level {user?.level ? user.level + 1 : 2}: {nextThreshold.exp.toLocaleString()} EXP</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all duration-700"
                    style={{ width: `${expPct}%` }} />
                </div>
                <p className="text-xs text-center text-slate-400">
                  {(nextThreshold.exp - exp).toLocaleString()} EXP lagi ke level berikutnya
                </p>
              </>
            )}

            {/* Level milestones */}
            <div className="space-y-2 mt-2">
              {LEVEL_THRESHOLDS.map((t) => (
                <div key={t.level}
                  className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2
                    ${exp >= t.exp
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "bg-slate-50 dark:bg-slate-800/50 text-slate-400"}`}>
                  <CheckCircle2 size={12} className="mt-0.5 shrink-0" />
                  <span><strong>Lv {t.level}</strong> — {t.unlock}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent EXP history */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Riwayat EXP</h2>
            {expLoading && <Loader2 size={20} className="animate-spin text-primary-500 mx-auto" />}
            {!expLoading && expHistory.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Belum ada aktivitas EXP.</p>
            )}
            {!expLoading && expHistory.length > 0 && (
              <div className="space-y-2">
                {expHistory.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        {ev.description || SOURCE_LABELS[ev.source] || ev.source}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(ev.created_at)}</p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${
                      ev.exp_amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"
                    }`}>
                      {ev.exp_amount >= 0 ? "+" : ""}{ev.exp_amount} EXP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
