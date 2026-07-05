"use client";

import { useRef, useState } from "react";
import {
  ExternalLink,
  Info,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  Store,
  Tags,
  X,
} from "lucide-react";

function normalizeWa(value: string | null | undefined) {
  if (!value) return "";

  const onlyNumber = String(value).replace(/\D/g, "");

  if (onlyNumber === "") return "";

  if (onlyNumber.startsWith("0")) {
    return `62${onlyNumber.slice(1)}`;
  }

  if (onlyNumber.startsWith("8")) {
    return `62${onlyNumber}`;
  }

  return onlyNumber;
}

function buildWhatsappUrl(item: any) {
  const wa = normalizeWa(item.wa);

  if (!wa) return null;

  const message = `Halo, saya mendapatkan informasi usaha ini dari SI PESAT Kelurahan Sukun. Saya ingin bertanya mengenai produk/layanan dari ${item.business_name}.`;

  return `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
}

export default function UmkmList({ umkm }: { umkm: any[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUmkm, setSelectedUmkm] = useState<any | null>(null);

  const listTopRef = useRef<HTMLDivElement | null>(null);
  const itemsPerPage = 10;

  const allSectors = umkm.flatMap((item) => item.sectors ?? []);

  const categories = Array.from(
    new Map(
      allSectors.map((sector: any) => [
        sector.slug,
        {
          name: sector.name,
          slug: sector.slug,
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
      item.rt_rw?.toLowerCase().includes(keyword) ||
      item.wa?.toLowerCase().includes(keyword) ||
      item.sectors?.some((sector: any) =>
        sector.name?.toLowerCase().includes(keyword)
      );

    const matchCategory =
      selectedCategory === "semua" ||
      item.sectors?.some((sector: any) => sector.slug === selectedCategory);

    return matchSearch && matchCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUmkm.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUmkm = filteredUmkm.slice(startIndex, startIndex + itemsPerPage);

  const scrollToListTop = () => {
    listTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setTimeout(scrollToListTop, 50);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const changeCategory = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  const Pagination = () => (
    <div className="my-5 flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => goToPage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
      >
        Sebelumnya
      </button>

      <span className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
      >
        Berikutnya
      </button>
    </div>
  );

  return (
    <>
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
                className="w-full min-w-0 rounded-xl border bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
              />
            </div>

            <p className="mb-3 mt-5 font-semibold text-gray-900">Kategori</p>

            <select
              value={selectedCategory}
              onChange={(e) => changeCategory(e.target.value)}
              className="block w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none lg:hidden"
            >
              <option value="semua">Semua kategori ({umkm.length})</option>
              {categories.map((category: any) => {
                const count = umkm.filter((item) =>
                  item.sectors?.some(
                    (sector: any) => sector.slug === category.slug
                  )
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
                const count = umkm.filter((item) =>
                  item.sectors?.some(
                    (sector: any) => sector.slug === category.slug
                  )
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
                <span className="flex items-center gap-2 text-sm text-gray-800">
                  <Store className="h-4 w-4 text-blue-600" />
                  Total
                </span>
                <span className="font-bold !text-gray-950">{umkm.length}</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-green-50 p-3">
                <span className="flex items-center gap-2 text-sm text-gray-800">
                  <MapPin className="h-4 w-4 text-green-600" />
                  Tampil
                </span>
                <span className="font-bold !text-gray-950">
                  {filteredUmkm.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-indigo-50 p-3">
                <span className="flex items-center gap-2 text-sm text-gray-800">
                  <Tags className="h-4 w-4 text-indigo-600" />
                  Kategori
                </span>
                <span className="font-bold !text-gray-950">
                  {categories.length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div ref={listTopRef} className="scroll-mt-28">
            <h3 className="text-xl font-bold text-gray-900">Daftar UMKM</h3>
            <p className="mt-1 text-sm text-gray-600">
              Menampilkan {filteredUmkm.length === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredUmkm.length)} dari{" "}
              {filteredUmkm.length} UMKM.
            </p>
          </div>

          {filteredUmkm.length > 0 && <Pagination />}

          <div className="space-y-3">
            {currentUmkm.map((item) => {
              const whatsappUrl = buildWhatsappUrl(item);

              return (
                <div
                  key={item.id}
                  className="min-w-0 rounded-3xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:gap-5">
                    <div className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-blue-600 md:h-28 md:w-36">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.business_name ?? "Foto UMKM"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Store className="h-8 w-8" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-lg font-bold text-gray-900 md:text-xl">
                        {item.business_name}
                      </h3>

                      {item.sectors?.length > 1 && (
                        <p className="mt-1 text-xs font-semibold text-green-600">
                          Multi kategori
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.sectors?.map((sector: any) => (
                          <span
                            key={sector.slug}
                            className="inline-block max-w-full truncate rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            {sector.name}
                          </span>
                        ))}

                        {item.is_ekraf ? (
                          <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                            Ekraf
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            Non-Ekraf
                          </span>
                        )}
                      </div>

                      <ul className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                        {item.descriptions?.slice(0, 3).map((desc: string) => (
                          <li key={desc}>• {desc}</li>
                        ))}
                      </ul>

                      <div className="mt-2 space-y-1">
                        <p className="flex items-start gap-1 text-sm text-gray-500">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                          <span className="break-words">
                            {item.short_address ?? "Alamat belum tersedia"}
                          </span>
                        </p>

                        {item.rt_rw && (
                          <p className="text-sm text-gray-500">{item.rt_rw}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid w-full shrink-0 gap-2 md:w-40">
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 text-sm font-semibold !text-white hover:bg-green-700"
                        >
                          <MessageCircle className="h-4 w-4 text-white" />
                          WhatsApp
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedUmkm(item)}
                        className="flex h-11 items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <Info className="h-4 w-4" />
                        Tentang
                      </button>

                      {item.gmaps_url && (
                        <a
                          href={item.gmaps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold !text-white hover:bg-blue-700"
                        >
                          <Navigation className="h-4 w-4 text-white" />
                          Lokasi
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUmkm.length > 0 && <Pagination />}
        </section>
      </div>

      {selectedUmkm && (
        <UmkmDetailModal
          item={selectedUmkm}
          onClose={() => setSelectedUmkm(null)}
        />
      )}
    </>
  );
}

function UmkmDetailModal({
  item,
  onClose,
}: {
  item: any;
  onClose: () => void;
}) {
  const whatsappUrl = buildWhatsappUrl(item);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-xl">
        <div className="relative h-56 overflow-hidden rounded-t-3xl bg-blue-50">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.business_name ?? "Foto UMKM"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-blue-600">
              <Store className="h-14 w-14" />
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-700 shadow-sm hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Tentang UMKM
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-gray-950">
            {item.business_name}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {item.sectors?.map((sector: any) => (
              <span
                key={sector.slug}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {sector.name}
              </span>
            ))}

            {item.is_ekraf ? (
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                Ekraf
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                Non-Ekraf
              </span>
            )}
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Produk / Layanan
              </h3>

              {item.descriptions?.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm leading-6 text-gray-600">
                  {item.descriptions.map((desc: string) => (
                    <li key={desc}>• {desc}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  Deskripsi belum tersedia.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">Alamat</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {item.short_address ?? "Alamat belum tersedia"}
              </p>

              {item.rt_rw && (
                <p className="mt-1 text-sm text-gray-500">{item.rt_rw}</p>
              )}
            </div>

            {item.wa && (
              <div>
                <h3 className="text-sm font-bold text-gray-900">Kontak</h3>
                <p className="mt-2 text-sm text-gray-600">
                  WhatsApp: {normalizeWa(item.wa)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 text-sm font-semibold !text-white hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4 text-white" />
                Tanya via WhatsApp
              </a>
            )}

            {item.gmaps_url && (
              <a
                href={item.gmaps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold !text-white hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 text-white" />
                Buka Lokasi
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex h-12 items-center justify-center rounded-2xl border px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:col-span-2"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}