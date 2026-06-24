import { supabase } from "@/lib/supabaseClient";
import UmkmList from "@/components/UmkmList";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/footer";

export default async function Home() {
  const { data: umkm, error } = await supabase
    .from("umkm")
    .select(`
      id,
      business_name,
      slug,
      phone,
      short_address,
      description,
      featured_product,
      opening_hours,
      gmaps_url,
      status,
      category_id,
      categories (
        id,
        name,
        slug
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 px-6 py-8">
          <section className="mx-auto max-w-5xl">
            <h1 className="text-2xl font-bold text-gray-900">SI PESAT</h1>
            <p className="mt-4 text-red-600">Error: {error.message}</p>
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
          <Hero />

          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Direktori UMKM
              </p>
              <h2
                id="daftar-umkm"
                className="mt-1 text-2xl font-bold text-gray-900"
              >
                Daftar UMKM
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Cari dan temukan usaha lokal berdasarkan nama atau kategori.
              </p>
            </div>
          </div>

          <UmkmList umkm={(umkm as any[]) ?? []} />

          <AboutSection />
        </section>
      </main>

      <Footer />
    </>
  );
}