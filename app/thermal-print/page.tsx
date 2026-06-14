"use client";

import { use, useEffect } from "react";

type BadgeType = "PLN MOBILE" | "INFO ONLINE" | "BACK OFFICE";

const badgeLabel: Record<BadgeType, string> = {
  "PLN MOBILE": "LAYANAN PLN MOBILE",
  "INFO ONLINE": "LAYANAN INFO ONLINE",
  "BACK OFFICE": "LAYANAN BACK OFFICE",
};

type ThermalPrintPageProps = {
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

export default function ThermalPrintPage({
  searchParams,
}: ThermalPrintPageProps) {
  const resolvedSearchParams = use(searchParams);

  const ticketNumber = readParam(resolvedSearchParams.ticketNumber) || "A-100";
  const nama = readParam(resolvedSearchParams.nama) || "Adipati Galih";
  const whatsapp = readParam(resolvedSearchParams.whatsapp) || "0812 3456 7890";
  const keluhan =
    readParam(resolvedSearchParams.keluhan) || "Penyelesaian P2TL";
  const badge =
    (readParam(resolvedSearchParams.badge) as BadgeType | null) ||
    "BACK OFFICE";
  const dateText =
    readParam(resolvedSearchParams.dateText) || "Kamis, 30 April 2026";
  const timeText = readParam(resolvedSearchParams.timeText) || "14.25";

  useEffect(() => {
    // const isElectron = window.navigator.userAgent.includes("Electron");

    // if (isElectron) {
    //   // In Electron the print is triggered from cetak-tiket via the
    //   // preload-exposed kioskPrinter API (silent print to the configured
    //   // thermal printer). This page is only rendered in a hidden window
    //   // that the main process prints, so nothing to do here.
    //   return;
    // }

    const printTimer = window.setTimeout(() => {
      window.print();
    }, 250);

    const handleAfterPrint = () => {
      window.close();
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.clearTimeout(printTimer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  return (
    <main className="min-h-screen bg-white px-0 py-2 text-black">
      <div className="mx-auto" style={{ width: "54mm" }}>
        <section className="border border-dashed border-black px-2 py-3 text-center">
          <div className="my-4 border-t border-dashed border-black" />

          <p className="text-[11px] uppercase tracking-[0.18em]">
            Nomor Antrian
          </p>
          <div className="mt-2 text-6xl font-black leading-none">
            {ticketNumber}
          </div>

          <div className="my-4 border-t border-dashed border-black" />

          <div className="space-y-2 text-left text-[11px] leading-relaxed">
            <div className="flex justify-between">
              <div className="font-semibold">Nama</div>
              <div>{nama}</div>
            </div>
            <div className="flex justify-between">
              <div className="font-semibold">Keluhan</div>
              <div>{keluhan}</div>
            </div>
            <div className="flex justify-between">
              <div className="font-semibold">No. HP</div>
              <div>{whatsapp}</div>
            </div>
            <div className="flex justify-center badge-label">
              <div>{badgeLabel[badge]}</div>
            </div>
          </div>

          <div className="my-4 border-t border-dashed border-black" />

          <div className="text-[11px] leading-relaxed">
            <div>{dateText}</div>
            <div>{timeText}</div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @page {
          size: 80mm auto;
          margin: 0;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #fff;
        }

        @media print {
          .screen-only {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
