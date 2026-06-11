"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import bgDasar from "../assets/bg-dasar.png";
import plnIcon from "../assets/pln-icon.png";
import plnMobileIcon from "../assets/pln-mobile-icon.png";

type BadgeType = "PLN MOBILE" | "INFO ONLINE" | "BACK OFFICE";

const badgeLabel: Record<BadgeType, string> = {
  "PLN MOBILE": "LAYANAN PLN MOBILE",
  "INFO ONLINE": "LAYANAN INFO ONLINE",
  "BACK OFFICE": "LAYANAN BACK OFFICE",
};

const badgeStyle: Record<BadgeType, string> = {
  "PLN MOBILE": "bg-[#22B0D8] text-white",
  "INFO ONLINE": "bg-[#22B0D833] text-[#125D72]",
  "BACK OFFICE": "bg-[#EFE62F] text-[#125D72]",
};

const fallbackBadge: BadgeType = "BACK OFFICE";

type CetakTiketPageProps = {
  searchParams: Promise<{
    ticketNumber?: string | string[];
    nama?: string | string[];
    whatsapp?: string | string[];
    keluhan?: string | string[];
    badge?: string | string[];
    dateText?: string | string[];
    timeText?: string | string[];
  }>;
};

const readParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const printIcon = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 8V4h10v4" />
    <rect x="5" y="8" width="14" height="8" rx="2" />
    <path d="M7 16h10v4H7z" />
  </svg>
);

const checkIcon = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-12 w-12"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const closeIcon = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export default function CetakTiket({ searchParams }: CetakTiketPageProps) {
  const router = useRouter();
  const resolvedSearchParams = use(searchParams);
  const [showSuccess, setShowSuccess] = useState(false);

  const ticketNumber = readParam(resolvedSearchParams.ticketNumber) || "A-100";
  const nama = readParam(resolvedSearchParams.nama) || "Adipati Galih";
  const whatsapp = readParam(resolvedSearchParams.whatsapp) || "0812 3456 7890";
  const keluhan =
    readParam(resolvedSearchParams.keluhan) || "Penyelesaian P2TL";
  const badge =
    (readParam(resolvedSearchParams.badge) as BadgeType | undefined) ||
    fallbackBadge;
  const dateText =
    readParam(resolvedSearchParams.dateText) || "Kamis, 30 April 2026";
  const timeText = readParam(resolvedSearchParams.timeText) || "14.25";

  const handlePrint = () => {
    const params = new URLSearchParams({
      ticketNumber,
      nama,
      whatsapp,
      keluhan,
      badge,
      dateText,
      timeText,
    });
    const printWindow = window.open(
      `/thermal-print?${params.toString()}`,
      "thermal-print",
      "popup=no,width=420,height=760",
    );

    if (!printWindow) {
      window.location.href = `/thermal-print?${params.toString()}`;
    }

    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    router.push(`/feedback?ticketNumber=${encodeURIComponent(ticketNumber)}`);
  };

  return (
    <div className="ticket-print-shell relative flex min-h-screen flex-col items-center justify-start overflow-hidden font-sans">
      <Image
        src={bgDasar}
        alt="Background"
        fill
        className="ticket-print-hide -z-10 object-cover object-center"
        priority
      />

      <header className="ticket-print-hide absolute top-0 left-0 right-0 flex w-full items-center justify-between px-8 pt-8">
        <Image src={plnIcon} alt="PLN" width={72} height={72} priority />
        <Image
          src={plnMobileIcon}
          alt="PLN Mobile"
          width={72}
          height={72}
          priority
        />
      </header>

      <div className="ticket-print-content mt-18 w-full px-4 pb-28 text-center">
        <h1 className="ticket-print-hide text-[58px] font-black leading-none tracking-tight text-[#125D72]">
          CETAK TIKET
        </h1>
        <p className="ticket-print-hide mt-2 text-[14px] text-[#377491]">
          Silakan cetak tiket, nomor Anda akan segera dipanggil
        </p>

        <div className="ticket-print-card mt-10 rounded-2xl border border-[#d9e1e7] bg-white px-7 py-6 shadow-[0_8px_24px_rgba(17,74,108,0.08)]">
          <p className="text-[15px] font-medium text-[#6c6c6c]">
            Nomor Tiket Antrian Anda
          </p>

          <div className="mt-3 text-[84px] font-black leading-none tracking-tight text-[#125D72]">
            {ticketNumber}
          </div>

          <div className="mt-4 border-t border-dashed border-[#d9d9d9]" />

          <div className="mx-auto mt-6 grid max-w-53.75 grid-cols-[78px_1fr] gap-x-5 gap-y-1 text-left text-[12px] leading-relaxed text-[#222]">
            <div className="text-[#6c6c6c]">Nama</div>
            <div>{nama}</div>
            <div className="text-[#6c6c6c]">Keluhan</div>
            <div>{keluhan}</div>
            <div className="text-[#6c6c6c]">No.Hp</div>
            <div>{whatsapp}</div>
          </div>

          <div className="mt-5 flex justify-center">
            <span
              className={`inline-flex rounded-[3px] px-3 py-1.5 text-[11px] font-bold ${badgeStyle[badge]}`}
            >
              {badgeLabel[badge]}
            </span>
          </div>

          <div className="mt-5 border-t border-dashed border-[#d9d9d9]" />

          <div className="mt-5 text-[13px] text-[#6c6c6c]">
            <div>{dateText}</div>
            <div className="mt-1">{timeText}</div>
          </div>
        </div>
      </div>

      <div className="ticket-print-hide absolute right-4 bottom-6 left-4 flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/pilih-layanan")}
          className="flex-1 cursor-pointer rounded-2xl border border-gray-200 bg-white py-5 text-base font-bold tracking-wide text-[#125D72] shadow-md transition-transform active:scale-95"
        >
          KELUHAN LAIN?
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-[#1a6e8e] to-[#2aaecf] py-5 text-base font-bold tracking-wide text-white shadow-md transition-transform active:scale-95"
        >
          {printIcon}
          CETAK TIKET
        </button>
      </div>

      {showSuccess && (
        <div
          className="ticket-print-hide fixed inset-0 z-50 flex items-center justify-center bg-[#0c4459]/40 px-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white px-8 py-10 text-center shadow-[0_24px_60px_rgba(12,68,89,0.25)]">
            <button
              type="button"
              onClick={handleCloseSuccess}
              aria-label="Tutup"
              className="absolute right-5 top-5 cursor-pointer text-[#3a3a3a] transition-transform active:scale-90"
            >
              {closeIcon}
            </button>

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#22B0D8] text-white">
              {checkIcon}
            </div>

            <h2
              id="success-title"
              className="mt-6 text-[26px] font-black tracking-tight text-[#125D72]"
            >
              Tiket berhasil dicetak!
            </h2>

            <p className="mx-auto mt-3 max-w-xs text-[14px] leading-relaxed text-[#6c6c6c]">
              Silakan menunggu di ruang tunggu hingga nomor tiket antrian Anda
              dipanggil untuk bertemu dengan{" "}
              <span className="font-bold text-[#125D72]">
                Tim Back Office PLN
              </span>
              .
            </p>

            <button
              type="button"
              onClick={handleCloseSuccess}
              className="mt-8 w-full cursor-pointer rounded-2xl bg-linear-to-r from-[#1a6e8e] to-[#2aaecf] py-4 text-base font-bold tracking-wide text-white shadow-md transition-transform active:scale-95"
            >
              OKE, MENGERTI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
