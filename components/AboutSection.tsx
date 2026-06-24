export default function AboutSection() {
  return (
    <section
      id="tentang"
      className="mt-10 overflow-hidden rounded-3xl border bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 shadow-sm"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Tentang SI PESAT
          </p>

          <h2 className="mt-3 text-3xl font-bold leading-tight text-gray-950">
            Sistem Informasi Pendataan dan Promosi UMKM
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            SI PESAT merupakan website direktori UMKM yang dibuat untuk
            membantu masyarakat menemukan informasi usaha lokal dengan lebih
            mudah. Melalui website ini, UMKM dapat ditampilkan berdasarkan nama
            usaha, kategori, profil singkat, kontak, dan lokasi.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
              👥
            </div>
            <p className="font-semibold text-gray-900">Untuk Masyarakat</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Memudahkan pencarian UMKM lokal berdasarkan nama, kategori, dan
              lokasi usaha.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
              🏪
            </div>
            <p className="font-semibold text-gray-900">Untuk UMKM</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Membantu usaha lokal agar lebih mudah dikenal, ditemukan, dan
              dihubungi oleh masyarakat.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
              🏢
            </div>
            <p className="font-semibold text-gray-900">Untuk Kelurahan</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Mendukung pendataan, publikasi, dan promosi potensi ekonomi
              wilayah secara digital.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}