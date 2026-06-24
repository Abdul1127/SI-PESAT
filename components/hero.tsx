export default function Hero() {
  return (
    <section className="mb-10 rounded-3xl bg-blue-600 px-6 py-10 text-white shadow-sm">
      <div className="max-w-3xl">
        <p className="mb-3 text-sm font-medium text-blue-100">
          Website Direktori UMKM Kelurahan
        </p>

        <h1 className="text-3xl font-bold leading-tight md:text-5xl">
          Temukan UMKM Lokal dengan Lebih Mudah
        </h1>

        <p className="mt-4 text-base leading-7 text-blue-100 md:text-lg">
          SI PESAT membantu masyarakat menemukan informasi UMKM berdasarkan
          nama usaha, kategori, kontak, dan lokasi Google Maps.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#daftar-umkm"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700"
          >
            Lihat Daftar UMKM
          </a>

          <a
            href="#tentang"
            className="rounded-xl border border-blue-200 px-5 py-3 text-sm font-semibold text-white"
          >
            Tentang SI PESAT
          </a>
        </div>
      </div>
    </section>
  );
}