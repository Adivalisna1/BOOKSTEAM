"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Search, BookOpen, Menu, X,
  BookMarked, Heart, Wallet, Bell, User, LogOut, ChevronDown, Star, LayoutDashboard, Upload
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/authStore";

const NAV_LINKS = [
  { href: "/store",  label: "Store"  },
  { href: "/search", label: "Browse" },
];

const USER_MENU = [
  { href: "/dashboard/library",       icon: <BookMarked size={15} />, label: "Library"    },
  { href: "/dashboard/wishlist",      icon: <Heart size={15} />,      label: "Wishlist"   },
  { href: "/dashboard/wallet",        icon: <Wallet size={15} />,     label: "Wallet"     },
  { href: "/dashboard/notifications", icon: <Bell size={15} />,       label: "Notifikasi" },
  { href: "/dashboard/profile",       icon: <User size={15} />,       label: "Profil"     },
];

const PUBLISHER_MENU = [
  { href: "/publisher/dashboard",     icon: <LayoutDashboard size={15} />, label: "Dashboard Publisher" },
  { href: "/publisher/upload",        icon: <Upload size={15} />,          label: "Upload Buku" },
  { href: "/publisher/balance",       icon: <Wallet size={15} />,          label: "Saldo Publisher" },
];

const ADMIN_MENU = [
  { href: "/admin",                   icon: <LayoutDashboard size={15} />, label: "Admin Panel" },
  { href: "/admin/publishers",        icon: <User size={15} />,            label: "Moderasi Publisher" },
  { href: "/admin/books",             icon: <BookOpen size={15} />,        label: "Moderasi Buku" },
];

export function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();

  const { user, logout } = useAuthStore();

  const [query,       setQuery]       = useState("");
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setMobileOpen(false);
    }
  }

  async function handleLogout() {
    setDropOpen(false);
    setMobileOpen(false);
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur
                        border-b border-slate-200 dark:border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0
                                   text-primary-600 dark:text-primary-400">
          <BookOpen size={22} />
          <span>BookSteam</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              )}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search — desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md ml-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari buku, genre, penulis…"
              className="input pl-9 py-2 text-sm"
            />
          </div>
        </form>

        <div className="flex-1 md:hidden" />

        {/* Right */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* ── LOGGED IN ── */}
          {user ? (
            <div className="hidden md:block relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg
                           hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40
                                flex items-center justify-center text-primary-700 dark:text-primary-400
                                font-bold text-sm overflow-hidden shrink-0">
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    : user.username[0].toUpperCase()
                  }
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">
                    {user.username}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-0.5 mt-0.5">
                    <Star size={9} className="fill-amber-400 text-amber-400" />
                    Lv {user.level}
                  </p>
                </div>
                <ChevronDown size={14} className={cn(
                  "text-slate-400 transition-transform duration-200",
                  dropOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown */}
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 card shadow-lg py-1 z-50">
                  {/* Mini user info */}
                  <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 mb-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>

                  {(user.role === 'admin' ? ADMIN_MENU : user.role === 'publisher' ? PUBLISHER_MENU : USER_MENU).map((item) => (
                    <Link key={item.href} href={item.href}
                      onClick={() => setDropOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                        pathname.startsWith(item.href)
                          ? "text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}>
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}

                  <hr className="border-slate-200 dark:border-slate-700 my-1" />

                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm
                               text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut size={15} />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── GUEST ── */
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300
                           hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                Masuk
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2">
                Daftar
              </Link>
            </div>
          )}

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800
                        bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari buku…"
                className="input pl-9 py-2 text-sm"
              />
            </div>
            <button type="submit" className="btn-primary py-2 px-4 text-sm">Cari</button>
          </form>

          {/* Nav links */}
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700
                         dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              {link.label}
            </Link>
          ))}

          {/* Logged in — mobile */}
          {user ? (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
              {/* User info */}
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40
                                flex items-center justify-center text-primary-700 dark:text-primary-400
                                font-bold shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user.username}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Lv {user.level}</p>
                </div>
              </div>

              {(user.role === 'admin' ? ADMIN_MENU : user.role === 'publisher' ? PUBLISHER_MENU : USER_MENU).map((item) => (
                <Link key={item.href} href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                             text-slate-700 dark:text-slate-300
                             hover:bg-slate-100 dark:hover:bg-slate-800">
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                           text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut size={15} />
                Keluar
              </button>
            </div>
          ) : (
            /* Guest — mobile */
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2 text-sm font-medium border border-slate-200
                           dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                Masuk
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}
                className="flex-1 text-center btn-primary text-sm py-2">
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
