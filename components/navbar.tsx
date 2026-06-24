import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
            SP
          </div>

          <div>
            <p className="text-base font-bold leading-none text-gray-900">
              SI PESAT
            </p>
            <p className="text-xs text-gray-500">
              Sistem Informasi UMKM
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          <Link href="/" className="hover:text-blue-600">
            Beranda
          </Link>
          <a href="#daftar-umkm" className="hover:text-blue-600">
            UMKM
          </a>
          <a href="#tentang" className="hover:text-blue-600">
            Tentang
          </a>
        </nav>
      </div>
    </header>
  );
}