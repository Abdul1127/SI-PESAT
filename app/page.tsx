import { supabase } from "@/lib/supabaseClient";
import UmkmList from "@/components/UmkmList";

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
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold">SI PESAT</h1>
        <p className="mt-4 text-red-600">Error: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SI PESAT</h1>
          <p className="mt-2 text-gray-600">
            Sistem Informasi Pendataan dan Promosi UMKM.
          </p>
        </div>

        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Daftar UMKM
        </h2>

        <UmkmList umkm={(umkm as any[]) ?? []} />
      </section>
    </main>
  );
}