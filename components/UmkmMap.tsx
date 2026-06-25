"use client";

import dynamic from "next/dynamic";

const UmkmMapInner = dynamic(() => import("./UmkmMapInner"), {
  ssr: false,
});

export default function UmkmMap({ umkm }: { umkm: any[] }) {
  return <UmkmMapInner umkm={umkm} />;
}