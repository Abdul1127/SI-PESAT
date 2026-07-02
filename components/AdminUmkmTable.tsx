"use client";

import type { FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const TABLE_NAME = "data_2025";

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

export default function AdminUmkmTable({
  data,
  onRefresh,
}: {
  data: any[];
  onRefresh?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [ekrafFilter, setEkrafFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);
  const [message, setMessage] = useState("");

  const tableTopRef = useRef<HTMLDivElement | null>(null);

  const [editItem, setEditItem] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const emptyForm = {
    nama_usaha: "",
    alamat: "",
    deskripsi: "",
    kategori_umkm: "",
    kategori_umkm_2: "",
    is_ekraf: false,
    rt: "",
    rw: "",
    latitude: "",
    longitude: "",
    gmaps_url: "",
  };

  const [addForm, setAddForm] = useState(emptyForm);

  const [editForm, setEditForm] = useState({
    nama_usaha: "",
    alamat: "",
    kategori_umkm: "",
    kategori_umkm_2: "",
    is_ekraf: false,
    rt: "",
    rw: "",
    latitude: "",
    longitude: "",
    gmaps_url: "",
  });

  const itemsPerPage = 15;

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase();

    return data.filter((item) => {
      const matchSearch =
        item.nama_usaha?.toLowerCase().includes(keyword) ||
        item.alamat?.toLowerCase().includes(keyword) ||
        item.kategori_umkm?.toLowerCase().includes(keyword) ||
        item.old_sector?.toLowerCase().includes(keyword) ||
        item.descriptions?.some((desc: string) =>
          desc.toLowerCase().includes(keyword)
        ) ||
        item.sectors?.some((sector: any) =>
          sector.name?.toLowerCase().includes(keyword)
        );

      const matchStatus =
        statusFilter === "semua" ||
        (statusFilter === "aktif" && item.is_active === true) ||
        (statusFilter === "nonaktif" && item.is_active === false);

      const matchEkraf =
        ekrafFilter === "semua" ||
        (ekrafFilter === "ekraf" && item.is_ekraf === true) ||
        (ekrafFilter === "nonekraf" && item.is_ekraf !== true);

      return matchSearch && matchStatus && matchEkraf;
    });
  }, [data, search, statusFilter, ekrafFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const scrollToTableTop = () => {
    tableTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const changeStatus = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const changeEkrafFilter = (value: string) => {
    setEkrafFilter(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));

    setTimeout(() => {
      scrollToTableTop();
    }, 50);
  };

  const getTargetIds = (item: any) => {
    return Array.isArray(item.rowIds) && item.rowIds.length > 0
      ? item.rowIds
      : [item.id];
  };

  const parseCoordinate = (value: string) => {
    if (value.trim() === "") return null;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? "invalid" : parsed;
  };

  const parseRtRw = (value: string | null | undefined) => {
    if (!value) {
      return {
        rt: "",
        rw: "",
      };
    }

    const rtMatch = value.match(/RT\s*0?(\d+)/i);
    const rwMatch = value.match(/RW\s*0?(\d+)/i);

    return {
      rt: rtMatch ? rtMatch[1].padStart(3, "0") : "",
      rw: rwMatch ? rwMatch[1].padStart(3, "0") : "",
    };
  };

  const buildRtRw = (rt: string, rw: string) => {
    if (!rt && !rw) return null;
    if (rt && rw) return `RT ${rt} RW ${rw}`;
    if (rt) return `RT ${rt}`;
    return `RW ${rw}`;
  };

  const buildSearchText = (payload: {
    nama_usaha: string;
    alamat: string;
    deskripsi: string;
    kategori_umkm: string;
  }) => {
    return [
      payload.nama_usaha,
      payload.alamat,
      payload.deskripsi,
      payload.kategori_umkm,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  const toggleStatus = async (item: any) => {
    const nextStatus = !item.is_active;
    const actionText = nextStatus ? "mengaktifkan" : "menonaktifkan";

    const confirmAction = window.confirm(
      `Yakin ingin ${actionText} "${item.nama_usaha}"?`
    );

    if (!confirmAction) return;

    setLoadingId(item.id);
    setMessage("");

    const { error } = await supabase
      .from(TABLE_NAME)
      .update({
        is_active: nextStatus,
      })
      .in("id", getTargetIds(item));

    if (error) {
      setMessage(`Gagal update status: ${error.message}`);
      setLoadingId(null);
      return;
    }

    setMessage(
      nextStatus
        ? `"${item.nama_usaha}" berhasil diaktifkan.`
        : `"${item.nama_usaha}" berhasil dinonaktifkan.`
    );

    setLoadingId(null);
    onRefresh?.();
  };

  const openAddModal = () => {
    setAddForm(emptyForm);
    setMessage("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setSavingAdd(false);
  };

  const openEditModal = (item: any) => {
    setEditItem(item);
    setMessage("");

    const parsedRtRw = parseRtRw(item.rt_rw);

    setEditForm({
      nama_usaha: item.nama_usaha ?? "",
      alamat: item.alamat ?? "",
      kategori_umkm: item.sectors?.[0]?.name ?? item.kategori_umkm ?? "",
      kategori_umkm_2: item.sectors?.[1]?.name ?? "",
      is_ekraf: item.is_ekraf === true,
      rt: parsedRtRw.rt,
      rw: parsedRtRw.rw,
      latitude:
        item.latitude !== null && item.latitude !== undefined
          ? String(item.latitude)
          : "",
      longitude:
        item.longitude !== null && item.longitude !== undefined
          ? String(item.longitude)
          : "",
      gmaps_url: item.gmaps_url ?? "",
    });
  };

  const closeEditModal = () => {
    setEditItem(null);
    setSavingEdit(false);
  };

  const saveAdd = async (e: FormEvent) => {
    e.preventDefault();

    const namaUsaha = addForm.nama_usaha.trim();
    const alamat = addForm.alamat.trim();
    const deskripsi = addForm.deskripsi.trim();

    const kategoriUmkm1 =
      addForm.kategori_umkm.trim() === ""
        ? "Lainnya / Perlu Review"
        : addForm.kategori_umkm.trim();

    const kategoriUmkm2 = addForm.kategori_umkm_2.trim();

    const selectedCategories = [kategoriUmkm1, kategoriUmkm2]
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);

    const rtRw = buildRtRw(addForm.rt, addForm.rw);
    const gmapsUrl = addForm.gmaps_url.trim();

    if (!namaUsaha) {
      setMessage("Gagal menambah data: nama usaha wajib diisi.");
      return;
    }

    const latitudeValue = parseCoordinate(addForm.latitude);
    const longitudeValue = parseCoordinate(addForm.longitude);

    if (latitudeValue === "invalid") {
      setMessage("Gagal menambah data: latitude harus berupa angka.");
      return;
    }

    if (longitudeValue === "invalid") {
      setMessage("Gagal menambah data: longitude harus berupa angka.");
      return;
    }

    setSavingAdd(true);
    setMessage("");

    const insertPayloads = selectedCategories.map((category) => ({
      nama_usaha: namaUsaha,
      alamat: alamat === "" ? null : alamat,
      deskripsi: deskripsi === "" ? null : deskripsi,
      sektor: null,
      kategori_umkm: category,
      is_ekraf: addForm.is_ekraf,
      rt_rw: rtRw,
      latitude: latitudeValue,
      longitude: longitudeValue,
      gmaps_url: gmapsUrl === "" ? null : gmapsUrl,
      search_text: buildSearchText({
        nama_usaha: namaUsaha,
        alamat,
        deskripsi,
        kategori_umkm: category,
      }),
      is_active: true,
    }));

    const { error } = await supabase.from(TABLE_NAME).insert(insertPayloads);

    if (error) {
      setMessage(`Gagal menambah data: ${error.message}`);
      setSavingAdd(false);
      return;
    }

    setMessage(
      selectedCategories.length > 1
        ? `"${namaUsaha}" berhasil ditambahkan dengan ${selectedCategories.length} kategori.`
        : `"${namaUsaha}" berhasil ditambahkan.`
    );

    setSavingAdd(false);
    setShowAddModal(false);
    setAddForm(emptyForm);
    onRefresh?.();
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();

    if (!editItem) return;

    const confirmAction = window.confirm(
      `Simpan perubahan untuk "${editItem.nama_usaha}"?`
    );

    if (!confirmAction) return;

    setSavingEdit(true);
    setMessage("");

    const latitudeValue = parseCoordinate(editForm.latitude);
    const longitudeValue = parseCoordinate(editForm.longitude);

    if (latitudeValue === "invalid") {
      setMessage("Gagal menyimpan: latitude harus berupa angka.");
      setSavingEdit(false);
      return;
    }

    if (longitudeValue === "invalid") {
      setMessage("Gagal menyimpan: longitude harus berupa angka.");
      setSavingEdit(false);
      return;
    }

    const kategoriUmkm1 =
      editForm.kategori_umkm.trim() === ""
        ? "Lainnya / Perlu Review"
        : editForm.kategori_umkm.trim();

    const kategoriUmkm2 = editForm.kategori_umkm_2.trim();

    const selectedCategories = [kategoriUmkm1, kategoriUmkm2]
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);

    const rtRw = buildRtRw(editForm.rt, editForm.rw);

    const targetIds = getTargetIds(editItem);

    const commonPayload = {
      nama_usaha: editForm.nama_usaha.trim(),
      alamat: editForm.alamat.trim() === "" ? null : editForm.alamat.trim(),
      is_ekraf: editForm.is_ekraf,
      rt_rw: rtRw,
      latitude: latitudeValue,
      longitude: longitudeValue,
      gmaps_url:
        editForm.gmaps_url.trim() === "" ? null : editForm.gmaps_url.trim(),
    };

    const { error: commonError } = await supabase
      .from(TABLE_NAME)
      .update(commonPayload)
      .in("id", targetIds);

    if (commonError) {
      setMessage(`Gagal menyimpan perubahan: ${commonError.message}`);
      setSavingEdit(false);
      return;
    }

    const firstId = targetIds[0];

    const { error: firstCategoryError } = await supabase
      .from(TABLE_NAME)
      .update({
        kategori_umkm: selectedCategories[0],
        search_text: buildSearchText({
          nama_usaha: editForm.nama_usaha.trim(),
          alamat: editForm.alamat.trim(),
          deskripsi:
            editItem.descriptions?.join(" ") ?? editItem.deskripsi ?? "",
          kategori_umkm: selectedCategories[0],
        }),
      })
      .eq("id", firstId);

    if (firstCategoryError) {
      setMessage(`Gagal menyimpan kategori utama: ${firstCategoryError.message}`);
      setSavingEdit(false);
      return;
    }

    if (selectedCategories[1]) {
      const secondId = targetIds[1];

      if (secondId) {
        const { error: secondCategoryError } = await supabase
          .from(TABLE_NAME)
          .update({
            kategori_umkm: selectedCategories[1],
            search_text: buildSearchText({
              nama_usaha: editForm.nama_usaha.trim(),
              alamat: editForm.alamat.trim(),
              deskripsi:
                editItem.descriptions?.join(" ") ?? editItem.deskripsi ?? "",
              kategori_umkm: selectedCategories[1],
            }),
          })
          .eq("id", secondId);

        if (secondCategoryError) {
          setMessage(
            `Gagal menyimpan kategori kedua: ${secondCategoryError.message}`
          );
          setSavingEdit(false);
          return;
        }
      } else {
        const { error: insertSecondCategoryError } = await supabase
          .from(TABLE_NAME)
          .insert({
            nama_usaha: editForm.nama_usaha.trim(),
            alamat:
              editForm.alamat.trim() === "" ? null : editForm.alamat.trim(),
            deskripsi:
              editItem.descriptions?.[0] ?? editItem.deskripsi ?? null,
            sektor: null,
            kategori_umkm: selectedCategories[1],
            is_ekraf: editForm.is_ekraf,
            rt_rw: rtRw,
            latitude: latitudeValue,
            longitude: longitudeValue,
            gmaps_url:
              editForm.gmaps_url.trim() === ""
                ? null
                : editForm.gmaps_url.trim(),
            search_text: buildSearchText({
              nama_usaha: editForm.nama_usaha.trim(),
              alamat: editForm.alamat.trim(),
              deskripsi:
                editItem.descriptions?.join(" ") ?? editItem.deskripsi ?? "",
              kategori_umkm: selectedCategories[1],
            }),
            is_active: editItem.is_active,
          });

        if (insertSecondCategoryError) {
          setMessage(
            `Gagal menambah kategori kedua: ${insertSecondCategoryError.message}`
          );
          setSavingEdit(false);
          return;
        }
      }
    }

    setMessage(`"${editForm.nama_usaha}" berhasil diperbarui.`);
    setSavingEdit(false);
    setEditItem(null);
    onRefresh?.();
  };

  return (
    <>
      <div
        ref={tableTopRef}
        className="scroll-mt-28 rounded-3xl border bg-white shadow-sm"
      >
        <div className="border-b p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-lg font-bold text-gray-950">Data UMKM</p>
              <p className="mt-1 text-sm text-gray-600">
                Cari, tambah data baru, atur kategori UMKM, status ekraf, dan
                status publikasi data.
              </p>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row">
              <button
                type="button"
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold !text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 text-white" />
                Tambah Data
              </button>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => changeSearch(e.target.value)}
                  placeholder="Cari UMKM..."
                  className="w-full rounded-2xl border bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 xl:w-72"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => changeStatus(e.target.value)}
                className="rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
              >
                <option value="semua">Semua status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>

              <select
                value={ekrafFilter}
                onChange={(e) => changeEkrafFilter(e.target.value)}
                className="rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
              >
                <option value="semua">Semua jenis</option>
                <option value="ekraf">Ekraf</option>
                <option value="nonekraf">Non-Ekraf</option>
              </select>
            </div>
          </div>

          {message && (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
                message.startsWith("Gagal")
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-gray-600">
            Menampilkan{" "}
            <span className="font-semibold text-gray-900">
              {filteredData.length === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredData.length)}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-gray-900">
              {filteredData.length}
            </span>{" "}
            data.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-gray-600">
                <th className="px-5 py-4 font-semibold">Nama Usaha</th>
                <th className="px-5 py-4 font-semibold">Kategori</th>
                <th className="px-5 py-4 font-semibold">Ekraf</th>
                <th className="px-5 py-4 font-semibold">Alamat</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Maps</th>
                <th className="px-5 py-4 font-semibold">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                currentData.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="px-5 py-4 align-top">
                      <p className="font-semibold text-gray-950">
                        {item.nama_usaha}
                      </p>

                      {item.sectors.length > 1 && (
                        <p className="mt-1 text-xs font-semibold text-green-600">
                          Multi kategori
                        </p>
                      )}

                      {item.descriptions?.length > 0 && (
                        <p className="mt-2 line-clamp-2 max-w-xs text-xs leading-5 text-gray-500">
                          {item.descriptions.join(", ")}
                        </p>
                      )}

                      {item.rowIds?.length > 1 && (
                        <p className="mt-2 text-xs text-gray-400">
                          {item.rowIds.length} baris data tergabung
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="flex max-w-xs flex-wrap gap-1">
                        {item.sectors.slice(0, 3).map((sector: any) => (
                          <span
                            key={sector.slug}
                            className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                          >
                            {sector.name}
                          </span>
                        ))}

                        {item.sectors.length > 3 && (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                            +{item.sectors.length - 3}
                          </span>
                        )}
                      </div>

                      {item.old_sector && (
                        <p className="mt-2 line-clamp-2 max-w-xs text-xs text-gray-400">
                          Sektor lama: {item.old_sector}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.is_ekraf
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.is_ekraf ? "Ekraf" : "Non-Ekraf"}
                      </span>
                    </td>

                    <td className="max-w-sm px-5 py-4 align-top text-gray-600">
                      {item.alamat ?? "-"}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.gmaps_url
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.gmaps_url ? "Ada" : "Koordinat"}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-xl border px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleStatus(item)}
                          disabled={loadingId === item.id}
                          className={`rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                            item.is_active
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {loadingId === item.id
                            ? "Memproses..."
                            : item.is_active
                              ? "Nonaktifkan"
                              : "Aktifkan"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t p-5 sm:flex-row">
          <p className="text-sm text-gray-500">
            Halaman {currentPage} dari {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
            >
              Sebelumnya
            </button>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                  Tambah Data
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-gray-950">
                  Tambah UMKM Baru
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Jika memilih dua kategori, sistem akan menyimpan dua baris
                  data dan menampilkannya sebagai satu UMKM dengan dua badge.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-xl bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveAdd} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Nama Usaha <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.nama_usaha}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      nama_usaha: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Alamat
                </label>
                <textarea
                  rows={3}
                  value={addForm.alamat}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      alamat: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Deskripsi / Layanan
                </label>
                <textarea
                  rows={3}
                  value={addForm.deskripsi}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      deskripsi: e.target.value,
                    }))
                  }
                  placeholder="Contoh: jual bandeng presto dan jasa travel"
                  className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Kategori UMKM 1
                  </label>
                  <select
                    value={addForm.kategori_umkm}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        kategori_umkm: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                  >
                    <option value="">Pilih kategori utama</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Kategori UMKM 2{" "}
                    <span className="text-gray-400">(opsional)</span>
                  </label>
                  <select
                    value={addForm.kategori_umkm_2}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        kategori_umkm_2: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                  >
                    <option value="">Tidak ada kategori kedua</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {addForm.kategori_umkm_2 &&
                addForm.kategori_umkm_2 === addForm.kategori_umkm && (
                  <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Kategori kedua sama dengan kategori pertama. Sistem hanya
                    akan menyimpan satu kategori.
                  </div>
                )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Status Ekraf
                </label>
                <select
                  value={addForm.is_ekraf ? "true" : "false"}
                  onChange={(e) =>
                    setAddForm((prev) => ({
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

              <RtRwSelect
                rt={addForm.rt}
                rw={addForm.rw}
                onChangeRt={(value) =>
                  setAddForm((prev) => ({ ...prev, rt: value }))
                }
                onChangeRw={(value) =>
                  setAddForm((prev) => ({ ...prev, rw: value }))
                }
              />

              <CoordinateFields
                latitude={addForm.latitude}
                longitude={addForm.longitude}
                onChangeLatitude={(value) =>
                  setAddForm((prev) => ({ ...prev, latitude: value }))
                }
                onChangeLongitude={(value) =>
                  setAddForm((prev) => ({ ...prev, longitude: value }))
                }
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={addForm.gmaps_url}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      gmaps_url: e.target.value,
                    }))
                  }
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <ModalActions
                onCancel={closeAddModal}
                loading={savingAdd}
                submitText="Tambah Data"
                loadingText="Menyimpan..."
              />
            </form>
          </div>
        </div>
      )}

      {editItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                  Edit UMKM
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-gray-950">
                  {editItem.nama_usaha}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Perubahan berlaku untuk semua baris data yang tergabung pada
                  UMKM ini.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-xl bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editItem.rowIds?.length > 1 && (
              <div className="mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Data ini menggabungkan {editItem.rowIds.length} baris. Edit
                nama, alamat, kategori, status ekraf, RT/RW, koordinat, dan
                Google Maps akan berlaku pada data terkait.
              </div>
            )}

            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Nama Usaha
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nama_usaha}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      nama_usaha: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Alamat
                </label>
                <textarea
                  rows={3}
                  value={editForm.alamat}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      alamat: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Kategori UMKM 1
                  </label>
                  <select
                    value={editForm.kategori_umkm}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        kategori_umkm: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                  >
                    <option value="">Pilih kategori utama</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Kategori UMKM 2{" "}
                    <span className="text-gray-400">(opsional)</span>
                  </label>
                  <select
                    value={editForm.kategori_umkm_2}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        kategori_umkm_2: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                  >
                    <option value="">Tidak ada kategori kedua</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editForm.kategori_umkm_2 &&
                editForm.kategori_umkm_2 === editForm.kategori_umkm && (
                  <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Kategori kedua sama dengan kategori pertama. Sistem hanya
                    akan menyimpan satu kategori.
                  </div>
                )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Status Ekraf
                </label>
                <select
                  value={editForm.is_ekraf ? "true" : "false"}
                  onChange={(e) =>
                    setEditForm((prev) => ({
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

              {editItem.old_sector && (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    Sektor lama:
                  </span>{" "}
                  {editItem.old_sector}
                </div>
              )}

              <RtRwSelect
                rt={editForm.rt}
                rw={editForm.rw}
                onChangeRt={(value) =>
                  setEditForm((prev) => ({ ...prev, rt: value }))
                }
                onChangeRw={(value) =>
                  setEditForm((prev) => ({ ...prev, rw: value }))
                }
              />

              <CoordinateFields
                latitude={editForm.latitude}
                longitude={editForm.longitude}
                onChangeLatitude={(value) =>
                  setEditForm((prev) => ({ ...prev, latitude: value }))
                }
                onChangeLongitude={(value) =>
                  setEditForm((prev) => ({ ...prev, longitude: value }))
                }
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={editForm.gmaps_url}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      gmaps_url: e.target.value,
                    }))
                  }
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <ModalActions
                onCancel={closeEditModal}
                loading={savingEdit}
                submitText="Simpan Perubahan"
                loadingText="Menyimpan..."
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function RtRwSelect({
  rt,
  rw,
  onChangeRt,
  onChangeRw,
}: {
  rt: string;
  rw: string;
  onChangeRt: (value: string) => void;
  onChangeRw: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          RT
        </label>
        <select
          value={rt}
          onChange={(e) => onChangeRt(e.target.value)}
          className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
        >
          <option value="">Pilih RT</option>
          {RT_OPTIONS.map((item) => (
            <option key={item} value={item}>
              RT {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          RW
        </label>
        <select
          value={rw}
          onChange={(e) => onChangeRw(e.target.value)}
          className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
        >
          <option value="">Pilih RW</option>
          {RW_OPTIONS.map((item) => (
            <option key={item} value={item}>
              RW {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function CoordinateFields({
  latitude,
  longitude,
  onChangeLatitude,
  onChangeLongitude,
}: {
  latitude: string;
  longitude: string;
  onChangeLatitude: (value: string) => void;
  onChangeLongitude: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          Latitude
        </label>
        <input
          type="text"
          value={latitude}
          onChange={(e) => onChangeLatitude(e.target.value)}
          placeholder="-7.9666204"
          className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          Longitude
        </label>
        <input
          type="text"
          value={longitude}
          onChange={(e) => onChangeLongitude(e.target.value)}
          placeholder="112.6326321"
          className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  loading,
  submitText,
  loadingText,
}: {
  onCancel: () => void;
  loading: boolean;
  submitText: string;
  loadingText: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-2xl border px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
      >
        Batal
      </button>

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold !text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? loadingText : submitText}
      </button>
    </div>
  );
}