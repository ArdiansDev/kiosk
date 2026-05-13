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
    <main className="min-h-screen bg-white px-3 py-4 text-black">
      <div className="mx-auto" style={{ width: "72mm" }}>
        <div className="screen-only mb-4 rounded border border-neutral-300 bg-neutral-50 p-3 text-center text-xs text-neutral-700">
          Halaman ini dibuat untuk printer thermal 80mm dan akan mencetak
          otomatis.
        </div>

        <section className="border border-dashed border-black px-3 py-4 text-center">
          <p className="text-xs font-semibold tracking-[0.2em]">
            PLN SELF SERVICE
          </p>
          <p className="mt-1 text-[10px]">TIKET ANTRIAN PELANGGAN</p>

          <div className="my-4 border-t border-dashed border-black" />

          <p className="text-[11px] uppercase tracking-[0.18em]">
            Nomor Antrian
          </p>
          <div className="mt-2 text-6xl font-black leading-none">
            {ticketNumber}
          </div>

          <div className="my-4 border-t border-dashed border-black" />

          <div className="space-y-2 text-left text-[11px] leading-relaxed">
            <div>
              <div className="font-semibold">Nama</div>
              <div>{nama}</div>
            </div>
            <div>
              <div className="font-semibold">Keluhan</div>
              <div>{keluhan}</div>
            </div>
            <div>
              <div className="font-semibold">No. HP</div>
              <div>{whatsapp}</div>
            </div>
            <div>
              <div className="font-semibold">Kategori</div>
              <div>{badgeLabel[badge]}</div>
            </div>
          </div>

          <div className="my-4 border-t border-dashed border-black" />

          <div className="text-[11px] leading-relaxed">
            <div>{dateText}</div>
            <div>{timeText}</div>
          </div>

          <div className="my-4 border-t border-dashed border-black" />

          <p className="text-[10px] leading-relaxed">
            Simpan tiket ini.
            <br />
            Nomor Anda akan segera dipanggil.
          </p>
        </section>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 4mm;
          }

          html,
          body {
            background: #fff;
          }

          .screen-only {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
