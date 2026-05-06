"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import bgDasar from "../assets/bg-dasar.png";
import plnIcon from "../assets/pln-icon.png";
import plnMobileIcon from "../assets/pln-mobile-icon.png";

type BadgeType = "PLN MOBILE" | "INFO ONLINE" | "BACK OFFICE";

const badgeStyle: Record<BadgeType, string> = {
  "PLN MOBILE": "bg-[#22B0D8] text-white",
  "INFO ONLINE": "bg-[#22B0D833] text-[#125D72]",
  "BACK OFFICE": "bg-[#EFE62F] text-gray-800",
};

const fallbackService = {
  title: "PENYELESAIAN P2TL",
  badge: "BACK OFFICE" as BadgeType,
};

type FormState = {
  nama: string;
  whatsapp: string;
  ktp: string;
  pelangganId: string;
  alamat: string;
  detail: string;
};

export default function IsiDataPelanggan() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>({
    nama: "",
    whatsapp: "",
    ktp: "",
    pelangganId: "",
    alamat: "",
    detail: "",
  });

  const title = searchParams.get("title") || fallbackService.title;
  const badge =
    (searchParams.get("badge") as BadgeType | null) || fallbackService.badge;

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleContinue = () => {
    const params = new URLSearchParams({
      title,
      badge,
      nama: form.nama,
      whatsapp: form.whatsapp,
      keluhan: form.detail || title,
      requestId: crypto.randomUUID(),
    });

    router.push(`/cetak-tiket?${params.toString()}`);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden font-sans">
      <Image
        src={bgDasar}
        alt="Background"
        fill
        className="-z-10 object-cover object-center"
        priority
      />

      <header className="absolute top-0 left-0 right-0 flex w-full items-center justify-between px-8 pt-8">
        <Image src={plnIcon} alt="PLN" width={72} height={72} priority />
        <Image
          src={plnMobileIcon}
          alt="PLN Mobile"
          width={72}
          height={72}
          priority
        />
      </header>

      <div className="mt-16 w-full px-4 pb-28">
        <div className="text-center">
          <h1 className="text-[31px] font-black leading-none tracking-tight text-[#125D72]">
            ISI DATA PELANGGAN
          </h1>
          <p className="mt-1 text-[13px] text-[#5f666d]">
            Lengkapi data berikut untuk melanjutkan layanan
          </p>
        </div>

        <div className="mt-3 text-[12px] text-[#6a7076]">
          Layanan yang dipilih:
        </div>

        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#d9e1e7] bg-white px-3 py-3 shadow-[0_8px_24px_rgba(17,74,108,0.08)]">
          <div className="h-10 w-10 shrink-0 rounded-sm bg-[#d9d9d9]" />
          <div className="min-w-0 flex-1">
            <span
              className={`inline-flex rounded-[3px] px-2 py-1 text-[9px] font-bold leading-none ${badgeStyle[badge]}`}
            >
              {badge}
            </span>
            <p className="mt-1 text-[11px] font-semibold uppercase leading-tight text-[#22B0D8]">
              {title}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-3xl leading-none text-black"
            aria-label="Kembali ke pilih layanan"
          >
            ×
          </button>
        </div>

        <div className="mt-3 rounded-2xl border border-[#d9e1e7] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(17,74,108,0.08)]">
          <div className="space-y-5">
            <div className="grid grid-cols-[140px_1fr] items-start gap-x-4 gap-y-2">
              <label className="pt-3 text-[12px] font-medium text-[#161616]">
                Nama
              </label>
              <input
                type="text"
                value={form.nama}
                onChange={(event) => updateField("nama", event.target.value)}
                className="h-12 w-full rounded-sm border border-[#c6d0d8] bg-white px-4 text-base text-[#1b1b1b] outline-none"
              />
            </div>

            <div className="grid grid-cols-[140px_1fr] items-start gap-x-4 gap-y-2">
              <label className="pt-3 text-[12px] font-medium text-[#161616]">
                No WhatsApp
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(event) =>
                  updateField("whatsapp", event.target.value)
                }
                className="h-12 w-full rounded-sm border border-[#c6d0d8] bg-white px-4 text-base text-[#1b1b1b] outline-none"
              />
            </div>

            <div className="grid grid-cols-[140px_1fr] items-start gap-x-4 gap-y-2">
              <label className="pt-3 text-[12px] font-medium text-[#161616]">
                No KTP
              </label>
              <input
                type="text"
                value={form.ktp}
                onChange={(event) => updateField("ktp", event.target.value)}
                className="h-12 w-full rounded-sm border border-[#c6d0d8] bg-white px-4 text-base text-[#1b1b1b] outline-none"
              />
            </div>

            <div className="grid grid-cols-[140px_1fr] items-start gap-x-4 gap-y-2">
              <label className="pt-3 text-[12px] font-medium text-[#161616]">
                ID Pelanggan
              </label>
              <input
                type="text"
                value={form.pelangganId}
                onChange={(event) =>
                  updateField("pelangganId", event.target.value)
                }
                className="h-12 w-full rounded-sm border border-[#c6d0d8] bg-white px-4 text-base text-[#1b1b1b] outline-none"
              />
            </div>

            <div className="grid grid-cols-[140px_1fr] items-start gap-x-4 gap-y-2">
              <label className="pt-3 text-[12px] font-medium text-[#161616]">
                Alamat Rumah
              </label>
              <textarea
                value={form.alamat}
                onChange={(event) => updateField("alamat", event.target.value)}
                className="min-h-24 w-full resize-none rounded-sm border border-[#c6d0d8] bg-white px-4 py-3 text-base text-[#1b1b1b] outline-none"
              />
            </div>

            <div className="grid grid-cols-[140px_1fr] items-start gap-x-4 gap-y-2">
              <label className="pt-3 text-[12px] font-medium text-[#161616]">
                Detail kebutuhan pelanggan sesuai layanan yang dipilih
              </label>
              <textarea
                value={form.detail}
                onChange={(event) => updateField("detail", event.target.value)}
                className="min-h-24 w-full resize-none rounded-sm border border-[#c6d0d8] bg-white px-4 py-3 text-base text-[#1b1b1b] outline-none"
              />
            </div>
          </div>
          <div className="h-28" />
        </div>
      </div>

      <div className="absolute right-4 bottom-6 left-4 flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 cursor-pointer rounded-2xl border border-gray-200 bg-white py-5 text-base font-bold tracking-widest text-[#125D72] shadow-md transition-transform active:scale-95"
        >
          <span className="mr-2 text-lg">‹</span>KEMBALI
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 cursor-pointer rounded-2xl bg-linear-to-r from-[#1a6e8e] to-[#2aaecf] py-5 text-base font-bold tracking-widest text-white shadow-md transition-transform active:scale-95"
        >
          LANJUT <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
