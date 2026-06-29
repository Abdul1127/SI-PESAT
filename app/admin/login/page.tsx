"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lock, Mail, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("Email atau password admin salah.");
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_30%),linear-gradient(to_bottom,#f8fafc,#eef2ff)] px-6 py-8">
      <section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
          SI PESAT Admin
        </p>

        <h1 className="mt-2 text-3xl font-extrabold text-gray-950">
          Login Admin
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Masuk untuk mengelola data UMKM, memperbarui informasi, dan mengatur
          status aktif data.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Email Admin
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan Email admin"
                autoComplete="off"
                className="w-full rounded-2xl border bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                autoComplete="new-password"
                className="w-full rounded-2xl border bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold !text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk Admin"}
          </button>
        </form>
      </section>
    </main>
  );
}