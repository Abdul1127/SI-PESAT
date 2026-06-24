"use client";

import { useState } from "react";
import Link from "next/link";
import { Info, MapPin, MessageCircle, Search, Store, Tags } from "lucide-react";

export default function UmkmList({ umkm }: { umkm: any[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const categories = Array.from(
    new Map(
      umkm
        .filter((item) => item.categories)
        .map((item) => [
          item.categories.slug,
          {
            name: item.categories.name,
            slug: item.categories.slug,
          },
        ])
    ).values()
  );

  const filteredUmkm = umkm.filter((item) => {
    const matchSearch = item.business_name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      selectedCategory === "semua" ||
      item.categories?.slug === selectedCategory;

    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filteredUmkm.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUmkm = filteredUmkm.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="mb-3 font-semibold text-gray-900">Pencarian</p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama UMKM..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-xl border bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="mt-5">
            <p className="mb-3 font-semibold text-gray-900">Kategori</p>

            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange("semua")}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium ${
                  selectedCategory === "semua"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>Semua Kategori</span>
                <span>{umkm.length}</span>
              </button>

              {categories.map((category: any) => {
                const count = umkm.filter(
                  (item) => item.categories?.slug === category.slug
                ).length;

                return (
                  <button
                    key={category.slug}
                    onClick={() => handleCategoryChange(category.slug)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium ${
                      selectedCategory === category.slug
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate">{category.name}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="font-semibold text-gray-900">Informasi</p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-3">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700">Total UMKM</span>
              </div>
              <span className="font-bold text-gray-900">{umkm.length}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Ditampilkan</span>
              </div>
              <span className="font-bold text-gray-900">
                {filteredUmkm.length}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-indigo-50 p-3">
              <div className="flex items-center gap-3">
                <Tags className="h-5 w-5 text-indigo-600" />
                <span className="text-sm text-gray-700">Kategori</span>
              </div>
              <span className="font-bold text-gray-900">
                {categories.length}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Daftar UMKM</h3>
            <p className="mt-1 text-sm text-gray-600">
              Menampilkan {filteredUmkm.length === 0 ? 0 : startIndex + 1}-
              {Math.min(endIndex, filteredUmkm.length)} dari{" "}
              {filteredUmkm.length} UMKM.
            </p>
          </div>

          <select className="rounded-xl border bg-white px-4 py-3 text-sm text-gray-700 outline-none">
            <option>Terbaru</option>
            <option>Nama A-Z</option>
          </select>
        </div>

        <div className="space-y-3">
          {currentUmkm.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Store className="h-9 w-9" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-xl font-bold text-gray-900">
                      {item.business_name}
                    </h3>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {item.categories?.name ?? "Tanpa kategori"}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>

                  <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 shrink-0 text-rose-500" />
                    {item.short_address ?? "Alamat belum tersedia"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/umkm/${item.slug}`}
                    className="group flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border bg-white text-sm font-semibold text-gray-700 transition-all hover:w-24 hover:bg-gray-50"
                  >
                    <Info className="h-5 w-5 group-hover:hidden" />
                    <span className="hidden group-hover:inline">Detail</span>
                  </Link>

                  {item.phone && (
                    <a
                      href={`https://wa.me/${item.phone.replace(/^0/, "62")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-green-600 text-sm font-semibold text-white transition-all hover:w-28 hover:bg-green-700"
                    >
                      <MessageCircle className="h-5 w-5 group-hover:hidden" />
                      <span className="hidden group-hover:inline">WhatsApp</span>
                    </a>
                  )}

                  {item.gmaps_url && (
                    <a
                      href={item.gmaps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-sm font-semibold text-white transition-all hover:w-24 hover:bg-blue-700"
                    >
                      <MapPin className="h-5 w-5 group-hover:hidden" />
                      <span className="hidden group-hover:inline">Maps</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUmkm.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
              )
              .map((page, index, array) => (
                <div key={page} className="flex items-center gap-2">
                  {index > 0 && page - array[index - 1] > 1 && (
                    <span className="text-sm text-gray-400">...</span>
                  )}

                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border bg-white text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                </div>
              ))}

            <button
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        )}

        {filteredUmkm.length === 0 && (
          <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-gray-900">UMKM tidak ditemukan</p>
            <p className="mt-1 text-sm text-gray-600">
              Coba gunakan kata kunci atau kategori lain.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}