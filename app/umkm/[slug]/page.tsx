import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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
      <main className="min-h-screen bg-gray-50 px-6 py-8">
        <section className="mx-auto max-w-4xl">
          <Link href="/" className="text-sm text-blue-600">
            ← Kembali ke daftar UMKM
          </Link>

          <div className="mt-6 rounded-xl border bg-white p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              UMKM tidak ditemukan
            </h1>
            <p className="mt-2 text-gray-600">
              Data UMKM yang kamu cari tidak tersedia.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <section className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-blue-600">
          ← Kembali ke daftar UMKM
        </Link>

        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            {umkm.business_name}
          </h1>

          <p className="mt-4 text-gray-700">{umkm.description}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Produk Unggulan</p>
              <p className="mt-1 font-medium text-gray-900">
                {umkm.featured_product ?? "-"}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Jam Operasional</p>
              <p className="mt-1 font-medium text-gray-900">
                {umkm.opening_hours ?? "-"}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Pemilik</p>
              <p className="mt-1 font-medium text-gray-900">
                {umkm.owner_name ?? "-"}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Kontak</p>
              <p className="mt-1 font-medium text-gray-900">
                {umkm.phone ?? "-"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border p-4">
            <p className="text-sm text-gray-500">Alamat Lengkap</p>
            <p className="mt-1 font-medium text-gray-900">
              {umkm.address ?? umkm.short_address ?? "-"}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {umkm.phone && (
              <a
                href={`https://wa.me/${umkm.phone.replace(/^0/, "62")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white"
              >
                Hubungi WhatsApp
              </a>
            )}

            {umkm.gmaps_url && (
              <a
                href={umkm.gmaps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
              >
                Buka Google Maps
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}