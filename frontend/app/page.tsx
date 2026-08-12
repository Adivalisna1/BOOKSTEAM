import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Users, Zap, BookOpen, ShieldCheck, Repeat2 } from "lucide-react";
import { BookCard, type Book } from "@/components/BookCard";
import api from "@/lib/api";

export const metadata: Metadata = {
  title: "BookSteam — Platform Buku Digital Indonesia",
  description: "Beli, baca, dan bagikan buku digital favoritmu. EXP system, Family Sharing, ribuan judul.",
};

interface HomeEvent {
  id: string;
  title: string;
  link_url?: string | null;
  description?: string | null;
  banner_url?: string | null;
}

async function getFeaturedBooks(): Promise<Book[]> {
  try {
    const { data } = await api.get("/books/featured");
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function getNewReleases(): Promise<Book[]> {
  try {
    const { data } = await api.get("/books/new-releases");
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function getActiveEvents(): Promise<HomeEvent[]> {
  try {
    const { data } = await api.get("/events");
    return data.data ?? [];
  } catch {
    return [];
  }
}

const FEATURES = [
  {
    icon: <Zap size={24} className="text-amber-500" />,
    title: "EXP & Level System",
    desc: "Dapatkan EXP setiap beli, baca, dan review. Level up untuk buka fitur eksklusif.",
  },
  {
    icon: <Users size={24} className="text-green-500" />,
    title: "Family Sharing",
    desc: "Bagikan buku ke anggota keluarga. Satu buku, dinikmati bersama.",
  },
  {
    icon: <ShieldCheck size={24} className="text-blue-500" />,
    title: "Pembayaran Aman",
    desc: "GoPay, OVO, QRIS, kartu kredit, atau wallet internal BookSteam.",
  },
  {
    icon: <Repeat2 size={24} className="text-purple-500" />,
    title: "Return Policy",
    desc: "Tidak puas? Return dalam 5 hari, refund langsung ke wallet.",
  },
];

export default async function HomePage() {
  const [featured, newReleases, events] = await Promise.all([
    getFeaturedBooks(),
    getNewReleases(),
    getActiveEvents(),
  ]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        {/* decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold
                             px-3 py-1.5 rounded-full mb-6">
              <BookOpen size={14} />
              Platform Buku Digital Indonesia
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Toko Buku Digital<br />
              <span className="text-amber-400">Bergaya Steam</span>
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed">
              Ribuan judul novel, komik, buku teks, dan jurnal. Beli sekali, baca selamanya.
              Kumpulkan EXP, level up, dan nikmati Family Sharing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/store" className="btn-primary bg-white !text-primary-700 hover:!bg-white/90
                                              flex items-center gap-2">
                Jelajahi Store
                <ArrowRight size={16} />
              </Link>
              <Link href="/register" className="btn-secondary !bg-white/10 !border-white/20
                                                 !text-white hover:!bg-white/20">
                Daftar Gratis
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-8">
              {[
                { value: "10.000+", label: "Judul Buku" },
                { value: "50.000+", label: "Pengguna" },
                { value: "500+",    label: "Publisher" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Active Events / Banners ── */}
      {events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {events.map((event) => (
              <Link
                key={event.id}
                href={event.link_url ?? "/store"}
                className="flex-none w-72 sm:w-96 card overflow-hidden group"
              >
                {event.banner_url ? (
                  <div className="relative h-32 w-full">
                    <Image
                      src={event.banner_url}
                      alt={event.title}
                      fill
                      sizes="384px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <div>
                        <p className="text-xs text-white/70 font-medium uppercase tracking-wide">Event</p>
                        <p className="text-white font-bold text-lg leading-tight">{event.title}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700 flex items-end p-4">
                    <div>
                      <p className="text-xs text-white/70 font-medium uppercase tracking-wide">Event</p>
                      <p className="text-white font-bold text-lg leading-tight">{event.title}</p>
                    </div>
                  </div>
                )}
                {event.description && (
                  <p className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {event.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Books ── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Star size={20} className="fill-amber-400 text-amber-400" />
                Buku Pilihan
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kurasi terbaik dari tim BookSteam</p>
            </div>
            <Link href="/store?sort_by=popular"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline
                         flex items-center gap-1">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featured.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        </section>
      )}

      {/* ── New Releases ── */}
      {newReleases.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                🆕 Baru Rilis
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Buku terbaru yang baru saja hadir</p>
            </div>
            <Link href="/store?sort_by=newest"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline
                         flex items-center gap-1">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {newReleases.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="bg-slate-50 dark:bg-slate-800/30 border-y border-slate-200 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100 mb-12">
            Kenapa BookSteam?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="card bg-gradient-to-r from-primary-600 to-primary-800 border-0 p-10 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-3">Mulai Membaca Hari Ini</h2>
          <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
            Daftar gratis dan dapatkan akses ke ribuan judul buku digital pilihan.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-primary !bg-white !text-primary-700 hover:!bg-white/90">
              Buat Akun Gratis
            </Link>
            <Link href="/store" className="btn-secondary !bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
              Lihat Katalog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
