"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { ImagePlus, Plus, Search, X } from "lucide-react";
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
  const [uploadingImage, setUploadingImage] = useState(false);
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
    image_url: "",
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
      image_url: item.image_url ?? "",
    });
  };

  const closeEditModal = () => {
    setEditItem(null);
    setSavingEdit(false);
    setUploadingImage(false);
  };

  const handleUploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !editItem) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Gagal upload foto: format harus JPG, PNG, atau WebP.");
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      setMessage("Gagal upload foto: ukuran maksimal 2 MB.");
      return;
    }

    setUploadingImage(true);
    setMessage("");

    const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = editItem.nama_usaha
      ? editItem.nama_usaha
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : "umkm";

    const filePath = `${editItem.id}-${safeName}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setMessage(`Gagal upload foto: ${uploadError.message}`);
      setUploadingImage(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    setEditForm((prev) => ({
      ...prev,
      image_url: publicUrl,
    }));

    setMessage("Foto berhasil diupload. Klik Simpan Perubahan untuk menyimpan ke data UMKM.");
    setUploadingImage(false);
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
      image_url: null,
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
      image_url:
        editForm.image_url.trim() === "" ? null : editForm.image_url.trim(),
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
            image_url:
              editForm.image_url.trim() === ""
                ? null
                : editForm.image_url.trim(),
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
                Cari, tambah data baru, atur kategori UMKM, status ekraf, foto,
                dan status publikasi data.
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
          <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-gray-600">
                <th className="px-5 py-4 font-semibold">Nama Usaha</th>
                <th className="px-5 py-4 font-semibold">Kategori</th>
                <th className="px-5 py-4 font-semibold">Foto</th>
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
                    colSpan={8}
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
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.nama_usaha ?? "Foto UMKM"}
                          className="h-14 w-20 rounded-xl object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          Belum ada
                        </span>
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
        <AddModal
          addForm={addForm}
          setAddForm={setAddForm}
          savingAdd={savingAdd}
          closeAddModal={closeAddModal}
          saveAdd={saveAdd}
        />
      )}

      {editItem && (
        <EditModal
          editItem={editItem}
          editForm={editForm}
          setEditForm={setEditForm}
          savingEdit={savingEdit}
          uploadingImage={uploadingImage}
          closeEditModal={closeEditModal}
          saveEdit={saveEdit}
          handleUploadImage={handleUploadImage}
        />
      )}
    </>
  );
}

function AddModal({
  addForm,
  setAddForm,
  savingAdd,
  closeAddModal,
  saveAdd,
}: any) {
  return (
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
              Jika memilih dua kategori, sistem akan menyimpan dua baris data
              dan menampilkannya sebagai satu UMKM dengan dua badge.
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
          <BasicFields
            form={addForm}
            setForm={setAddForm}
            includeDescription
          />

          <CategoryFields form={addForm} setForm={setAddForm} />

          <EkrafSelect
            value={addForm.is_ekraf}
            onChange={(value) =>
              setAddForm((prev: any) => ({ ...prev, is_ekraf: value }))
            }
          />

          <RtRwSelect
            rt={addForm.rt}
            rw={addForm.rw}
            onChangeRt={(value) =>
              setAddForm((prev: any) => ({ ...prev, rt: value }))
            }
            onChangeRw={(value) =>
              setAddForm((prev: any) => ({ ...prev, rw: value }))
            }
          />

          <CoordinateFields
            latitude={addForm.latitude}
            longitude={addForm.longitude}
            onChangeLatitude={(value) =>
              setAddForm((prev: any) => ({ ...prev, latitude: value }))
            }
            onChangeLongitude={(value) =>
              setAddForm((prev: any) => ({ ...prev, longitude: value }))
            }
          />

          <GmapsField
            value={addForm.gmaps_url}
            onChange={(value) =>
              setAddForm((prev: any) => ({ ...prev, gmaps_url: value }))
            }
          />

          <ModalActions
            onCancel={closeAddModal}
            loading={savingAdd}
            submitText="Tambah Data"
            loadingText="Menyimpan..."
          />
        </form>
      </div>
    </div>
  );
}

function EditModal({
  editItem,
  editForm,
  setEditForm,
  savingEdit,
  uploadingImage,
  closeEditModal,
  saveEdit,
  handleUploadImage,
}: any) {
  return (
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
              Perubahan berlaku untuk semua baris data yang tergabung pada UMKM
              ini.
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
            Data ini menggabungkan {editItem.rowIds.length} baris. Foto, nama,
            alamat, kategori, status ekraf, RT/RW, koordinat, dan Google Maps
            akan berlaku pada data terkait.
          </div>
        )}

        <form onSubmit={saveEdit} className="space-y-4">
          <BasicFields form={editForm} setForm={setEditForm} />

          <CategoryFields form={editForm} setForm={setEditForm} />

          <EkrafSelect
            value={editForm.is_ekraf}
            onChange={(value) =>
              setEditForm((prev: any) => ({ ...prev, is_ekraf: value }))
            }
          />

          {editItem.old_sector && (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">Sektor lama:</span>{" "}
              {editItem.old_sector}
            </div>
          )}

          <ImageUploadField
            imageUrl={editForm.image_url}
            uploadingImage={uploadingImage}
            handleUploadImage={handleUploadImage}
            onClear={() =>
              setEditForm((prev: any) => ({
                ...prev,
                image_url: "",
              }))
            }
          />

          <RtRwSelect
            rt={editForm.rt}
            rw={editForm.rw}
            onChangeRt={(value) =>
              setEditForm((prev: any) => ({ ...prev, rt: value }))
            }
            onChangeRw={(value) =>
              setEditForm((prev: any) => ({ ...prev, rw: value }))
            }
          />

          <CoordinateFields
            latitude={editForm.latitude}
            longitude={editForm.longitude}
            onChangeLatitude={(value) =>
              setEditForm((prev: any) => ({ ...prev, latitude: value }))
            }
            onChangeLongitude={(value) =>
              setEditForm((prev: any) => ({ ...prev, longitude: value }))
            }
          />

          <GmapsField
            value={editForm.gmaps_url}
            onChange={(value) =>
              setEditForm((prev: any) => ({ ...prev, gmaps_url: value }))
            }
          />

          <ModalActions
            onCancel={closeEditModal}
            loading={savingEdit || uploadingImage}
            submitText="Simpan Perubahan"
            loadingText={uploadingImage ? "Upload foto..." : "Menyimpan..."}
          />
        </form>
      </div>
    </div>
  );
}

function BasicFields({ form, setForm, includeDescription = false }: any) {
  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          Nama Usaha <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          required
          value={form.nama_usaha}
          onChange={(e) =>
            setForm((prev: any) => ({
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
          value={form.alamat}
          onChange={(e) =>
            setForm((prev: any) => ({
              ...prev,
              alamat: e.target.value,
            }))
          }
          className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
        />
      </div>

      {includeDescription && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Deskripsi / Layanan
          </label>
          <textarea
            rows={3}
            value={form.deskripsi}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                deskripsi: e.target.value,
              }))
            }
            placeholder="Contoh: jual bandeng presto dan jasa travel"
            className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
          />
        </div>
      )}
    </>
  );
}

function CategoryFields({ form, setForm }: any) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Kategori UMKM 1
          </label>
          <select
            value={form.kategori_umkm}
            onChange={(e) =>
              setForm((prev: any) => ({
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
            value={form.kategori_umkm_2}
            onChange={(e) =>
              setForm((prev: any) => ({
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

      {form.kategori_umkm_2 && form.kategori_umkm_2 === form.kategori_umkm && (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Kategori kedua sama dengan kategori pertama. Sistem hanya akan
          menyimpan satu kategori.
        </div>
      )}
    </>
  );
}

function EkrafSelect({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-900">
        Status Ekraf
      </label>
      <select
        value={value ? "true" : "false"}
        onChange={(e) => onChange(e.target.value === "true")}
        className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
      >
        <option value="false">Non-Ekraf</option>
        <option value="true">Ekraf</option>
      </select>
    </div>
  );
}

function ImageUploadField({
  imageUrl,
  uploadingImage,
  handleUploadImage,
  onClear,
}: {
  imageUrl: string;
  uploadingImage: boolean;
  handleUploadImage: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <label className="mb-3 block text-sm font-semibold text-gray-900">
        Foto Produk / Usaha
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl bg-white text-gray-400 sm:w-44">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Preview Foto UMKM"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus className="h-8 w-8" />
          )}
        </div>

        <div className="flex-1">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUploadImage}
            disabled={uploadingImage}
            className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
          />

          <p className="mt-2 text-xs leading-5 text-gray-500">
            Format: JPG, PNG, atau WebP. Ukuran maksimal 2 MB. Setelah upload,
            klik Simpan Perubahan.
          </p>

          {imageUrl && (
            <button
              type="button"
              onClick={onClear}
              className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              Hapus foto dari data
            </button>
          )}
        </div>
      </div>
    </div>
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

function GmapsField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-900">
        Google Maps URL
      </label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://maps.app.goo.gl/..."
        className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
      />
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