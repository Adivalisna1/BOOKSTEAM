import { Metadata } from "next";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

export const metadata: Metadata = {
  title: "Admin Dashboard - BookSteam",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
