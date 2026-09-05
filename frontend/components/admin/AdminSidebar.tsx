"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/publishers", label: "Moderasi Publisher", icon: Users },
  { href: "/admin/books", label: "Moderasi Buku", icon: BookOpen },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <div className="card p-4 flex flex-col gap-2 min-h-[calc(100vh-8rem)]">
      <div className="mb-4 px-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Admin Panel</h2>
        <p className="text-sm text-slate-500">v1.0.0 Beta</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => logout()}
        className="flex items-center gap-3 px-3 py-2.5 mt-auto rounded-lg text-sm font-medium
                   text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <LogOut size={18} />
        Logout Admin
      </button>
    </div>
  );
}
