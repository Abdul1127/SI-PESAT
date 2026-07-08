"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Edit,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Store,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const TABLE_NAME = "data_2025";
const STORAGE_BUCKET = "umkm-images";

const CATEGORY_OPTIONS = [
  "Kuliner",
  "Aktivitas Jasa Lainnya",
  "Perdagangan Umum / Sembako",
  "Penyedia Akomodasi",
  "Perdagangan Eceran",
  "Fashion",
  "Penyedia Jasa",
  "Kerajinan",
  "Seni Rupa",
  "Layanan Komputer dan Piranti Lunak",
  "Penerbitan dan Percetakan",
  "Periklanan",
  "Pasar Barang Seni",
  "Fotografi",
  "Arsitektur",
  "Desain",
  "Film, Animasi, dan Video",
  "Musik",
  "Seni Pertunjukan",
  "Televisi dan Radio",
  "Permainan Interaktif (Game)",
  "Aplikasi dan Pengembangan Teknologi",
  "Transportasi",
];

const RT_OPTIONS = Array.from({ length: 20 }, (_, index) =>
  String(index + 1).padStart(3, "0")
);

const RW_OPTIONS = Array.from({ length: 10 }, (_, index) =>
  String(index + 1).padStart(3, "0")
);

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

function normalizeAddressText(value: string | null | undefined) {
  if (!value) return "";

  return value
    .toLowerCase()
    .replace(/\bjls\b/g, "jl")
    .replace(/\bjln\b/g, "jl")
    .replace(/\bjalan\b/g, "jl")
    .replace(/\bkl\b/g, "jl")
    .replace(/\bkln\b/g, "jl")
    .replace(/\bgg\b/g, "gang")
    .replace(/\bno\b/g, "nomor")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAliasText(value: string | null | undefined) {
  if (!value) return "";

  return normalizeAddressText(value)
    .replace(/^jl\s+/, "")
    .replace(/^gang\s+/, "")
    .trim();
}

function getAddressStart(value: string | null | undefined) {
  const normalized = normalizeAddressText(value);

  if (!normalized) return "";

  return normalized
    .split(
      /\bkel\b|\bkelurahan\b|\bkec\b|\bkecamatan\b|\bkota\b|\bmalang\b|\bjatim\b|,/i
    )[0]
    .trim();
}

function isAddressMatchStreet(address: string | null | undefined, street: any) {
  const addressStart = getAddressStart(address);

  if (!addressStart || !street) return false;

  const candidates = [street.nama_jalan, ...(street.alias ?? [])]
    .map((item) => normalizeAliasText(item))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  return candidates.some((candidate) => {
    const candidateWithJl = `jl ${candidate}`;

    return (
      addressStart === candidate ||
      addressStart === candidateWithJl ||
      addressStart.startsWith(`${candidate} `) ||
      addressStart.startsWith(`${candidateWithJl} `)
    );
  });
}

function detectStreetName(
  address: string | null | undefined,
  streets: any[] = []
) {
  const matchedStreet = streets.find((street) =>
    isAddressMatchStreet(address, street)
  );

  return matchedStreet?.nama_jalan ?? "Belum cocok";
}

function getItemName(item: any) {
  return item.business_name ?? item.nama_usaha ?? "";
}

function getItemAddress(item: any) {
  return item.short_address ?? item.address ?? item.alamat ?? "";
}

function getItemDescription(item: any) {
  if (item.description) return item.description;
  if (item.deskripsi) return item.deskripsi;
  if (Array.isArray(item.descriptions)) return item.descriptions.join(", ");
  return "";
}

function getItemCategory(item: any) {
  if (item.kategori_umkm) return item.kategori_umkm;
  if (item.categories?.name) return item.categories.name;
  if (item.sectors?.[0]?.name) return item.sectors[0].name;
  if (item.sektor) return item.sektor;
  return "";
}

function getItemWa(item: any) {
  return item.wa ?? item.whatsapp ?? "";
}

function getItemImageUrl(item: any) {
  return item.image_url ?? "";
}

function getItemGmapsUrl(item: any) {
  return item.gmaps_url ?? "";
}

function getItemIsEkraf(item: any) {
  return item.is_ekraf === true;
}

function getItemIsActive(item: any) {
  if (typeof item.is_active === "boolean") return item.is_active;
  return true;
}

function getItemRtRw(item: any) {
  return item.rt_rw ?? "";
}

function parseRtRw(value: string | null | undefined) {
  const text = value ?? "";

  const rtMatch = text.match(/RT\s*0?(\d+)/i);
  const rwMatch = text.match(/RW\s*0?(\d+)/i);

  const rt = rtMatch ? String(Number(rtMatch[1])).padStart(3, "0") : "";
  const rw = rwMatch ? String(Number(rwMatch[1])).padStart(3, "0") : "";

  return { rt, rw };
}

function buildRtRw(rt: string, rw: string) {
  if (!rt && !rw) return null;
  if (rt && rw) return `RT ${rt} RW ${rw}`;
  if (rt) return `RT ${rt}`;
  return `RW ${rw}`;
}

function emptyForm() {
  return {
    id: null as number | null,
    nama_usaha: "",
    alamat: "",
    deskripsi: "",
    kategori_umkm: "",
    is_ekraf: false,
    rt: "",
    rw: "",
    latitude: "",
    longitude: "",
    gmaps_url: "",
    whatsapp: "",
    image_url: "",
    is_active: true,
  };
}

export default function AdminUmkmTable({
  data,
  streets = [],
  onRefresh,
}: {
  data: any[];
  streets?: any[];
  onRefresh?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("semua");
  const [streetFilter, setStreetFilter] = useState("semua");
  const [rtFilter, setRtFilter] = useState("semua");
  const [rwFilter, setRwFilter] = useState("semua");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState(emptyForm());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const tableTopRef = useRef<HTMLDivElement | null>(null);
  const modalHistoryPushedRef = useRef(false);
  const ignoreNextPopStateRef = useRef(false);

  const itemsPerPage = 10;

  const adminStreets = useMemo(() => {
    return [...streets].sort((a, b) =>
      String(a.nama_jalan).localeCompare(String(b.nama_jalan))
    );
  }, [streets]);

  const normalizedData = useMemo(() => {
    return data.map((item) => {
      const nama_usaha = getItemName(item);
      const alamat = getItemAddress(item);
      const deskripsi = getItemDescription(item);
      const kategori_umkm = getItemCategory(item);
      const whatsapp = getItemWa(item);
      const image_url = getItemImageUrl(item);
      const gmaps_url = getItemGmapsUrl(item);
      const rt_rw = getItemRtRw(item);
      const parsedRtRw = parseRtRw(rt_rw);

      return {
        ...item,
        id: item.id,
        rowIds: item.rowIds ?? [item.id],
        nama_usaha,
        alamat,
        deskripsi,
        kategori_umkm,
        is_ekraf: getItemIsEkraf(item),
        rt_rw,
        rt: parsedRtRw.rt,
        rw: parsedRtRw.rw,
        latitude: item.latitude ?? "",
        longitude: item.longitude ?? "",
        gmaps_url,
        whatsapp,
        image_url,
        is_active: getItemIsActive(item),
      };
    });
  }, [data]);

  const categories = useMemo(() => {
    const merged = new Set<string>();

    for (const option of CATEGORY_OPTIONS) {
      merged.add(option);
    }

    for (const item of normalizedData) {
      if (item.kategori_umkm) {
        merged.add(item.kategori_umkm);
      }
    }

    return Array.from(merged);
  }, [normalizedData]);

  const unmatchedStreetCount = useMemo(() => {
    return normalizedData.filter(
      (item) => detectStreetName(item.alamat, adminStreets) === "Belum cocok"
    ).length;
  }, [normalizedData, adminStreets]);

  const missingRtRwCount = useMemo(() => {
    return normalizedData.filter((item) => !item.rt && !item.rw).length;
  }, [normalizedData]);

  const filteredData = normalizedData.filter((item) => {
    const keyword = search.toLowerCase();
    const detectedStreet = detectStreetName(item.alamat, adminStreets);

    const matchSearch =
      item.nama_usaha?.toLowerCase().includes(keyword) ||
      item.alamat?.toLowerCase().includes(keyword) ||
      item.deskripsi?.toLowerCase().includes(keyword) ||
      item.kategori_umkm?.toLowerCase().includes(keyword) ||
      item.rt_rw?.toLowerCase().includes(keyword) ||
      item.rt?.toLowerCase().includes(keyword) ||
      item.rw?.toLowerCase().includes(keyword) ||
      item.whatsapp?.toLowerCase().includes(keyword) ||
      detectedStreet.toLowerCase().includes(keyword);

    const matchCategory =
      categoryFilter === "semua" || item.kategori_umkm === categoryFilter;

    const selectedStreet = adminStreets.find(
      (street) => String(street.id) === streetFilter
    );

    const matchStreet =
      streetFilter === "semua" ||
      (streetFilter === "belum-cocok" && detectedStreet === "Belum cocok") ||
      (streetFilter !== "belum-cocok" &&
        isAddressMatchStreet(item.alamat, selectedStreet));

    const matchRt =
      rtFilter === "semua" ||
      (rtFilter === "tanpa-rt" && !item.rt) ||
      item.rt === rtFilter;

    const matchRw =
      rwFilter === "semua" ||
      (rwFilter === "tanpa-rw" && !item.rw) ||
      item.rw === rwFilter;

    const hasWa = item.whatsapp && String(item.whatsapp).trim() !== "";
    const hasImage = item.image_url && String(item.image_url).trim() !== "";
    const hasGmaps = item.gmaps_url && String(item.gmaps_url).trim() !== "";
    const hasRtRw = item.rt || item.rw;

    const matchStatus =
      statusFilter === "semua" ||
      (statusFilter === "aktif" && item.is_active === true) ||
      (statusFilter === "nonaktif" && item.is_active === false) ||
      (statusFilter === "tanpa-wa" && !hasWa) ||
      (statusFilter === "tanpa-foto" && !hasImage) ||
      (statusFilter === "tanpa-gmaps" && !hasGmaps) ||
      (statusFilter === "tanpa-rt-rw" && !hasRtRw) ||
      (statusFilter === "belum-lengkap" &&
        (!hasWa || !hasImage || !hasGmaps || !hasRtRw));

    return (
      matchSearch &&
      matchCategory &&
      matchStreet &&
      matchRt &&
      matchRw &&
      matchStatus
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const forceCloseModal = () => {
    setIsModalOpen(false);
    setForm(emptyForm());
    setSelectedFile(null);
    setMessage("");
  };

  const pushModalHistory = () => {
    if (typeof window === "undefined") return;
    if (modalHistoryPushedRef.current) return;

    window.history.pushState(
      { siPesatAdminModal: true },
      "",
      window.location.href
    );

    modalHistoryPushedRef.current = true;
  };

  const closeModal = () => {
    if (isSaving) return;

    if (typeof window !== "undefined" && modalHistoryPushedRef.current) {
      ignoreNextPopStateRef.current = true;
      modalHistoryPushedRef.current = false;
      window.history.back();
    }

    forceCloseModal();
  };

  useEffect(() => {
    const handlePopState = () => {
      if (ignoreNextPopStateRef.current) {
        ignoreNextPopStateRef.current = false;
        return;
      }

      if (modalHistoryPushedRef.current) {
        modalHistoryPushedRef.current = false;
        forceCloseModal();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, isSaving]);

  const scrollToTableTop = () => {
    tableTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const goToPage = (page: number) => {
    const targetPage = Math.min(Math.max(page, 1), totalPages);

    setCurrentPage(targetPage);
    setPageInput("");

    setTimeout(() => {
      scrollToTableTop();
    }, 50);
  };

  const jumpToPage = () => {
    const targetPage = Number(pageInput);

    if (!targetPage || Number.isNaN(targetPage)) {
      return;
    }

    goToPage(targetPage);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const changeCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const changeStreetFilter = (value: string) => {
    setStreetFilter(value);
    setCurrentPage(1);
  };

  const changeRtFilter = (value: string) => {
    setRtFilter(value);
    setCurrentPage(1);
  };

  const changeRwFilter = (value: string) => {
    setRwFilter(value);
    setCurrentPage(1);
  };

  const changeStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("semua");
    setStreetFilter("semua");
    setRtFilter("semua");
    setRwFilter("semua");
    setStatusFilter("semua");
    setCurrentPage(1);
    setPageInput("");
  };

  const openAddModal = () => {
    setModalMode("add");
    setForm(emptyForm());
    setSelectedFile(null);
    setMessage("");
    pushModalHistory();
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setModalMode("edit");
    setForm({
      id: item.id,
      nama_usaha: item.nama_usaha ?? "",
      alamat: item.alamat ?? "",
      deskripsi: item.deskripsi ?? "",
      kategori_umkm: item.kategori_umkm ?? "",
      is_ekraf: item.is_ekraf === true,
      rt: item.rt ?? "",
      rw: item.rw ?? "",
      latitude: item.latitude ? String(item.latitude) : "",
      longitude: item.longitude ? String(item.longitude) : "",
      gmaps_url: item.gmaps_url ?? "",
      whatsapp: item.whatsapp ?? "",
      image_url: item.image_url ?? "",
      is_active: item.is_active === true,
    });
    setSelectedFile(null);
    setMessage("");
    pushModalHistory();
    setIsModalOpen(true);
  };

  const uploadImageIfNeeded = async () => {
    if (!selectedFile) {
      return form.image_url || null;
    }

    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;
    const filePath = `umkm/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Gagal upload foto: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const saveData = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      if (!form.nama_usaha.trim()) {
        throw new Error("Nama usaha wajib diisi.");
      }

      if (!form.alamat.trim()) {
        throw new Error("Alamat wajib diisi.");
      }

      const imageUrl = await uploadImageIfNeeded();
      const normalizedWa = normalizeWa(form.whatsapp);

      const payload = {
        nama_usaha: form.nama_usaha.trim(),
        alamat: form.alamat.trim(),
        deskripsi: form.deskripsi.trim() || null,
        kategori_umkm: form.kategori_umkm || null,
        is_ekraf: form.is_ekraf,
        rt_rw: buildRtRw(form.rt, form.rw),
        latitude:
          form.latitude.trim() === "" ? null : Number(form.latitude.trim()),
        longitude:
          form.longitude.trim() === "" ? null : Number(form.longitude.trim()),
        gmaps_url: form.gmaps_url.trim() || null,
        whatsapp: normalizedWa || null,
        image_url: imageUrl,
        is_active: form.is_active,
      };

      if (modalMode === "edit") {
        if (!form.id) {
          throw new Error("ID data tidak ditemukan.");
        }

        const { error } = await supabase
          .from(TABLE_NAME)
          .update(payload)
          .eq("id", form.id);

        if (error) {
          throw new Error(error.message);
        }

        setMessage("Data berhasil diperbarui.");
      } else {
        const { error } = await supabase.from(TABLE_NAME).insert(payload);

        if (error) {
          throw new Error(error.message);
        }

        setMessage("Data baru berhasil ditambahkan.");
      }

      await onRefresh?.();

      setTimeout(() => {
        closeModal();
      }, 500);
    } catch (error: any) {
      setMessage(error.message ?? "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  const exportCsv = () => {
    const rows = filteredData.map((item) => ({
      ID: item.id,
      "Nama Usaha": item.nama_usaha ?? "",
      "Kategori UMKM": item.kategori_umkm ?? "",
      "Status Ekraf": item.is_ekraf ? "Ekraf" : "Non-Ekraf",
      "Jalan Terdeteksi": detectStreetName(item.alamat, adminStreets),
      RT: item.rt ? `RT ${item.rt}` : "",
      RW: item.rw ? `RW ${item.rw}` : "",
      "RT/RW": item.rt_rw ?? "",
      Alamat: item.alamat ?? "",
      Deskripsi: item.deskripsi ?? "",
      WhatsApp: item.whatsapp ?? "",
      Foto: item.image_url ?? "",
      "Google Maps": item.gmaps_url ?? "",
      Latitude: item.latitude ?? "",
      Longitude: item.longitude ?? "",
      "Status Data": item.is_active ? "Aktif" : "Nonaktif",
    }));

    const headers = Object.keys(
      rows[0] ?? {
        ID: "",
        "Nama Usaha": "",
        "Kategori UMKM": "",
        "Status Ekraf": "",
        "Jalan Terdeteksi": "",
        RT: "",
        RW: "",
        "RT/RW": "",
        Alamat: "",
        Deskripsi: "",
        WhatsApp: "",
        Foto: "",
        "Google Maps": "",
        Latitude: "",
        Longitude: "",
        "Status Data": "",
      }
    );

    const csv = [
      headers.join(","),
      ...rows.map((row: any) =>
        headers
          .map((header) => {
            const value = String(row[header] ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `export-umkm-${Date.now()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="space-y-5">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                Manajemen Data
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-gray-950">
                Data UMKM
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Kelola data UMKM, filter jalan, RT/RW, foto, WhatsApp, dan
                Google Maps.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Export CSV
              </button>

              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold !text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 text-white" />
                Tambah Data
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative md:col-span-2 xl:col-span-2">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => changeSearch(e.target.value)}
                placeholder="Cari nama, alamat, RT/RW, kategori..."
                className="w-full rounded-2xl border bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => changeCategoryFilter(e.target.value)}
              className="rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="semua">Semua kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={streetFilter}
              onChange={(e) => changeStreetFilter(e.target.value)}
              className="rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="semua">Semua jalan</option>
              <option value="belum-cocok">
                Belum cocok jalan ({unmatchedStreetCount})
              </option>
              {adminStreets.map((street) => (
                <option key={street.id} value={String(street.id)}>
                  {street.nama_jalan}
                </option>
              ))}
            </select>

            <select
              value={rtFilter}
              onChange={(e) => changeRtFilter(e.target.value)}
              className="rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="semua">Semua RT</option>
              <option value="tanpa-rt">Tanpa RT</option>
              {RT_OPTIONS.map((rt) => (
                <option key={rt} value={rt}>
                  RT {rt}
                </option>
              ))}
            </select>

            <select
              value={rwFilter}
              onChange={(e) => changeRwFilter(e.target.value)}
              className="rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="semua">Semua RW</option>
              <option value="tanpa-rw">Tanpa RW</option>
              {RW_OPTIONS.map((rw) => (
                <option key={rw} value={rw}>
                  RW {rw}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => changeStatusFilter(e.target.value)}
              className="rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 md:col-span-2 xl:col-span-2"
            >
              <option value="semua">Semua status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="tanpa-wa">Belum punya WhatsApp</option>
              <option value="tanpa-foto">Belum punya foto</option>
              <option value="tanpa-gmaps">Belum punya Google Maps</option>
              <option value="tanpa-rt-rw">Belum punya RT/RW</option>
              <option value="belum-lengkap">Belum lengkap salah satu</option>
            </select>
          </div>

          {(search ||
            categoryFilter !== "semua" ||
            streetFilter !== "semua" ||
            rtFilter !== "semua" ||
            rwFilter !== "semua" ||
            statusFilter !== "semua") && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-slate-200"
            >
              Reset filter
            </button>
          )}

          <div className="mt-5 grid gap-3 md:grid-cols-5">
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">Total Data</p>
              <p className="mt-1 text-2xl font-bold text-gray-950">
                {normalizedData.length}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-sm text-green-700">Data Tampil</p>
              <p className="mt-1 text-2xl font-bold text-gray-950">
                {filteredData.length}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Belum Cocok Jalan</p>
              <p className="mt-1 text-2xl font-bold text-gray-950">
                {unmatchedStreetCount}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-sm text-red-700">Tanpa RT/RW</p>
              <p className="mt-1 text-2xl font-bold text-gray-950">
                {missingRtRwCount}
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-50 p-4">
              <p className="text-sm text-indigo-700">Kamus Jalan</p>
              <p className="mt-1 text-2xl font-bold text-gray-950">
                {adminStreets.length}
              </p>
            </div>
          </div>
        </div>

        <div
          ref={tableTopRef}
          className="scroll-mt-28 rounded-3xl border bg-white shadow-sm"
        >
          <div className="border-b p-5">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-950">
                  Tabel Data UMKM
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Menampilkan {filteredData.length === 0 ? 0 : startIndex + 1}-
                  {Math.min(startIndex + itemsPerPage, filteredData.length)}{" "}
                  dari {filteredData.length} data.
                </p>
              </div>

              <div className="text-sm text-gray-500">
                Halaman {safeCurrentPage} dari {totalPages}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4">UMKM</th>
                  <th className="px-5 py-4">Kategori</th>
                  <th className="px-5 py-4">Jalan</th>
                  <th className="px-5 py-4">RT/RW</th>
                  <th className="px-5 py-4">Alamat</th>
                  <th className="px-5 py-4">Kelengkapan</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {currentData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      Tidak ada data yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  currentData.map((item) => {
                    const detectedStreet = detectStreetName(
                      item.alamat,
                      adminStreets
                    );

                    const hasWa =
                      item.whatsapp && String(item.whatsapp).trim() !== "";
                    const hasImage =
                      item.image_url && String(item.image_url).trim() !== "";
                    const hasGmaps =
                      item.gmaps_url && String(item.gmaps_url).trim() !== "";
                    const hasRtRw = item.rt || item.rw;

                    return (
                      <tr
                        key={item.id}
                        className="align-top hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-blue-600">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.nama_usaha}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Store className="h-5 w-5" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold text-gray-950">
                                {item.nama_usaha || "-"}
                              </p>

                              <p className="mt-1 line-clamp-2 max-w-[220px] text-xs leading-5 text-gray-500">
                                {item.deskripsi || "Deskripsi belum tersedia"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {item.kategori_umkm || "Belum ada"}
                          </span>

                          <div className="mt-2">
                            {item.is_ekraf ? (
                              <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                Ekraf
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                Non-Ekraf
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {detectedStreet === "Belum cocok" ? (
                            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                              Belum cocok
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {detectedStreet}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {hasRtRw ? (
                            <div className="flex flex-wrap gap-2">
                              {item.rt && (
                                <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                                  RT {item.rt}
                                </span>
                              )}

                              {item.rw && (
                                <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                  RW {item.rw}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                              Belum ada
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-[260px] leading-5 text-gray-700">
                            {item.alamat || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                hasWa
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              WA
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                hasImage
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              Foto
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                hasGmaps
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              GMaps
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                hasRtRw
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              RT/RW
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {item.is_active ? (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              Aktif
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                              Nonaktif
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {item.gmaps_url && (
                              <a
                                href={item.gmaps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border text-gray-700 hover:bg-gray-50"
                                title="Buka Google Maps"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                              title="Edit data"
                            >
                              <Edit className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t p-5 lg:flex-row">
            <p className="text-sm text-gray-500">
              Halaman {safeCurrentPage} dari {totalPages}
            </p>

            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => goToPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
              >
                Sebelumnya
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Ke halaman</span>

                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      jumpToPage();
                    }
                  }}
                  placeholder={String(safeCurrentPage)}
                  className="w-20 rounded-xl border bg-white px-3 py-2 text-center text-sm text-gray-900 outline-none focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={jumpToPage}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold !text-white hover:bg-blue-700"
                >
                  Lompat
                </button>
              </div>

              <button
                type="button"
                onClick={() => goToPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                  {modalMode === "edit" ? "Edit Data" : "Tambah Data"}
                </p>

                <h3 className="text-xl font-extrabold text-gray-950">
                  {modalMode === "edit" ? "Perbarui UMKM" : "Tambah UMKM Baru"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {message && (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                    message.toLowerCase().includes("berhasil")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Nama Usaha
                  </label>

                  <input
                    type="text"
                    value={form.nama_usaha}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        nama_usaha: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    placeholder="Contoh: Warung Makan Bu Ani"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Kategori
                  </label>

                  <select
                    value={form.kategori_umkm}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        kategori_umkm: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                  >
                    <option value="">Pilih kategori</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Status Ekraf
                  </label>

                  <select
                    value={form.is_ekraf ? "true" : "false"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        is_ekraf: e.target.value === "true",
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                  >
                    <option value="false">Non-Ekraf</option>
                    <option value="true">Ekraf</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Deskripsi / Produk
                  </label>

                  <textarea
                    value={form.deskripsi}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        deskripsi: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    placeholder="Contoh: Nasi campur, ayam geprek, minuman dingin"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Alamat
                  </label>

                  <textarea
                    value={form.alamat}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        alamat: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    placeholder="Contoh: Jl. Meliwis Barat No. 10, Sukun"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Jalan terdeteksi:{" "}
                    <span
                      className={
                        detectStreetName(form.alamat, adminStreets) ===
                        "Belum cocok"
                          ? "font-semibold text-red-600"
                          : "font-semibold text-green-700"
                      }
                    >
                      {detectStreetName(form.alamat, adminStreets)}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    RT
                  </label>

                  <select
                    value={form.rt}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        rt: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                  >
                    <option value="">Tidak ada</option>
                    {RT_OPTIONS.map((rt) => (
                      <option key={rt} value={rt}>
                        RT {rt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    RW
                  </label>

                  <select
                    value={form.rw}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        rw: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                  >
                    <option value="">Tidak ada</option>
                    {RW_OPTIONS.map((rw) => (
                      <option key={rw} value={rw}>
                        RW {rw}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Latitude
                  </label>

                  <input
                    type="number"
                    value={form.latitude}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        latitude: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    placeholder="-7.982..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Longitude
                  </label>

                  <input
                    type="number"
                    value={form.longitude}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        longitude: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    placeholder="112.621..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Google Maps URL
                  </label>

                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={form.gmaps_url}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          gmaps_url: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500"
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    WhatsApp
                  </label>

                  <input
                    type="text"
                    value={form.whatsapp}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        whatsapp: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    placeholder="08xxxxxxxxxx"
                  />

                  {form.whatsapp && (
                    <p className="mt-1 text-xs text-gray-500">
                      Disimpan sebagai: {normalizeWa(form.whatsapp)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Status Data
                  </label>

                  <select
                    value={form.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        is_active: e.target.value === "true",
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Foto UMKM
                  </label>

                  <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                    <div className="flex h-36 items-center justify-center overflow-hidden rounded-2xl border bg-blue-50 text-blue-600">
                      {selectedFile ? (
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview foto"
                          className="h-full w-full object-cover"
                        />
                      ) : form.image_url ? (
                        <img
                          src={form.image_url}
                          alt="Foto UMKM"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-10 w-10" />
                      )}
                    </div>

                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setSelectedFile(e.target.files?.[0] ?? null)
                        }
                        className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                      />

                      <p className="mt-2 text-xs leading-5 text-gray-500">
                        Pilih gambar dari perangkat. Setelah klik Simpan, foto
                        akan diupload ke Supabase Storage dan URL-nya disimpan
                        ke kolom image_url.
                      </p>

                      {form.image_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              image_url: "",
                            }))
                          }
                          className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Hapus URL foto dari data
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t bg-white px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="rounded-2xl border px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={saveData}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold !text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 text-white" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}