"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";

const PASSWORD_RULES = [
  { label: "Minimal 8 karakter",       test: (p: string) => p.length >= 8 },
  { label: "Mengandung huruf kapital",  test: (p: string) => /[A-Z]/.test(p) },
  { label: "Mengandung angka",          test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      useAuthStore.getState().setAuth(data.user, data.access_token, data.refresh_token);
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Pendaftaran gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const allRulesMet = PASSWORD_RULES.every((r) => r.test(form.password));

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xl">
            <BookOpen size={24} />
            BookSteam
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Buat akun baru</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* Success state */}
        {success && (
          <div className="card p-8 text-center space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-green-500" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">Akun berhasil dibuat!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Mengalihkan ke halaman utama…</p>
          </div>
        )}

        {!success && (
          <div className="card p-8 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                                border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="kamu@email.com"
                  className="input"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="username_kamu"
                  minLength={3}
                  maxLength={50}
                  pattern="[a-zA-Z0-9_]+"
                  title="Hanya huruf, angka, dan underscore"
                  className="input"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Hanya huruf, angka, dan underscore (_)
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password rules */}
                {form.password.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {PASSWORD_RULES.map((rule) => (
                      <li key={rule.label}
                        className={`text-xs flex items-center gap-1.5
                          ${rule.test(form.password)
                            ? "text-green-600 dark:text-green-400"
                            : "text-slate-400"}`}
                      >
                        <CheckCircle2 size={12} />
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !allRulesMet}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Mendaftarkan…" : "Buat Akun"}
              </button>

              <p className="text-xs text-center text-slate-400">
                Dengan mendaftar, kamu menyetujui syarat dan ketentuan BookSteam.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
