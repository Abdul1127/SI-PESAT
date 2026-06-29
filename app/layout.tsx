import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "SI PESAT",
  description:
    "SI PESAT adalah Sistem Informasi Pendataan dan Promosi UMKM untuk membantu masyarakat menemukan UMKM lokal dengan lebih mudah.",
  applicationName: "SI PESAT",
  keywords: [
    "SI PESAT",
    "UMKM",
    "Direktori UMKM",
    "Kelurahan",
    "Promosi UMKM",
    "Pendataan UMKM",
  ],
  authors: [{ name: "Tim KKN SI PESAT" }],
  creator: "Tim KKN SI PESAT",
  publisher: "Tim KKN SI PESAT",
  icons: {
    icon: "/logo-sipesat.png",
    shortcut: "/logo-sipesat.png",
    apple: "/logo-sipesat.png",
  },
  openGraph: {
    title: "SI PESAT",
    description:
      "Sistem Informasi Pendataan dan Promosi UMKM untuk membantu masyarakat menemukan UMKM lokal.",
    url: "https://si-pesat-theta.vercel.app",
    siteName: "SI PESAT",
    images: [
      {
        url: "/logo-sipesat.png",
        width: 512,
        height: 512,
        alt: "Logo SI PESAT",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SI PESAT",
    description:
      "Sistem Informasi Pendataan dan Promosi UMKM untuk membantu masyarakat menemukan UMKM lokal.",
    images: ["/logo-sipesat.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}