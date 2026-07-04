"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminUmkmTable from "@/components/AdminUmkmTable";
import {
  BarChart3,
  CheckCircle,
  CircleOff,
  Database,
  LogOut,
  MapPin,
  Store,
  Tags,
} from "lucide-react";

const TABLE_NAME = "data_2025";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminPage() {
  const router = useRouter();

  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        id,
        nama_usaha,
        alamat,
        deskripsi,
        sektor,
        kategori_umkm,
        is_ekraf,
        latitude,
        longitude,
        rt_rw,
        gmaps_url,
        image_url,
        is_active
      `)
      .order("id", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      setRawData([]);
    } else {
      setRawData(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/admin/login");
        return;
      }

      setCheckingAuth(false);
      fetchData();
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const dashboardData = useMemo(() => {
    const categories = Array.from(
      new Set(
        rawData
          .map((item: any) =>
            item.kategori_umkm && item.kategori_umkm.trim() !== ""
              ? item.kategori_umkm
              : item.sektor && item.sektor.trim() !== ""
                ? item.sektor
                : "Tanpa kategori"
          )
          .filter(Boolean)
      )
    );

    const totalData = rawData.length;

    const activeData = rawData.filter(
      (item: any) => item.is_active === true
    ).length;

    const inactiveData = rawData.filter(
      (item: any) => item.is_active === false
    ).length;

    const ekrafData = rawData.filter(
      (item: any) => item.is_ekraf === true
    ).length;

    const nonEkrafData = rawData.filter(
      (item: any) => item.is_ekraf !== true
    ).length;

    const withMaps = rawData.filter(
      (item: any) => item.gmaps_url && item.gmaps_url.trim() !== ""
    ).length;

    const withImages = rawData.filter(
      (item: any) => item.image_url && item.image_url.trim() !== ""
    ).length;

    const withCoordinate = rawData.filter(
      (item: any) => item.latitude !== null && item.longitude !== null
    ).length;

    const grouped = new Map<string, any>();

    for (const item of rawData) {
      const nameKey = item.nama_usaha?.toLowerCase().trim() ?? "";
      const addressKey = item.alamat?.toLowerCase().trim() ?? "";
      const key = `${nameKey}|${addressKey}`;

      const kategoriUtama =
        item.kategori_umkm && item.kategori_umkm.trim() !== ""
          ? item.kategori_umkm
          : item.sektor && item.sektor.trim() !== ""
            ? item.sektor
            : "Tanpa kategori";

      const category = kategoriUtama
        ? {
            name: kategoriUtama,
            slug: slugify(kategoriUtama),
          }
        : null;

      if (!grouped.has(key)) {
        grouped.set(key, {
          id: item.id,
          rowIds: [item.id],

          nama_usaha: item.nama_usaha,
          alamat: item.alamat,
          deskripsi: item.deskripsi,
          rt_rw: item.rt_rw,

          latitude: item.latitude,
          longitude: item.longitude,
          gmaps_url: item.gmaps_url,
          image_url: item.image_url,

          is_active: item.is_active,
          kategori_umkm: item.kategori_umkm,
          old_sector: item.sektor,
          is_ekraf: item.is_ekraf,

          sectors: category ? [category] : [],
          descriptions: item.deskripsi ? [item.deskripsi] : [],
        });
      } else {
        const current = grouped.get(key);

        current.rowIds.push(item.id);

        if (
          category &&
          !current.sectors.some((s: any) => s.slug === category.slug)
        ) {
          current.sectors.push(category);
        }

        if (item.deskripsi && !current.descriptions.includes(item.deskripsi)) {
          current.descriptions.push(item.deskripsi);
        }

        if (!current.gmaps_url && item.gmaps_url) {
          current.gmaps_url = item.gmaps_url;
        }

        if (!current.image_url && item.image_url) {
          current.image_url = item.image_url;
        }

        if (!current.latitude && item.latitude) {
          current.latitude = item.latitude;
        }

        if (!current.longitude && item.longitude) {
          current.longitude = item.longitude;
        }

        if (!current.rt_rw && item.rt_rw) {
          current.rt_rw = item.rt_rw;
        }

        if (!current.kategori_umkm && item.kategori_umkm) {
          current.kategori_umkm = item.kategori_umkm;
        }

        if (!current.old_sector && item.sektor) {
          current.old_sector = item.sektor;
        }

        if (current.is_active !== false && item.is_active === false) {
          current.is_active = false;
        }

        if (current.is_ekraf !== true && item.is_ekraf === true) {
          current.is_ekraf = true;
        }
      }
    }

    const groupedData = Array.from(grouped.values());

    const coordinatePercentage =
      totalData > 0 ? Math.round((withCoordinate / totalData) * 100) : 0;

    const mapsPercentage =
      totalData > 0 ? Math.round((withMaps / totalData) * 100) : 0;

    const imagePercentage =
      totalData > 0 ? Math.round((withImages / totalData) * 100) : 0;

    const ekrafPercentage =
      totalData > 0 ? Math.round((ekrafData / totalData) * 100) : 0;

    return {
      categories,
      totalData,
      activeData,
      inactiveData,
      ekrafData,
      nonEkrafData,
      withMaps,
      withImages,
      withCoordinate,
      groupedData,
      coordinatePercentage,
      mapsPercentage,
      imagePercentage,
      ekrafPercentage,
    };
  }, [rawData]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-gray-900">
        Mengecek akses admin...
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-gray-900">
        Memuat dashboard admin...
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-8">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              SI PESAT Admin
            </h1>
            <p className="mt-4 text-red-600">Error: {errorMessage}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_30%),linear-gradient(to_bottom,#f8fafc,#eef2ff)] px-6 py-8">
      <section className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 rounded-3xl border bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Dashboard Admin
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-gray-950">
              SI PESAT Admin
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Kelola data UMKM, kategori, status ekraf, foto, dan kelengkapan
              lokasi.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-green-50 px-5 py-3">
              <p className="text-sm text-green-700">Status</p>
              <p className="font-bold text-green-900">Admin Login</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Database className="h-5 w-5" />
            </div>

            <p className="text-sm text-gray-500">Total Baris Data</p>
            <p className="mt-1 text-3xl font-extrabold text-gray-950">
              {dashboardData.totalData}
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>

            <p className="text-sm text-gray-500">Data Aktif</p>
            <p className="mt-1 text-3xl font-extrabold text-gray-950">
              {dashboardData.activeData}
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <CircleOff className="h-5 w-5" />
            </div>

            <p className="text-sm text-gray-500">Nonaktif</p>
            <p className="mt-1 text-3xl font-extrabold text-gray-950">
              {dashboardData.inactiveData}
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Tags className="h-5 w-5" />
            </div>

            <p className="text-sm text-gray-500">Kategori UMKM</p>
            <p className="mt-1 text-3xl font-extrabold text-gray-950">
              {dashboardData.categories.length}
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <MapPin className="h-5 w-5" />
            </div>

            <p className="text-sm text-gray-500">Punya GMaps</p>
            <p className="mt-1 text-3xl font-extrabold text-gray-950">
              {dashboardData.withMaps}
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600">
              <BarChart3 className="h-5 w-5" />
              <p className="font-bold">Kualitas Data</p>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">Memiliki koordinat</span>
                  <span className="font-semibold text-gray-900">
                    {dashboardData.withCoordinate} / {dashboardData.totalData}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${dashboardData.coordinatePercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">
                    Memiliki Google Maps resmi
                  </span>
                  <span className="font-semibold text-gray-900">
                    {dashboardData.withMaps} / {dashboardData.totalData}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-green-100">
                  <div
                    className="h-full rounded-full bg-green-600"
                    style={{
                      width: `${dashboardData.mapsPercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">Memiliki foto</span>
                  <span className="font-semibold text-gray-900">
                    {dashboardData.withImages} / {dashboardData.totalData}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-purple-100">
                  <div
                    className="h-full rounded-full bg-purple-600"
                    style={{
                      width: `${dashboardData.imagePercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600">
              <Store className="h-5 w-5" />
              <p className="font-bold">Status Ekraf dan Data Unik</p>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-600">
              Kategori publik memakai kolom kategori_umkm. Sektor lama tetap
              disimpan sebagai arsip, sedangkan is_ekraf dipakai untuk
              membedakan UMKM ekraf dan non-ekraf.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-sm text-blue-700">UMKM unik</p>
                <p className="text-2xl font-extrabold text-blue-900">
                  {dashboardData.groupedData.length}
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-sm text-green-700">Ekraf</p>
                <p className="text-2xl font-extrabold text-green-900">
                  {dashboardData.ekrafData}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-100 p-4">
                <p className="text-sm text-gray-600">Non-Ekraf</p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {dashboardData.nonEkrafData}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600">Proporsi ekraf</span>
                <span className="font-semibold text-gray-900">
                  {dashboardData.ekrafPercentage}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-green-600"
                  style={{
                    width: `${dashboardData.ekrafPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <AdminUmkmTable
          data={dashboardData.groupedData}
          onRefresh={fetchData}
        />
      </section>
    </main>
  );
}