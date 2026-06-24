export default function AboutSection() {
  return (
    <section
      id="tentang"
      className="mt-12 rounded-3xl border bg-white p-6 shadow-sm"
    >
      <p className="text-sm font-medium text-blue-600">Tentang SI PESAT</p>

      <h2 className="mt-2 text-2xl font-bold text-gray-900">
        Sistem Informasi Pendataan dan Promosi UMKM
      </h2>

      <p className="mt-3 leading-7 text-gray-600">
        SI PESAT merupakan website direktori UMKM yang dibuat untuk membantu
        masyarakat menemukan informasi usaha lokal dengan lebih mudah. Melalui
        website ini, UMKM dapat ditampilkan berdasarkan nama usaha, kategori,
        profil singkat, kontak, dan lokasi Google Maps.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="font-semibold text-gray-900">Untuk Masyarakat</p>
          <p className="mt-2 text-sm text-gray-600">
            Memudahkan pencarian UMKM lokal berdasarkan kebutuhan.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="font-semibold text-gray-900">Untuk UMKM</p>
          <p className="mt-2 text-sm text-gray-600">
            Membantu usaha lokal agar lebih mudah dikenal dan dihubungi.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="font-semibold text-gray-900">Untuk Kelurahan</p>
          <p className="mt-2 text-sm text-gray-600">
            Mendukung pendataan dan promosi potensi ekonomi wilayah.
          </p>
        </div>
      </div>
    </section>
  );
}