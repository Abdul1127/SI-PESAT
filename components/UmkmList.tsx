"use client";

import { useState } from "react";

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
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama UMKM..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("semua")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            selectedCategory === "semua"
              ? "bg-blue-600 text-white"
              : "border bg-white text-gray-700"
          }`}
        >
          Semua
        </button>

        {categories.map((category: any) => (
          <button
            key={category.slug}
            onClick={() => setSelectedCategory(category.slug)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              selectedCategory === category.slug
                ? "bg-blue-600 text-white"
                : "border bg-white text-gray-700"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Menampilkan {filteredUmkm.length} dari {umkm.length} UMKM
      </p>

      <div className="space-y-3">
        {filteredUmkm.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-200 text-xl text-gray-600">
                🏪
              </div>

              <div>
                <p className="text-sm text-blue-600">
                  {item.categories?.name ?? "Tanpa kategori"}
                </p>

                <h3 className="text-lg font-semibold text-gray-900">
                  {item.business_name}
                </h3>

                <p className="max-w-xl text-sm text-gray-600">
                  {item.description}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {item.short_address}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {item.phone && (
                <a
                  href={`https://wa.me/${item.phone.replace(/^0/, "62")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white"
                >
                  WhatsApp
                </a>
              )}

              {item.gmaps_url && (
                <a
                  href={item.gmaps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Maps
                </a>
              )}

              <a
                href={`/umkm/${item.slug}`}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700"
              >
                Detail
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredUmkm.length === 0 && (
        <p className="mt-4 rounded-lg border bg-white p-4 text-gray-600">
          UMKM tidak ditemukan.
        </p>
      )}
    </>
  );
}