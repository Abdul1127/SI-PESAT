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
    <div>
      <div className="mb-5 rounded-2xl border bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Cari nama UMKM..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:bg-white"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("semua")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedCategory === "semua"
                ? "bg-blue-600 text-white"
                : "border bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Semua
          </button>

          {categories.map((category: any) => (
            <button
              key={category.slug}
              onClick={() => setSelectedCategory(category.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category.slug
                  ? "bg-blue-600 text-white"
                  : "border bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Menampilkan{" "}
          <span className="font-semibold text-gray-900">
            {filteredUmkm.length}
          </span>{" "}
          dari {umkm.length} UMKM
        </p>
      </div>

      <div className="space-y-3">
        {filteredUmkm.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl border bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                  🏪
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.business_name}
                    </h3>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {item.categories?.name ?? "Tanpa kategori"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-600">
                    {item.description}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    📍 {item.short_address ?? "Alamat belum tersedia"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <Link
                  href={`/umkm/${item.slug}`}
                  className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Detail
                </Link>

                {item.phone && (
                  <a
                    href={`https://wa.me/${item.phone.replace(/^0/, "62")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    WhatsApp
                  </a>
                )}

                {item.gmaps_url && (
                  <a
                    href={item.gmaps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUmkm.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center">
          <p className="font-semibold text-gray-900">UMKM tidak ditemukan</p>
          <p className="mt-1 text-sm text-gray-600">
            Coba gunakan kata kunci atau kategori lain.
          </p>
        </div>
      )}
    </div>
  );
}