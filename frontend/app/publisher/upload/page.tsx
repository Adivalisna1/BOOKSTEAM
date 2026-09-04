"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud, BookText, Image as ImageIcon } from "lucide-react";
import api from "@/lib/api";

export default function PublisherUploadPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [bookType, setBookType] = useState("novel");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("id");
  
  // File states for UI only (we will use dummy URLs for the actual API call for v0.1.0)
  const [coverFileName, setCoverFileName] = useState("");
  const [bookFileName, setBookFileName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Dummy URLs because backend hasn't integrated S3 yet
      const dummyCoverUrl = `https://dummyimage.com/600x800/e2e8f0/475569&text=${encodeURIComponent(title || "Cover")}`;
      const dummyFileUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

      await api.post("/publisher/books", {
        title,
        description,
        price: parseFloat(price) || 0,
        book_type: bookType,
        genre,
        language,
        cover_url: dummyCoverUrl,
        file_url: dummyFileUrl,
        is_family_shareable: false,
        is_early_access: false,
        total_pages: 100 // Dummy value
      });

      setSuccess(true);
      
      // Reset form
      setTitle("");
      setDescription("");
      setPrice("0");
      setGenre("");
      setCoverFileName("");
      setBookFileName("");
      
      setTimeout(() => {
        router.push("/publisher/dashboard");
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengunggah buku. Pastikan semua data terisi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Upload Buku Baru
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Lengkapi detail buku yang ingin diterbitkan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg text-sm border border-green-200 dark:border-green-800">
            Buku berhasil diunggah! Mengalihkan ke dashboard...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Judul */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Judul Buku <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
              placeholder="Contoh: Sang Pemimpi"
            />
          </div>

          {/* Tipe & Genre */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Tipe Buku <span className="text-red-500">*</span>
            </label>
            <select
              value={bookType}
              onChange={(e) => setBookType(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
            >
              <option value="novel">Novel</option>
              <option value="comic">Komik</option>
              <option value="textbook">Buku Pelajaran</option>
              <option value="journal">Jurnal Ilmiah</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Genre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
              placeholder="Contoh: Fiksi, Roman"
            />
          </div>

          {/* Harga & Bahasa */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Harga (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
              placeholder="0 (Isi 0 untuk Gratis)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Bahasa <span className="text-red-500">*</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
            >
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Sinopsis / Deskripsi
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none resize-none"
              placeholder="Tuliskan ringkasan cerita atau isi buku..."
            />
          </div>

          {/* File Uploads (Mock) */}
          <div className="space-y-4 md:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Berkas Buku</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cover Input */}
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                  onChange={(e) => setCoverFileName(e.target.files?.[0]?.name || "")}
                />
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                  <ImageIcon size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload Cover</p>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">
                    {coverFileName || "JPG, PNG, WEBP (Max 2MB)"}
                  </p>
                </div>
              </label>

              {/* PDF Input */}
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <input 
                  type="file" 
                  accept="application/pdf, application/epub+zip" 
                  className="hidden" 
                  onChange={(e) => setBookFileName(e.target.files?.[0]?.name || "")}
                />
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                  <BookText size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload File Buku</p>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">
                    {bookFileName || "PDF atau EPUB (Max 50MB)"}
                  </p>
                </div>
              </label>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              * Untuk versi Beta, file yang diunggah akan digantikan dengan file dummy di server.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !title || !genre || !price}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Mengunggah...
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                Terbitkan Buku
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
