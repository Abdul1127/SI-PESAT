export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">SI PESAT</p>
            <p className="mt-1 text-sm text-gray-600">
              Sistem Informasi Pendataan dan Promosi UMKM.
            </p>
          </div>

          <div className="text-sm text-gray-500 md:text-right">
            <p>Program KKN Mahasiswa</p>
            <p>© 2026 SI PESAT. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}