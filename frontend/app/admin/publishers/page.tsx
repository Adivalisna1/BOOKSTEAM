import { Metadata } from "next";
import Link from "next/link";
import api from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { StorePagination } from "@/components/StorePagination";
import { ClientActions } from "./ClientActions";

export const metadata: Metadata = {
  title: "Moderasi Publisher - Admin",
};

interface SearchParams {
  page?: string;
  status?: string;
}

async function getPublishers(page: string, status?: string) {
  try {
    const { data } = await api.get("/admin/publishers", {
      params: { page, limit: 10, status: status || undefined },
    });
    return data;
  } catch (err) {
    return { data: [], pagination: { total: 0, total_pages: 0, page: 1, limit: 10 } };
  }
}

export default async function AdminPublishersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const currentPage = parseInt(searchParams.page ?? "1", 10);
  const statusFilter = searchParams.status ?? "";

  const result = await getPublishers(currentPage.toString(), statusFilter);
  const publishers = result.data ?? [];
  const pagination = result.pagination ?? { total: 0, total_pages: 0, page: 1 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Moderasi Publisher</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dan tinjau pendaftaran publisher baru.</p>
        </div>
      </div>

      <div className="card p-1 pb-0 shadow-sm overflow-x-auto">
        {/* Tabs Filter */}
        <div className="flex items-center gap-6 px-5 border-b border-slate-200 dark:border-slate-800">
          {[
            { label: "Semua", value: "" },
            { label: "Pending", value: "pending" },
            { label: "Disetujui", value: "approved" },
            { label: "Ditolak", value: "rejected" },
          ].map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <Link
                key={tab.label}
                href={`/admin/publishers${tab.value ? `?status=${tab.value}` : ""}`}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Table */}
        <div className="p-0 min-w-[800px]">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-5 py-4">Publisher</th>
                <th className="px-5 py-4">Tipe & Dokumen</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Tanggal Daftar</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {publishers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Tidak ada data publisher.
                  </td>
                </tr>
              ) : (
                publishers.map((pub: any) => (
                  <tr key={pub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{pub.display_name}</div>
                      <div className="text-xs mt-0.5 line-clamp-1">{pub.bio || "-"}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 capitalize">
                        {pub.publisher_type}
                      </span>
                      <div className="mt-1">
                        {pub.document_url ? (
                          <a href={pub.document_url} target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                            Lihat Dokumen
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                          pub.status === "approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : pub.status === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {pub.status}
                      </span>
                      {pub.rejection_reason && (
                        <p className="text-[10px] text-red-500 mt-1 max-w-[150px] line-clamp-2" title={pub.rejection_reason}>
                          {pub.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {format(new Date(pub.created_at), "dd MMM yyyy", { locale: id })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        {pub.status === "pending" ? (
                          <ClientActions publisherId={pub.id} />
                        ) : (
                          <span className="text-xs text-slate-400 italic">Selesai</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {pagination.total_pages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <StorePagination
              currentPage={currentPage}
              totalPages={pagination.total_pages}
              searchParams={{ page: currentPage.toString(), status: statusFilter }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
