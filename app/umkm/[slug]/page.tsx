import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { MapPin, Store, Tags, Navigation, ArrowLeft } from "lucide-react";

export default async function UmkmDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: umkm, error } = await supabase
    .from("data 2025")
    .select("*")
    .eq("id", slug)
    .single();

  if (error || !umkm) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 px-6 py-8">
          <section className="mx-auto max-w-5xl">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke daftar UMKM
            </Link>

            <div className="mt-6 rounded-3xl border bg-white p-8 text-center shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900">
                UMKM tidak ditemukan
              </h1>
              <p className="mt-2 text-gray-600">
                Data UMKM yang kamu cari tidak tersedia.
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const mapsUrl =
    umkm.gmaps_url && umkm.gmaps_url.trim() !== ""
      ? umkm.gmaps_url
      : umkm.latitude && umkm.longitude
        ? `https://www.google.com/maps/search/?api=1&query=${umkm.latitude},${umkm.longitude}`
        : null;

  const hasOfficialMaps = umkm.gmaps_url && umkm.gmaps_url.trim() !== "";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_30%),linear-gradient(to_bottom,#f8fafc,#eef2ff)] px-6 py-8">
        <section className="mx-auto max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar UMKM
          </Link>

          <div className="mt-6 overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-10 text-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                <Store className="h-8 w-8" />
              </div>

              <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-blue-100">
                Profil UMKM
              </p>

              <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
                {umkm.nama_usaha}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
                  {umkm.sektor ?? "Tanpa sektor"}
                </span>

                <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
                  {hasOfficialMaps ? "Google Maps resmi tersedia" : "Menggunakan titik koordinat"}
                </span>
              </div>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-2">
                <div className="rounded-3xl border bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Tags className="h-5 w-5" />
                    <p className="font-semibold">Informasi Usaha</p>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Nama Usaha</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {umkm.nama_usaha ?? "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Sektor</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {umkm.sektor ?? "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">RT/RW</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {umkm.rt_rw ?? "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">ID Data</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {umkm.id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border bg-slate-50 p-5">
                  <p className="font-semibold text-blue-600">Deskripsi</p>
                  <p className="mt-3 leading-7 text-gray-700">
                    {umkm.deskripsi ?? "Deskripsi usaha belum tersedia."}
                  </p>
                </div>

                <div className="rounded-3xl border bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-blue-600">
                    <MapPin className="h-5 w-5" />
                    <p className="font-semibold">Lokasi Usaha</p>
                  </div>

                  <p className="mt-4 text-sm text-gray-500">Alamat</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {umkm.alamat ?? "-"}
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Latitude</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {umkm.latitude ?? "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Longitude</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {umkm.longitude ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="h-fit rounded-3xl border bg-white p-5 shadow-sm">
                <p className="text-lg font-bold text-gray-900">Aksi Cepat</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Buka lokasi UMKM melalui Google Maps. Jika tersedia, sistem akan memakai link Google Maps resmi.
                </p>

                <div className="mt-5 space-y-3">
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <Navigation className="h-4 w-4" />
                      Buka Google Maps
                    </a>
                  )}

                  <Link
                    href="/"
                    className="block rounded-2xl border px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Kembali ke Direktori
                  </Link>
                </div>

                <div className="mt-5 rounded-2xl bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-700">
                    Status Maps
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {hasOfficialMaps
                      ? "Menggunakan link Google Maps resmi."
                      : "Belum ada link resmi, menggunakan koordinat."}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}