"use client";

import { useState } from "react";
import { MapPin, Search, Store, Tags, Navigation } from "lucide-react";

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
    const keyword = search.toLowerCase();

    const matchSearch =
      item.business_name?.toLowerCase().includes(keyword) ||
      item.short_address?.toLowerCase().includes(keyword) ||
      item.description?.toLowerCase().includes(keyword) ||
      item.categories?.name?.toLowerCase().includes(keyword);

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
              placeholder="Cari nama, alamat, sektor..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-xl border bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="mt-5">
            <p className="mb-3 font-semibold text-gray-900">Kategori</p>

            <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
              <button
                onClick={() => handleCategoryChange("semua")}
                className={`flex shrink-0 items-center justify-between rounded-full px-4 py-2 text-sm font-medium lg:w-full lg:rounded-xl lg:py-3 ${
                  selectedCategory === "semua"
                    ? "bg-blue-600 text-white lg:bg-blue-50 lg:text-blue-700"
                    : "border bg-white text-gray-700 hover:bg-gray-50 lg:border-0"
                }`}
              >
                <span>Semua</span>
                <span className="ml-2">{umkm.length}</span>
              </button>

              {categories.map((category: any) => {
                const count = umkm.filter(
                  (item) => item.categories?.slug === category.slug
                ).length;

                return (
                  <button
                    key={category.slug}
                    onClick={() => handleCategoryChange(category.slug)}
                    className={`flex shrink-0 items-center justify-between rounded-full px-4 py-2 text-sm font-medium lg:w-full lg:rounded-xl lg:py-3 ${
                      selectedCategory === category.slug
                        ? "bg-blue-600 text-white lg:bg-blue-50 lg:text-blue-700"
                        : "border bg-white text-gray-700 hover:bg-gray-50 lg:border-0"
                    }`}
                  >
                    <span className="max-w-[160px] truncate lg:max-w-[190px]">
                      {category.name}
                    </span>
                    <span className="ml-2">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="font-semibold text-gray-900">Informasi</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-3">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700">Total</span>
              </div>
              <span className="font-bold text-gray-900">{umkm.length}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Tampil</span>
              </div>
              <span className="font-bold text-gray-900">
                {filteredUmkm.length}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-indigo-50 p-3">
              <div className="flex items-center gap-3">
                <Tags className="h-5 w-5 text-indigo-600" />
                <span className="text-sm text-gray-700">Sektor</span>
              </div>
              <span className="font-bold text-gray-900">
                {categories.length}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <section>
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Daftar UMKM</h3>
            <p className="mt-1 text-sm text-gray-600">
              Menampilkan {filteredUmkm.length === 0 ? 0 : startIndex + 1}-
              {Math.min(endIndex, filteredUmkm.length)} dari{" "}
              {filteredUmkm.length} UMKM.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {currentUmkm.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-5">
                <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 md:h-24 md:w-32">
                  <Store className="h-9 w-9" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words text-lg font-bold text-gray-900 md:text-xl">
                      {item.business_name}
                    </h3>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {item.categories?.name ?? "Tanpa kategori"}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>

                  <p className="mt-2 flex items-start gap-1 text-sm text-gray-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    <span>{item.short_address ?? "Alamat belum tersedia"}</span>
                  </p>
                </div>

                <div className="flex w-full shrink-0 items-center gap-3 md:w-auto">
                  {item.gmaps_url && (
                    <a
                      href={item.gmaps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-blue-600 text-sm font-semibold text-white transition-all hover:bg-blue-700 md:w-12 md:hover:w-32"
                    >
                      <Navigation className="h-5 w-5 md:group-hover:hidden" />
                      <span className="inline md:hidden md:group-hover:inline">
                        Lihat Lokasi
                      </span>
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