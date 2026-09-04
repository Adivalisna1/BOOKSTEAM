"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { PublisherSidebar } from "@/components/publisher/PublisherSidebar";
import { Loader2 } from "lucide-react";

export function PublisherAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, fetchMe, accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login?redirect=/publisher/dashboard");
      return;
    }
    if (!user) {
      fetchMe();
    } else if (user.role !== "publisher" && user.role !== "admin") {
      // Jika bukan publisher, redirect ke dashboard biasa
      router.replace("/dashboard/library");
    }
  }, [accessToken, user, fetchMe, router]);

  if (!accessToken) return null;

  if (isLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  // Double check sebelum render
  if (user.role !== "publisher" && user.role !== "admin") return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <PublisherSidebar />
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
