"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import bgDasar from "../assets/bg-dasar.png";
import plnIcon from "../assets/pln-icon.png";
import plnMobileIcon from "../assets/pln-mobile-icon.png";
import chevronLeft from "./../assets/chevron-left.svg";
import chevronRight from "./../assets/chevron-right.svg";
import { IconLayanan, IconLayananNumber } from "./_components/icon-layanan";

type BadgeType = "PLN MOBILE" | "INFO ONLINE" | "BACK OFFICE";

const services: { title: string; badge: BadgeType }[] = [
  {
    title: "LAPOR GANGGUAN JARINGAN DAN APP DISTRIBUSI PLN",
    badge: "PLN MOBILE",
  },
  {
    title: "LAPOR KELUHAN JARINGAN DAN APP DISTRIBUSI PLN",
    badge: "PLN MOBILE",
  },
  { title: "LAPOR KELUHAN TAGIHAN LISTRIK/TOKEN LISTRIK", badge: "PLN MOBILE" },
  {
    title: "MENCARI INFORMASI LAYANAN DAN PROMO PB, PD DAN PESTA",
    badge: "PLN MOBILE",
  },
  { title: "LAYANAN EV CHARGING SPKLU", badge: "PLN MOBILE" },
  { title: "LAPOR INFORMASI LAYANAN GANTI NAMA", badge: "INFO ONLINE" },
  { title: "LAPOR KELUHAN LAYANAN RESTITUSI BP", badge: "INFO ONLINE" },
  { title: "LAPOR INFORMASI SUBSIDI LISTRIK", badge: "INFO ONLINE" },
  {
    title: "MENCARI INFORMASI PERHITUNGAN TOKEN DAN TAGIHAN LISTRIK",
    badge: "INFO ONLINE",
  },
  { title: "MENCARI INFORMASI RESTITUSI UJL", badge: "INFO ONLINE" },
  {
    title: "INFORMASI PENGGESERAN METER, TIANG DAN GARDU",
    badge: "INFO ONLINE",
  },
  {
    title: "INFORMASI TERKAIT INSTALASI SISI PELANGGAN",
    badge: "INFO ONLINE",
  },
  { title: "PERMOHONAN INFORMASI CSR DAN PJU", badge: "INFO ONLINE" },
  {
    title:
      "PERMOHONAN INFO PEMADAMAN DAN PENGAJUAN PRIORITAS TIDAK ADA PEMADAMAN",
    badge: "INFO ONLINE",
  },
  {
    title: "INFO TERKAIT K2 DAN K3 KETENAGALISTRIKAN",
    badge: "INFO ONLINE",
  },
  { title: "PENYELESAIAN P2TL", badge: "BACK OFFICE" },
  { title: "PENYELESAIAN PRR", badge: "BACK OFFICE" },
  { title: "PENYELESAIAN TUSBUNG", badge: "BACK OFFICE" },
];

const badgeStyle: Record<BadgeType, string> = {
  "PLN MOBILE": "bg-[#22B0D8] text-white",
  "INFO ONLINE": "bg-[#22B0D833] text-[#125D72]",
  "BACK OFFICE": "bg-[#EFE62F] text-gray-800",
};

export default function PilihLayanan() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(10);

  const selectedService = services[selectedIndex];

  const handleContinue = () => {
    const params = new URLSearchParams({
      title: selectedService.title,
      badge: selectedService.badge,
    });
    if (selectedIndex < 5) {
      router.push(`/tutorial?${selectedIndex.toString()}`);
    } else {
      router.push(`/isi-data-pelanggan?${params.toString()}`);
    }
  };

  return (
    <div className="relative flex flex-col flex-1 items-center justify-start min-h-screen overflow-hidden font-sans">
      {/* Background */}
      <Image
        src={bgDasar}
        alt="Background"
        fill
        className="object-cover object-center -z-10"
        priority
      />

      {/* Top bar */}
      <header className="flex w-full items-center justify-between px-8 pt-8 shrink-0 absolute top-0 left-0 right-0">
        <Image src={plnIcon} alt="PLN" width={72} height={72} priority />
        <Image
          src={plnMobileIcon}
          alt="PLN Mobile"
          width={72}
          height={72}
          priority
        />
      </header>

      {/* Title */}
      <div className="text-center mt-15 px-8 shrink-0">
        <h1 className="text-[30px] font-black leading-none tracking-tight text-[#1a4f6e]">
          PILIH LAYANAN
        </h1>
        <h2 className="text-[18px] font-black leading-none tracking-tight text-[#2aaecf] mt-1">
          SELF SERVICE PLN
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Silakan pilih layanan yang anda butuhkan
        </p>
      </div>

      {/* Scrollable grid */}
      <div className="flex-1 overflow-y-auto w-full px-4 mt-4 pb-28">
        <div className="grid grid-cols-3 gap-3">
          {services.map((service, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`flex h-31 w-39.5 cursor-pointer flex-col rounded-2xl border bg-white px-2.5 py-3 text-left shadow-[0_8px_24px_rgba(17,74,108,0.08)] transition-transform active:scale-95 ${
                selectedIndex === i
                  ? "border-[#22B0D8] ring-2 ring-[#22B0D8]/20"
                  : "border-[#d9e1e7]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex justify-between items-start">
                  <span
                    className={`mt-0.5 shrink-0 rounded-[3px]  w-3.5 h-3.5 flex justify-center items-center text-[6px] font-bold leading-none bg-[#22B0D8] text-white`}
                  >
                    {i + 1}
                  </span>
                  <IconLayanan
                    number={i as IconLayananNumber}
                    width={36}
                    height={36}
                  />
                </div>
                <span
                  className={`mt-0.5 shrink-0 rounded-[3px] px-2 py-1 text-[6px] font-bold leading-none ${badgeStyle[service.badge]}`}
                >
                  {service.badge}
                </span>
              </div>

              <p className="mt-1 text-[8px]  ml-4 font-semibold uppercase leading-[1.45] text-[#5f666d]">
                {service.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="absolute bottom-6 left-4 right-4 flex gap-3">
        <button
          onClick={() => router.push("/buku-tamu")}
          className="flex-1 flex items-center justify-center gap-2 bg-white py-5 text-base font-bold tracking-widest text-gray-800 shadow-md active:scale-95 transition-transform cursor-pointer rounded-2xl border border-gray-200"
        >
          <Image src={chevronLeft} alt="Chevleft" width={13} height={13} />
          <p className="text-xl">KEMBALI</p>
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-[#1a6e8e] to-[#2aaecf] py-5 text-base font-bold tracking-widest text-white shadow-md active:scale-95 transition-transform cursor-pointer rounded-2xl"
        >
          <p className="text-xl">LANJUT</p>
          <Image
            src={chevronRight}
            alt="Chevron Right"
            width={13}
            height={13}
          />
        </button>
      </div>
    </div>
  );
}
