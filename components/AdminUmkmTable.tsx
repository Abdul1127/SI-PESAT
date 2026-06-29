"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminUmkmTable({
  data,
  onRefresh,
}: {
  data: any[];
  onRefresh?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [message, setMessage] = useState("");

  const [editItem, setEditItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    nama_usaha: "",
    alamat: "",
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

      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const changeSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const changeStatus = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const getTargetIds = (item: any) => {
    return Array.isArray(item.rowIds) && item.rowIds.length > 0
      ? item.rowIds
      : [item.id];
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
      .from("data 2025")
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

  const openEditModal = (item: any) => {
    setEditItem(item);
    setMessage("");

    setEditForm({
      nama_usaha: item.nama_usaha ?? "",
      alamat: item.alamat ?? "",
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

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editItem) return;

    const confirmAction = window.confirm(
      `Simpan perubahan untuk "${editItem.nama_usaha}"?`
    );

    if (!confirmAction) return;

    setSavingEdit(true);
    setMessage("");

    const latitudeValue =
      editForm.latitude.trim() === "" ? null : Number(editForm.latitude);

    const longitudeValue =
      editForm.longitude.trim() === "" ? null : Number(editForm.longitude);

    if (
      editForm.latitude.trim() !== "" &&
      Number.isNaN(Number(editForm.latitude))
    ) {
      setMessage("Gagal menyimpan: latitude harus berupa angka.");
      setSavingEdit(false);
      return;
    }

    if (
      editForm.longitude.trim() !== "" &&
      Number.isNaN(Number(editForm.longitude))
    ) {
      setMessage("Gagal menyimpan: longitude harus berupa angka.");
      setSavingEdit(false);
      return;
    }

    const { error } = await supabase
      .from("data 2025")
      .update({
        nama_usaha: editForm.nama_usaha.trim(),
        alamat: editForm.alamat.trim(),
        latitude: latitudeValue,
        longitude: longitudeValue,
        gmaps_url:
          editForm.gmaps_url.trim() === "" ? null : editForm.gmaps_url.trim(),
      })
      .in("id", getTargetIds(editItem));

    if (error) {
      setMessage(`Gagal menyimpan perubahan: ${error.message}`);
      setSavingEdit(false);
      return;
    }

    setMessage(`"${editForm.nama_usaha}" berhasil diperbarui.`);
    setSavingEdit(false);
    setEditItem(null);
    onRefresh?.();
  };

  return (
    <>
      <div className="rounded-3xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-lg font-bold text-gray-950">Data UMKM</p>
              <p className="mt-1 text-sm text-gray-600">
                Cari, pantau status, dan kelola data UMKM SI PESAT.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => changeSearch(e.target.value)}
                  placeholder="Cari UMKM..."
                  className="w-full rounded-2xl border bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 sm:w-72"
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
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-gray-600">
                <th className="px-5 py-4 font-semibold">Nama Usaha</th>
                <th className="px-5 py-4 font-semibold">Sektor</th>
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
                    colSpan={6}
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
                          Multi layanan
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
                  Perubahan akan diterapkan ke semua baris data yang tergabung
                  pada UMKM ini.
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
                nama, alamat, koordinat, dan Google Maps akan berlaku untuk
                semuanya.
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
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={editForm.latitude}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        latitude: e.target.value,
                      }))
                    }
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
                    value={editForm.longitude}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        longitude: e.target.value,
                      }))
                    }
                    placeholder="112.6326321"
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

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
                <p className="mt-2 text-xs text-gray-500">
                  Kosongkan jika belum memiliki tautan Google Maps resmi.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-2xl border px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold !text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}