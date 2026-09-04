"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Book, Upload, DollarSign, LogOut, ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/publisher/dashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
  { href: "/publisher/books",     icon: <Book size={16} />,            label: "Manajemen Buku" },
  { href: "/publisher/upload",    icon: <Upload size={16} />,          label: "Upload Buku" },
  { href: "/publisher/balance",   icon: <DollarSign size={16} />,      label: "Saldo & Penarikan" },
];

export function PublisherSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="space-y-4">
      {/* Publisher card */}
      {user && (
        <div className="card p-4 space-y-3">
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
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publisher
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="card p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
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
