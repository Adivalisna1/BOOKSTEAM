import { Metadata } from "next";
import { PublisherAuthGuard } from "@/components/publisher/PublisherAuthGuard";

export const metadata: Metadata = {
  title: "Publisher Dashboard - BookSteam",
  description: "Kelola buku dan analytics penjualan Anda.",
};

export default function PublisherLayout({ children }: { children: React.ReactNode }) {
  return <PublisherAuthGuard>{children}</PublisherAuthGuard>;
}
