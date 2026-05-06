"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import bgDasar from "../assets/bg-dasar.png";
import plnIcon from "../assets/pln-icon.png";
import plnMobileIcon from "../assets/pln-mobile-icon.png";

export default function BukuTamu() {
  const router = useRouter();

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

      {/* Content */}
      <main className="flex flex-col items-center text-center mt-10 px-8 w-full">
        <h1 className="text-[4.5rem] font-black leading-none tracking-tight text-[#1a4f6e]">
          BUKU
        </h1>
        <h2 className="text-[3rem] font-black leading-none tracking-tight text-[#2aaecf] -mt-2">
          TAMU DIGITAL
        </h2>
        <p className="mt-4 text-base text-gray-500">
          Masukkan Nama dan No WhatsApp anda disini
        </p>

        {/* Form */}
        <form className="mt-10 w-full max-w-sm space-y-6">
          <div className="flex items-center gap-4">
            <label className="w-32 text-left text-base font-semibold text-gray-800 shrink-0">
              Nama
            </label>
            <input
              type="text"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-800 outline-none focus:border-[#2aaecf] focus:ring-2 focus:ring-[#2aaecf]/30"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-32 text-left text-base font-semibold text-gray-800 shrink-0">
              No WhatsApp
            </label>
            <input
              type="tel"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-800 outline-none focus:border-[#2aaecf] focus:ring-2 focus:ring-[#2aaecf]/30"
            />
          </div>
        </form>
      </main>

      {/* Bottom buttons */}
      <div className="absolute bottom-6 left-4 right-4 flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 flex items-center justify-center gap-2 bg-white py-5 text-base font-bold tracking-widest text-gray-800 shadow-md active:scale-95 transition-transform cursor-pointer rounded-2xl border border-gray-200"
        >
          <span className="text-lg">‹</span> KEMBALI
        </button>
        <button
          onClick={() => router.push("/pilih-layanan")}
          className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-[#1a6e8e] to-[#2aaecf] py-5 text-base font-bold tracking-widest text-white shadow-md active:scale-95 transition-transform cursor-pointer rounded-2xl"
        >
          LANJUT <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
