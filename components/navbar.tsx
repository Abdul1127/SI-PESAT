"use client";

import Link from "next/link";
import Image from "next/image";
import { House, Store, Map, Info } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white shadow-sm">
            <Image
              src="/logo-sipesat.png"
              alt="Logo SI PESAT"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>

          <div className="flex flex-col justify-center">
            <Image
              src="/text-sipesat.png"
              alt="SI PESAT"
              width={260}
              height={80}
              className="h-[25px] w-auto object-contain object-left"
              priority
            />

            <p className="mt-0 text-xs leading-none text-gray-500 sm:text-sm">
              Direktori UMKM
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#beranda"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            <House className="h-4 w-4" />
            Beranda
          </a>

          <a
            href="#umkm"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            <Store className="h-4 w-4" />
            UMKM
          </a>

          <a
            href="#peta"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            <Map className="h-4 w-4" />
            Peta
          </a>

          <a
            href="#tentang"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            <Info className="h-4 w-4" />
            Tentang
          </a>
        </nav>
      </div>
    </header>
  );
}