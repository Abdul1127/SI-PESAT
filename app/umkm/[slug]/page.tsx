import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default async function UmkmDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: umkm, error } = await supabase
    .from("umkm")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !umkm) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 px-6 py-8">
          <section className="mx-auto max-w-4xl">
            <Link href="/" className="text-sm font-medium text-blue-600">
              ← Kembali ke daftar UMKM
            </Link>

            <div className="mt-6 rounded-3xl border bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                ⚠️
              </div>

              <h1 className="mt-5 text-2xl font-bold text-gray-900">
                UMKM tidak ditemukan
              </h1>

              <p className="mt-2 text-gray-600">
                Data UMKM yang kamu cari tidak tersedia atau belum aktif.
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-6 py-8">
        <section className="mx-auto max-w-5xl">
          <Link href="/" className="text-sm font-medium text-blue-600">
            ← Kembali ke daftar UMKM
          </Link>

          <div className="mt-6 overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="bg-blue-600 px-6 py-10 text-white">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl">
                    🏪
                  </div>

                  <p className="mt-5 text-sm font-medium text-blue-100">
                    Profil UMKM
                  </p>

                  <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                    {umkm.business_name}
                  </h1>

                  <p className="mt-3 max-w-2xl leading-7 text-blue-100">
                    {umkm.description ?? "Deskripsi usaha belum tersedia."}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 text-sm text-blue-50">
                  <p className="font-semibold text-white">Status Data</p>
                  <p className="mt-1">
                    {umkm.status === "active"
                      ? "Aktif ditampilkan"
                      : umkm.status ?? "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="rounded-2xl border bg-gray-50 p-5">
                  <p className="text-sm font-medium text-blue-600">
                    Informasi Usaha
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Produk Unggulan</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {umkm.featured_product ?? "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Jam Operasional</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {umkm.opening_hours ?? "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Pemilik</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {umkm.owner_name ?? "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Kontak</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {umkm.phone ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-gray-50 p-5">
                  <p className="text-sm font-medium text-blue-600">
                    Lokasi Usaha
                  </p>

                  <p className="mt-3 text-sm text-gray-500">Alamat Lengkap</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {umkm.address ?? umkm.short_address ?? "-"}
                  </p>

                  {(umkm.latitude || umkm.longitude) && (
                    <p className="mt-3 text-sm text-gray-600">
                      Koordinat: {umkm.latitude ?? "-"}, {umkm.longitude ?? "-"}
                    </p>
                  )}
                </div>
              </div>

              <aside className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="font-semibold text-gray-900">Aksi Cepat</p>
                <p className="mt-1 text-sm text-gray-600">
                  Hubungi UMKM atau buka lokasi usaha melalui Google Maps.
                </p>

                <div className="mt-5 space-y-2">
                  {umkm.phone && (
                    <a
                      href={`https://wa.me/${umkm.phone.replace(/^0/, "62")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl bg-green-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Hubungi WhatsApp
                    </a>
                  )}

                  {umkm.gmaps_url && (
                    <a
                      href={umkm.gmaps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Buka Google Maps
                    </a>
                  )}

                  <Link
                    href="/"
                    className="block rounded-xl border px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Kembali ke Direktori
                  </Link>
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