"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import bgImage from "../assets/bg.png";
import bgDasar from "../assets/bg-dasar.png";
import chevronLeft from "../assets/chevron-left.svg";
import chevronRight from "../assets/chevron-right.svg";
import plnIcon from "../assets/pln-icon.png";
import plnMobileIcon from "../assets/pln-mobile-icon.png";
import { useState } from "react";
import { tutorialServices } from "./_data/dataTutorial";

const parseStep = (searchParams: URLSearchParams) => {
  const fromNamedParam = Number.parseInt(searchParams.get("step") ?? "", 10);
  if (Number.isInteger(fromNamedParam)) {
    return fromNamedParam;
  }

  const firstKey = Array.from(searchParams.keys())[0];
  const fromBareQuery = Number.parseInt(firstKey ?? "", 10);
  if (Number.isInteger(fromBareQuery)) {
    return fromBareQuery;
  }

  return 0;
};

function TutorialContent() {
  const [selectedStep, setSelectedStep] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseStep(searchParams);
  const safeStep = Math.min(Math.max(step, 0), tutorialServices.length - 1);
  const selectedService = tutorialServices[safeStep];

  const nama = searchParams.get("nama") ?? "";
  const whatsapp = searchParams.get("whatsapp") ?? "";
  const serviceTitle = searchParams.get("title") ?? selectedService.title ?? "";
  const badge = searchParams.get("badge") ?? "PLN MOBILE";

  const buildContactQuery = () => {
    const params = new URLSearchParams();
    if (nama) params.set("nama", nama);
    if (whatsapp) params.set("whatsapp", whatsapp);
    return params.toString();
  };

  const handleBack = () => {
    if (selectedStep > 1) {
      setSelectedStep(selectedStep - 1);
    } else {
      const query = buildContactQuery();
      router.push(query ? `/pilih-layanan?${query}` : "/pilih-layanan");
    }
  };

  const finishTutorial = async () => {
    if (isFinishing) {
      return;
    }
    setIsFinishing(true);

    let ticketQuery = "";

    try {
      // Rekam kunjungan layanan PLN Mobile agar muncul di admin panel.
      if (nama.trim() && whatsapp.trim() && serviceTitle.trim()) {
        const response = await fetch("/api/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceTitle,
            badge,
            name: nama,
            whatsapp,
            detail: serviceTitle,
          }),
        });

        const payload = (await response.json()) as {
          entry?: { ticketNumber: string };
        };

        if (response.ok && payload.entry?.ticketNumber) {
          ticketQuery = `?ticketNumber=${encodeURIComponent(payload.entry.ticketNumber)}`;
        }
      }
    } catch (error) {
      console.error("Gagal menyimpan data antrean tutorial", error);
    } finally {
      router.push(`/feedback${ticketQuery}`);
    }
  };

  const handleNext = () => {
    if (selectedStep < selectedService.children.length) {
      setSelectedStep(selectedStep + 1);
    } else {
      void finishTutorial();
    }
  };
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden font-sans">
      <Image
        src={bgImage}
        alt="Background"
        fill
        className="-z-20 object-cover object-center"
        priority
      />
      <Image
        src={bgDasar}
        alt="Background Dasar"
        fill
        className="-z-10 object-cover object-center opacity-95"
        priority
      />

      <header className="absolute top-0 right-0 left-0 flex items-center justify-between px-8 pt-8">
        <Image src={plnIcon} alt="PLN" width={72} height={72} priority />
        <Image
          src={plnMobileIcon}
          alt="PLN Mobile"
          width={72}
          height={72}
          priority
        />
      </header>

      <main className="mx-auto flex w-full max-w-170 flex-1 flex-col items-center px-6 pb-36 pt-24 text-center">
        <span className="inline-flex rounded-full bg-[#2aaecf] px-6 py-2 text-[42px] font-bold tracking-wide text-white shadow-[0_6px_16px_rgba(0,90,130,0.25)] md:text-[22px]">
          TUTORIAL
        </span>

        <h1 className="mt-4 text-[60px] font-black leading-none tracking-tight text-[#11617b] md:text-[60px]">
          PLN <span className="text-[#2aaecf]">MOBILE</span>
        </h1>

        <h2 className="mt-3 max-w-140 text-[32px] font-semibold uppercase leading-tight tracking-tight text-[#0f5870] md:text-[31px]">
          {selectedService.title}
        </h2>

        <p className="mt-4 max-w-130 text-[22px] leading-snug text-[#4e7484] md:text-[16px]">
          Ikuti langkah mudah berikut untuk melaporkan gangguan jaringan melalui
          PLN Mobile.
        </p>
        <div className="flex gap-1.25 mt-10 rounded-2xl border text-left border-[#d9e1e7] bg-white px-7 w-[880px] py-6 shadow-[0_8px_24px_rgba(17,74,108,0.08)]">
          <span
            className={`mt-0.5 shrink-0 rounded-[3px]  w-11 h-10 flex justify-center items-center text-[20px] font-bold leading-none bg-[#22B0D8] text-white`}
          >
            {selectedStep}
          </span>
          <div>
            <p className="text-[24px] text-[#125D72] font-semibold">
              {selectedService.children?.[selectedStep - 1]?.title}
            </p>
            <p className="mt-2 text-[22px] text-[#125D72CC]">
              {selectedService.children?.[selectedStep - 1]?.description}
            </p>
            {selectedService.children?.[selectedStep - 1]?.children && (
              <ul className="mt-2 text-[22px] text-[#6a7076]">
                {selectedService?.children?.[selectedStep - 1]?.children.map(
                  (child, index) => (
                    <li key={index} className="list-disc list-inside">
                      {child}
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        </div>
        <Image
          src={`/tutorial/${step < 6 ? 1 : step + 1}/${selectedStep}.png`}
          alt={`Tutorial Step ${selectedStep}`}
          width={450}
          height={901}
          className="mt-6 rounded-lg border-4 border-[#2aaecf] shadow-lg"
          priority
        />
      </main>
      <div className="absolute bottom-24 left-4 right-4 flex gap-3">
        <button
          onClick={() => handleBack()}
          className="flex-1 flex items-center justify-center gap-2 h-25.5 bg-white py-5 text-base font-bold tracking-widest text-gray-800 shadow-md active:scale-95 transition-transform cursor-pointer rounded-2xl border border-gray-200"
        >
          <Image src={chevronLeft} alt="Chevleft" width={13} height={13} />
          <p className="text-[32px]">KEMBALI</p>
        </button>
        <button
          onClick={() => handleNext()}
          disabled={isFinishing}
          className="flex-1 flex items-center text-[32px] justify-center gap-2 h-25.5 bg-linear-to-r from-[#1a6e8e] to-[#2aaecf] py-5 text-base font-bold tracking-widest text-white shadow-md active:scale-95 transition-transform cursor-pointer rounded-2xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          <p className="text-[32px]">{isFinishing ? "MENYIMPAN..." : "LANJUT"}</p>
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

export default function TutorialPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TutorialContent />
    </Suspense>
  );
}
