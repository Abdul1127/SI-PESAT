import { Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import UmkmList from "@/components/UmkmList";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/footer";
import UmkmMap from "@/components/UmkmMap";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const TABLE_NAME = "data_2025";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 p-8 text-gray-900">
          Memuat SI PESAT...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
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
      wa,
      is_active
    `)
    .eq("is_active", true)
    .order("id", { ascending: true });

  const rawUmkm =
    data?.map((item: any) => {
      const kategoriUtama =
        item.kategori_umkm && item.kategori_umkm.trim() !== ""
          ? item.kategori_umkm
          : item.sektor && item.sektor.trim() !== ""
            ? item.sektor
            : "Tanpa kategori";

      const mapsUrl =
        item.gmaps_url && item.gmaps_url.trim() !== ""
          ? item.gmaps_url
          : item.latitude && item.longitude
            ? `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`
            : null;

      return {
        id: item.id,
        rowIds: [item.id],

        business_name: item.nama_usaha,
        slug: String(item.id),

        short_address: item.alamat,
        address: item.alamat,

        description: item.deskripsi,
        descriptions: item.deskripsi ? [item.deskripsi] : [],

        latitude: item.latitude,
        longitude: item.longitude,
        rt_rw: item.rt_rw,

        gmaps_url: mapsUrl,
        image_url: item.image_url,
        wa: item.wa,

        kategori_umkm: item.kategori_umkm,
        old_sector: item.sektor,
        is_ekraf: item.is_ekraf,

        categories: {
          id: kategoriUtama,
          name: kategoriUtama,
          slug: slugify(kategoriUtama),
        },

        sectors: kategoriUtama
          ? [
              {
                id: kategoriUtama,
                name: kategoriUtama,
                slug: slugify(kategoriUtama),
              },
            ]
          : [],
      };
    }) ?? [];

  const grouped = new Map<string, any>();

  for (const item of rawUmkm) {
    const nameKey = item.business_name?.toLowerCase().trim() ?? "";
    const addressKey = item.address?.toLowerCase().trim() ?? "";
    const key = `${nameKey}|${addressKey}`;

    if (!grouped.has(key)) {
      grouped.set(key, { ...item });
    } else {
      const current = grouped.get(key);

      current.rowIds.push(item.id);

      for (const sector of item.sectors) {
        if (!current.sectors.some((s: any) => s.slug === sector.slug)) {
          current.sectors.push(sector);
        }
      }

      for (const desc of item.descriptions) {
        if (desc && !current.descriptions.includes(desc)) {
          current.descriptions.push(desc);
        }
      }

      if (!current.gmaps_url && item.gmaps_url) {
        current.gmaps_url = item.gmaps_url;
      }

      if (!current.image_url && item.image_url) {
        current.image_url = item.image_url;
      }

      if (!current.wa && item.wa) {
        current.wa = item.wa;
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

      if (current.is_ekraf !== true && item.is_ekraf === true) {
        current.is_ekraf = true;
      }

      current.description = current.descriptions.join(", ");
    }
  }

  const umkm = Array.from(grouped.values());

  if (error) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-slate-50 px-6 py-8">
          <section className="mx-auto max-w-6xl">
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900">SI PESAT</h1>
              <p className="mt-4 text-red-600">Error: {error.message}</p>
            </div>
          </section>
        </main>

        <Footer />
        <ScrollToTopButton />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_30%),linear-gradient(to_bottom,#f8fafc,#eef2ff)] px-6 py-8">
        <section className="mx-auto max-w-6xl">
          <div id="beranda" className="scroll-mt-28">
            <Hero />
          </div>

          <div
            id="umkm"
            className="mb-6 flex scroll-mt-28 flex-col justify-between gap-4 md:flex-row md:items-end"
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                Direktori UMKM
              </p>

              <h2
                id="daftar-umkm"
                className="mt-2 text-3xl font-extrabold text-gray-950"
              >
                Jelajahi UMKM Terdaftar
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Gunakan pencarian dan filter kategori untuk menemukan usaha
                lokal yang sesuai dengan kebutuhan Anda.
              </p>
            </div>

            <div className="rounded-2xl border bg-white px-5 py-3 shadow-sm">
              <p className="text-sm text-gray-500">Total Data Unik</p>
              <p className="text-2xl font-bold text-gray-900">
                {umkm.length} UMKM
              </p>
            </div>
          </div>

          <UmkmList umkm={umkm} />

          <UmkmMap umkm={umkm} />

          <AboutSection />
        </section>
      </main>

      <Footer />
      <ScrollToTopButton />
    </>
  );
}