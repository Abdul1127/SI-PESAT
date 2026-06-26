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
  const currentUmkm = filteredUmkm.slice(startIndex, startIndex + itemsPerPage);

  const changeSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const changeCategory = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="min-w-0 space-y-4">
        <div className="min-w-0 rounded-3xl border bg-white p-4 shadow-sm md:p-5">
          <p className="mb-3 font-semibold text-gray-900">Pencarian</p>

          <div className="relative min-w-0">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari UMKM..."
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              className="w-full min-w-0 rounded-xl border bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500"
            />
          </div>

          <p className="mb-3 mt-5 font-semibold text-gray-900">Kategori</p>

          <select
            value={selectedCategory}
            onChange={(e) => changeCategory(e.target.value)}
            className="block w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-700 outline-none lg:hidden"
          >
            <option value="semua">Semua kategori ({umkm.length})</option>
            {categories.map((category: any) => {
              const count = umkm.filter(
                (item) => item.categories?.slug === category.slug
              ).length;

              return (
                <option key={category.slug} value={category.slug}>
                  {category.name} ({count})
                </option>
              );
            })}
          </select>

          <div className="hidden space-y-2 lg:block">
            <button
              onClick={() => changeCategory("semua")}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium ${
                selectedCategory === "semua"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>Semua</span>
              <span>{umkm.length}</span>
            </button>

            {categories.map((category: any) => {
              const count = umkm.filter(
                (item) => item.categories?.slug === category.slug
              ).length;

              return (
                <button
                  key={category.slug}
                  onClick={() => changeCategory(category.slug)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium ${
                    selectedCategory === category.slug
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="max-w-[190px] truncate">
                    {category.name}
                  </span>
                  <span>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-3xl border bg-white p-4 shadow-sm md:p-5">
          <p className="font-semibold text-gray-900">Informasi</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-3">
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <Store className="h-4 w-4 text-blue-600" /> Total
              </span>
              <b className="text-gray-900">{umkm.length}</b>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-3">
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-green-600" /> Tampil
              </span>
              <b>{filteredUmkm.length}</b>
              <b>{categories.length}</b>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-indigo-50 p-3">
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <Tags className="h-4 w-4 text-indigo-600" /> Sektor
              </span>
              <b>{categories.length}</b>
            </div>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">Daftar UMKM</h3>
          <p className="mt-1 text-sm text-gray-600">
            Menampilkan {filteredUmkm.length === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredUmkm.length)} dari{" "}
            {filteredUmkm.length} UMKM.
          </p>
        </div>

        <div className="space-y-3">
          {currentUmkm.map((item) => (
            <div
              key={item.id}
              className="min-w-0 rounded-3xl border bg-white p-4 shadow-sm"
            >
              <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:gap-5">
                <div className="flex h-16 w-full items-center justify-center rounded-2xl bg-blue-50 text-blue-600 md:h-24 md:w-32 md:shrink-0">
                  <Store className="h-8 w-8" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-lg font-bold text-gray-900 md:text-xl">
                    {item.business_name}
                  </h3>

                  <div className="mt-2">
                    <span className="inline-block max-w-full truncate rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {item.categories?.name ?? "Tanpa kategori"}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>

                  <p className="mt-2 flex items-start gap-1 text-sm text-gray-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    <span className="break-words">
                      {item.short_address ?? "Alamat belum tersedia"}
                    </span>
                  </p>
                </div>

                {item.gmaps_url && (
                  <a
                    href={item.gmaps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 md:w-12 md:hover:w-32"
                  >
                    <Navigation className="h-5 w-5" />
                    <span className="md:hidden">Lihat Lokasi</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredUmkm.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
            >
              Sebelumnya
            </button>

            <span className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        )}
      </section>
    </div>
  );
} 