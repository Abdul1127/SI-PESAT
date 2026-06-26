import Link from "next/link";
import { Home, Info, Map, Store } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
            SP
          </div>

          <div>
            <p className="text-sm font-bold leading-none text-gray-900 md:text-base">
              SI PESAT
            </p>
            <p className="text-xs text-gray-500">Direktori UMKM</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-medium text-gray-600 md:flex">
          <a
            href="#beranda"
            className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-600"
          >
            <Home className="h-4 w-4" />
            Beranda
          </a>

          <a
            href="#daftar-umkm"
            className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-600"
          >
            <Store className="h-4 w-4" />
            UMKM
          </a>

          <a
            href="#peta"
            className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-600"
          >
            <Map className="h-4 w-4" />
            Peta
          </a>

          <a
            href="#tentang"
            className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-600"
          >
            <Info className="h-4 w-4" />
            Tentang
          </a>
        </nav>

        <nav className="flex items-center gap-1 md:hidden">
          <a href="#beranda" className="rounded-xl p-2 text-gray-600">
            <Home className="h-5 w-5" />
          </a>
          <a href="#daftar-umkm" className="rounded-xl p-2 text-gray-600">
            <Store className="h-5 w-5" />
          </a>
          <a href="#peta" className="rounded-xl p-2 text-gray-600">
            <Map className="h-5 w-5" />
          </a>
          <a href="#tentang" className="rounded-xl p-2 text-gray-600">
            <Info className="h-5 w-5" />
          </a>
        </nav>
      </div>
    </header>
  );
}