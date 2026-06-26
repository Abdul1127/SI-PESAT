"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, Store } from "lucide-react";

const markerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      background: #2563eb;
      border: 3px solid white;
      border-radius: 9999px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 14px;
    ">
      🏪
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

export default function UmkmMapInner({ umkm }: { umkm: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState("semua");

  const validUmkm = umkm.filter(
    (item) => item.latitude !== null && item.longitude !== null
  );

  const categories = Array.from(
    new Map(
      validUmkm
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

  const filteredUmkm = validUmkm.filter((item) => {
    return (
      selectedCategory === "semua" ||
      item.categories?.slug === selectedCategory
    );
  });

  const center: [number, number] =
    filteredUmkm.length > 0
      ? [Number(filteredUmkm[0].latitude), Number(filteredUmkm[0].longitude)]
      : [-7.9666, 112.6326];

  return (
    <section
      id="peta"
      className="relative z-0 mt-10 min-w-0 scroll-mt-28 overflow-hidden rounded-3xl border bg-white p-4 shadow-sm md:p-5"
    >
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Peta Persebaran
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-gray-950 md:text-3xl">
            Lokasi UMKM
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Lihat persebaran UMKM berdasarkan titik koordinat yang tersedia.
          </p>
        </div>

        <div className="w-fit rounded-2xl bg-blue-50 px-5 py-3">
          <p className="text-sm text-blue-700">Titik Ditampilkan</p>
          <p className="text-2xl font-bold text-blue-900">
            {filteredUmkm.length}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-700 outline-none md:hidden"
        >
          <option value="semua">Semua sektor ({validUmkm.length})</option>
          {categories.map((category: any) => {
            const count = validUmkm.filter(
              (item) => item.categories?.slug === category.slug
            ).length;

            return (
              <option key={category.slug} value={category.slug}>
                {category.name} ({count})
              </option>
            );
          })}
        </select>

        <div className="hidden flex-wrap gap-2 md:flex">
          <button
            onClick={() => setSelectedCategory("semua")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
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
              className={`max-w-[260px] truncate rounded-full px-4 py-2 text-sm font-medium ${
                selectedCategory === category.slug
                  ? "bg-blue-600 text-white"
                  : "border bg-white text-gray-700 hover:bg-gray-50"
              }`}
              title={category.name}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-0 overflow-hidden rounded-3xl border bg-slate-100">
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={false}
          className="z-0 h-[360px] w-full md:h-[460px]"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredUmkm.map((item) => (
            <Marker
              key={item.id}
              position={[Number(item.latitude), Number(item.longitude)]}
              icon={markerIcon}
            >
              <Popup>
                <div className="w-60 text-gray-900">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Store className="h-5 w-5" />
                  </div>

                  <p className="font-bold text-gray-900">
                    {item.business_name}
                  </p>

                  <p className="mt-1 text-sm font-medium text-blue-600">
                    {item.categories?.name ?? "Tanpa sektor"}
                  </p>

                  <p className="mt-2 flex gap-1 text-sm text-gray-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    <span>{item.short_address ?? "Alamat belum tersedia"}</span>
                  </p>

                  <div className="mt-3 rounded-xl bg-blue-50 p-3">
                    <p className="text-xs font-semibold text-blue-700">
                      Status lokasi
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      Tersedia tautan Google Maps.
                    </p>
                  </div>

                  {item.gmaps_url && (
                    <a
                      href={item.gmaps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold !text-white hover:bg-blue-700"
                    >
                      <Navigation className="h-4 w-4 text-white" />
                      Buka Google Maps
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}