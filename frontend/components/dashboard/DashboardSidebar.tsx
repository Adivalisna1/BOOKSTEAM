"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen, Heart, User, Wallet, Bell,
  LogOut, ChevronRight, Star,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/library",       icon: <BookOpen size={16} />,  label: "Library"       },
  { href: "/dashboard/wishlist",      icon: <Heart size={16} />,     label: "Wishlist"      },
  { href: "/dashboard/wallet",        icon: <Wallet size={16} />,    label: "Wallet"        },
  { href: "/dashboard/notifications", icon: <Bell size={16} />,      label: "Notifikasi"    },
  { href: "/dashboard/profile",       icon: <User size={16} />,      label: "Profil"        },
];

// simple level bar computation
function getLevelProgress(exp: number): { current: number; next: number; pct: number } {
  const thresholds = [0, 100, 250, 500, 900, 1500, 2400, 3000, 4000, 5000];
  let idx = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (exp >= thresholds[i]) idx = i;
    else break;
  }
  const current = thresholds[idx] ?? 0;
  const next    = thresholds[idx + 1] ?? current + 1000;
  const pct     = Math.min(((exp - current) / (next - current)) * 100, 100);
  return { current, next, pct };
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const progress = user ? getLevelProgress(user.exp_total ?? 0) : null;

  return (
    <div className="space-y-4">
      {/* User card */}
      {user && (
        <div className="card p-4 space-y-3">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40
                            flex items-center justify-center text-primary-700 dark:text-primary-400
                            font-bold text-lg shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                {user.username}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                Level {user.level}
              </p>
            </div>
          </div>

          {/* EXP bar */}
          {progress && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>{user.exp_total} EXP</span>
                <span>Lv {user.level + 1}: {progress.next} EXP</span>
              </div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.pct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="card p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}>
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}

        <hr className="border-slate-200 dark:border-slate-700 my-1" />

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut size={16} />
          Keluar
        </button>
      </nav>
    </div>
  );
}
