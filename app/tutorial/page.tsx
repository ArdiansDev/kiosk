"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import bgImage from "../assets/bg.png";
import bgDasar from "../assets/bg-dasar.png";
import chevronLeft from "../assets/chevron-left.svg";
import chevronRight from "../assets/chevron-right.svg";
import plnIcon from "../assets/pln-icon.png";
import plnMobileIcon from "../assets/pln-mobile-icon.png";
import { useState } from "react";

const tutorialServices = [
  { title: "LAPOR GANGGUAN JARINGAN DAN APP DISTRIBUSI PLN", pageCount: 5 },
  { title: "LAPOR KELUHAN JARINGAN DAN APP DISTRIBUSI PLN", pageCount: 4 },
  { title: "LAPOR KELUHAN TAGIHAN LISTRIK/TOKEN LISTRIK", pageCount: 3 },
  {
    title: "MENCARI INFORMASI LAYANAN DAN PROMO PB, PD DAN PESTA",
    pageCount: 2,
  },
  { title: "LAYANAN EV CHARGING SPKLU", pageCount: 1 },
];

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

export default function TutorialPage() {
  const [selectedStep, setSelectedStep] = useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseStep(searchParams);
  const safeStep = Math.min(Math.max(step, 0), tutorialServices.length - 1);
  const selectedService = tutorialServices[safeStep];
  const handleBack = () => {
    if (selectedStep > 1) {
      setSelectedStep(selectedStep - 1);
    } else {
      router.push("/pilih-layanan");
    }
  };
  const handleNext = () => {
    if (selectedStep < selectedService.pageCount) {
      setSelectedStep(selectedStep + 1);
    } else {
      router.push("/pilih-layanan");
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
        <span className="inline-flex rounded-full bg-[#2aaecf] px-6 py-2 text-[34px] font-bold tracking-wide text-white shadow-[0_6px_16px_rgba(0,90,130,0.25)] md:text-[22px]">
          TUTORIAL
        </span>

        <h1 className="mt-4 text-[53px] font-black leading-none tracking-tight text-[#11617b] md:text-[38px]">
          PLN <span className="text-[#2aaecf]">MOBILE</span>
        </h1>

        <h2 className="mt-3 max-w-140 text-[42px] font-black uppercase leading-tight tracking-tight text-[#0f5870] md:text-[31px]">
          {selectedService.title}
        </h2>

        <p className="mt-4 max-w-130 text-[22px] leading-snug text-[#4e7484] md:text-[16px]">
          Ikuti langkah mudah berikut untuk melaporkan gangguan jaringan melalui
          PLN Mobile.
        </p>
        <Image
          src={`/tutorial/${step}_${selectedStep}.png`}
          alt={`Tutorial Step ${selectedStep}`}
          width={600}
          height={400}
          className="mt-6 rounded-lg border-4 border-[#2aaecf] shadow-lg"
          priority
        />
      </main>

      <div className="absolute bottom-8 left-4 right-4 mx-auto flex max-w-170 gap-4">
        <button
          type="button"
          onClick={() => handleBack()}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-[#24a9d0] bg-[#f6f9fb] py-5 text-xl font-bold tracking-wide text-[#125D72] shadow-[0_8px_20px_rgba(17,74,108,0.18)] transition-transform active:scale-95 md:py-4 md:text-lg"
        >
          <Image src={chevronLeft} alt="Kembali" width={13} height={13} />
          KEMBALI
        </button>

        <button
          type="button"
          onClick={() => {
            handleNext();
          }}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#1a6e8e] to-[#2aaecf] py-5 text-xl font-bold tracking-wide text-white shadow-[0_8px_20px_rgba(10,93,126,0.35)] transition-transform active:scale-95 md:py-4 md:text-lg"
        >
          LANJUT
          <Image src={chevronRight} alt="Lanjut" width={13} height={13} />
        </button>
      </div>
    </div>
  );
}
