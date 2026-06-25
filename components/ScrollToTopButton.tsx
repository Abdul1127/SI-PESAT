"use client";

import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
      aria-label="Kembali ke atas"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}