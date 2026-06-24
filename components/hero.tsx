export default function Hero() {
  return (
    <section className="mb-8 overflow-hidden rounded-3xl border bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-sm">
      <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-9">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
            Website Direktori UMKM Kelurahan
          </p>

          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-gray-950 md:text-5xl">
            Temukan UMKM Lokal dengan{" "}
            <span className="text-blue-600">Lebih Mudah</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
            SI PESAT membantu masyarakat menemukan informasi UMKM berdasarkan
            nama usaha, kategori, kontak, dan lokasi Google Maps.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#daftar-umkm"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Lihat Daftar UMKM
            </a>

            <a
              href="#tentang"
              className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Tentang SI PESAT
            </a>
          </div>
        </div>

        <div className="relative hidden min-h-[220px] md:block">
          <div className="absolute bottom-0 right-4 h-32 w-56 rounded-t-[4rem] bg-blue-100" />

          <div className="absolute bottom-9 left-10 h-28 w-14 rounded-t-2xl bg-blue-200">
            <div className="mx-auto mt-4 h-3 w-8 rounded bg-white/70" />
            <div className="mx-auto mt-3 h-3 w-8 rounded bg-white/70" />
            <div className="mx-auto mt-3 h-3 w-8 rounded bg-white/70" />
          </div>

          <div className="absolute bottom-8 right-16 h-32 w-36 rounded-3xl bg-white shadow-md">
            <div className="rounded-t-3xl bg-blue-600 px-4 py-2 text-center text-sm font-bold text-white">
              UMKM
            </div>

            <div className="mx-auto mt-4 h-12 w-16 rounded-t-xl bg-blue-100" />
            <div className="mx-auto mt-3 h-7 w-20 rounded bg-blue-50" />
          </div>

          <div className="absolute bottom-20 left-32 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg">
            📍
          </div>

          <div className="absolute right-4 top-8 h-9 w-18 rounded-full bg-white/80" />
          <div className="absolute right-0 top-13 h-7 w-14 rounded-full bg-white/70" />
          <div className="absolute left-28 top-10 h-7 w-14 rounded-full bg-white/80" />
        </div>
      </div>
    </section>
  );
}