import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border bg-gradient-to-br from-white via-blue-50 to-indigo-100 px-6 py-10 md:px-12 md:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-2">

        {/* KIRI */}
        <div>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            📍 Website Direktori UMKM Kelurahan
          </span>

          <h1 className="mt-6 text-4xl font-black leading-tight text-gray-900 md:text-6xl">
            Temukan UMKM
            <br />
            Lokal dengan
            <span className="text-blue-600"> Lebih Mudah</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-gray-600 md:text-lg">
            SI PESAT membantu masyarakat menemukan informasi UMKM
            berdasarkan nama usaha, kategori, alamat, serta lokasi Google
            Maps secara cepat.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="#daftar-umkm"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              Lihat Daftar UMKM
              <ArrowRight size={18} />
            </a>

            <a
              href="#peta"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-7 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <MapPin size={18} />
              Lihat Peta
            </a>
          </div>
        </div>

        {/* KANAN */}
        <div className="flex justify-center">
          <div className="relative h-64 w-64 md:h-96 md:w-96">

            <div className="absolute inset-0 rounded-full bg-blue-200 blur-3xl opacity-40"></div>

            <div className="absolute left-8 top-10 h-28 w-20 rounded-2xl bg-blue-100 shadow-md md:h-36 md:w-24"></div>

            <div className="absolute bottom-6 right-4 flex h-44 w-44 flex-col items-center rounded-[30px] bg-white shadow-2xl md:h-56 md:w-56">

              <div className="flex h-14 w-full items-center justify-center rounded-t-[30px] bg-blue-600 font-bold text-white">
                UMKM
              </div>

              <div className="mt-5 h-20 w-20 rounded-2xl bg-blue-100"></div>

              <div className="mt-5 h-4 w-24 rounded-full bg-gray-200"></div>

              <div className="mt-3 h-4 w-20 rounded-full bg-gray-200"></div>
            </div>

            <div className="absolute left-28 top-20 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl">
              📍
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}