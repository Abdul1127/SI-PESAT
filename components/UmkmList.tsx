"use client";

import { useState } from "react";
import Link from "next/link";

export default function UmkmList({ umkm }: { umkm: any[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");

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
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      selectedCategory === "semua" ||
      item.categories?.slug === selectedCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="mb-3 font-semibold text-gray-900">Pencarian</p>

          <input
            type="text"
            placeholder="Cari nama UMKM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:bg-white"
          />

          <div className="mt-5">
            <p className="mb-3 font-semibold text-gray-900">Kategori</p>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory("semua")}
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
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium ${
                      selectedCategory === category.slug
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{category.name}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="font-semibold text-gray-900">Informasi</p>

          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total UMKM</span>
              <span className="font-semibold text-gray-900">{umkm.length}</span>
            </div>

            <div className="flex justify-between">
              <span>Ditampilkan</span>
              <span className="font-semibold text-gray-900">
                {filteredUmkm.length}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Kategori</span>
              <span className="font-semibold text-gray-900">
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
              Menampilkan {filteredUmkm.length} dari {umkm.length} UMKM.
            </p>
          </div>

          <select className="rounded-xl border bg-white px-4 py-3 text-sm text-gray-700 outline-none">
            <option>Terbaru</option>
            <option>Nama A-Z</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredUmkm.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  🏪
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

                  <p className="mt-2 text-sm text-gray-500">
                    📍 {item.short_address ?? "Alamat belum tersedia"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/umkm/${item.slug}`}
                    className="group flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border bg-white text-sm font-semibold text-gray-700 transition-all hover:w-24 hover:bg-gray-50"
                  >
                    <span className="group-hover:hidden">i</span>
                    <span className="hidden group-hover:inline">Detail</span>
                  </Link>

                  {item.phone && (
                    <a
                      href={`https://wa.me/${item.phone.replace(/^0/, "62")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-green-600 text-sm font-semibold text-white transition-all hover:w-28 hover:bg-green-700"
                    >
                      <span className="group-hover:hidden">WA</span>
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
                      <span className="group-hover:hidden">M</span>
                      <span className="hidden group-hover:inline">Maps</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

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