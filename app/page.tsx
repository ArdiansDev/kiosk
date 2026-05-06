"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import bgImage from "./assets/bg.png";
import bgDasar from "./assets/bg-dasar.png";
import plnIcon from "./assets/pln-icon.png";
import plnMobileIcon from "./assets/pln-mobile-icon.png";
import touchIcon from "./assets/touch-icon.svg";

export default function Home() {
  const router = useRouter();
  return (
    <div className="relative flex flex-col flex-1 items-center justify-start min-h-screen overflow-hidden font-sans">
      {/* Background */}
      <Image
        src={bgImage}
        alt="Background"
        fill
        className="object-cover object-center -z-10"
        priority
      />
      <Image
        src={bgDasar}
        alt="Background Dasar"
        fill
        className="object-cover object-center -z-20"
        priority
      />

      {/* Top bar: PLN logo left, PLN Mobile right */}
      <header className="flex w-full items-center justify-between px-8 pt-8">
        <Image src={plnIcon} alt="PLN" width={72} height={72} priority />
        <Image
          src={plnMobileIcon}
          alt="PLN Mobile"
          width={72}
          height={72}
          priority
        />
      </header>

      {/* Hero text */}
      <main className="flex flex-col items-center text-center mt-12 px-8">
        <h1 className="text-[70px] font-bold leading-none tracking-tight text-[#125D72] drop-shadow-sm">
          SELAMAT
        </h1>
        <h1 className="text-[80px] font-bold leading-none tracking-tight text-[#1a7fa8] drop-shadow-sm">
          DATANG
        </h1>

        <p className="mt-4 text-[22px] font-semibold text-[#125D72]">
          di Layanan Self Service <span className="text-[#14A2BA]">PLN</span>
        </p>

        <p className="mt-3 text-base text-center text-black leading-relaxed">
          Silakan gunakan layanan ini untuk kemudahan <br /> semua kebutuhan
          kelistrikan Anda
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push("/buku-tamu")}
          className="mt-10 flex items-center rounded-2xl bg-linear-to-t from-[#1a6e8e] to-[#2aaecf] px-10 py-5 text-white shadow-lg active:scale-95 transition-transform cursor-pointer"
        >
          <div className="text-left pr-6">
            <p className="text-lg font-bold leading-tight tracking-wide">
              KETUK LAYAR
            </p>
            <p className="text-lg font-bold leading-tight tracking-wide">
              UNTUK MULAI
            </p>
          </div>
          <div className="w-px self-stretch bg-white/40 mx-2" />
          <div className="pl-4">
            <Image src={touchIcon} alt="Touch" width={44} height={44} />
          </div>
        </button>
      </main>
    </div>
  );
}
