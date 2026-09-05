import { Metadata } from "next";
import Link from "next/link";
import api from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { StorePagination } from "@/components/StorePagination";
import { ClientActions } from "./ClientActions";

export const metadata: Metadata = {
  title: "Moderasi Buku - Admin",
};

interface SearchParams {
  page?: string;
  status?: string;
}

async function getBooks(page: string, status?: string) {
  try {
    const { data } = await api.get("/admin/books", {
      params: { page, limit: 10, status: status || undefined },
    });
    return data;
  } catch (err) {
    return { data: [], pagination: { total: 0, total_pages: 0, page: 1, limit: 10 } };
  }
}

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const currentPage = parseInt(searchParams.page ?? "1", 10);
  const statusFilter = searchParams.status ?? "";

  const result = await getBooks(currentPage.toString(), statusFilter);
  const books = result.data ?? [];
  const pagination = result.pagination ?? { total: 0, total_pages: 0, page: 1 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Moderasi Buku</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dan tinjau buku yang di-upload oleh publisher.</p>
        </div>
      </div>

      <div className="card p-1 pb-0 shadow-sm overflow-x-auto">
        {/* Tabs Filter */}
        <div className="flex items-center gap-6 px-5 border-b border-slate-200 dark:border-slate-800">
          {[
            { label: "Semua", value: "" },
            { label: "Pending", value: "pending" },
            { label: "Live (Disetujui)", value: "approved" },
            { label: "Ditolak", value: "rejected" },
            { label: "Takedown", value: "takedown" },
          ].map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <Link
                key={tab.label}
                href={`/admin/books${tab.value ? `?status=${tab.value}` : ""}`}
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
                <th className="px-5 py-4 w-1/3">Buku</th>
                <th className="px-5 py-4">Publisher</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Tanggal Upload</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Tidak ada data buku.
                  </td>
                </tr>
              ) : (
                books.map((book: any) => (
                  <tr key={book.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        {book.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={book.cover_url} alt="Cover" className="w-12 h-16 object-cover rounded shadow-sm bg-slate-100" />
                        ) : (
                          <div className="w-12 h-16 bg-slate-200 dark:bg-slate-700 rounded shadow-sm"></div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1" title={book.title}>
                            {book.title}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 capitalize">
                            {book.book_type} • {book.genre}
                          </div>
                          <a href={book.file_url} target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-400 hover:underline inline-block mt-1">
                            Lihat File Buku
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium">{book.publisher_name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                          book.status === "approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : book.status === "rejected" || book.status === "takedown"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {book.status}
                      </span>
                      {book.rejection_reason && (
                        <p className="text-[10px] text-red-500 mt-1 max-w-[150px] line-clamp-2" title={book.rejection_reason}>
                          {book.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {format(new Date(book.created_at), "dd MMM yyyy", { locale: id })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <ClientActions bookId={book.id} currentStatus={book.status} />
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
