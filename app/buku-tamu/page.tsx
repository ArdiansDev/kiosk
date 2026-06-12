"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import bgDasar from "../assets/bg-dasar.png";
import plnIcon from "../assets/pln-icon.png";
import plnMobileIcon from "../assets/pln-mobile-icon.png";
import chevronLeft from "./../assets/chevron-left.svg";
import chevronRight from "./../assets/chevron-right.svg";

export default function BukuTamu() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [activeInput, setActiveInput] = useState<"nama" | "whatsapp" | null>(
    null,
  );
  const keyboardRef = useRef<any>(null);

  const handleInputChange = (input: string) => {
    if (activeInput === "nama") {
      setNama(input);
    } else if (activeInput === "whatsapp") {
      setWhatsapp(input);
    }
  };

  const handleKeyPress = (button: string) => {
    if (button === "{enter}") {
      setActiveInput(null);
    }
  };

  useEffect(() => {
    if (keyboardRef.current) {
      const currentValue =
        activeInput === "nama"
          ? nama
          : activeInput === "whatsapp"
            ? whatsapp
            : "";
      keyboardRef.current.setInput(currentValue);
    }
  }, [activeInput]);

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
        <Image src={plnIcon} alt="PLN" width={200} height={71} priority />
        <Image
          src={plnMobileIcon}
          alt="PLN Mobile"
          width={130}
          height={130}
          priority
        />
      </header>

      {/* Content */}
      <main className="flex flex-col items-center text-center mt-10 px-8 w-full">
        <h1 className="text-[100px] font-black leading-none tracking-tight text-[#1a4f6e]">
          BUKU
        </h1>
        <h2 className="text-[80px] font-black leading-none tracking-tight text-[#2aaecf] -mt-2">
          TAMU DIGITAL
        </h2>
        <p className="mt-4 text-[24px] text-gray-500">
          Masukkan Nama dan No WhatsApp anda disini
        </p>

        {/* Form */}
        <form className="mt-10  w-220 space-y-6">
          <div className="flex items-center gap-4">
            <label className="w-57.5 text-[32px] text-left text-base font-semibold text-gray-800 shrink-0">
              Nama
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              onFocus={() => setActiveInput("nama")}
              className="flex-1 rounded-lg border h-24 border-gray-300 w-157.5 bg-white px-4 py-3 text-base text-gray-800 outline-none focus:border-[#2aaecf] focus:ring-2 focus:ring-[#2aaecf]/30"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-57.5 text-nowrap text-[32px] text-left text-base font-semibold text-gray-800 shrink-0">
              No WhatsApp
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              onFocus={() => setActiveInput("whatsapp")}
              className="flex-1 rounded-lg border border-gray-300 h-24 bg-white px-4 py-3 text-base text-gray-800 outline-none focus:border-[#2aaecf] focus:ring-2 focus:ring-[#2aaecf]/30"
            />
          </div>
        </form>
      </main>

      {/* Bottom buttons */}
      <div className="absolute bottom-24 left-4 right-4 flex gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex-1 flex items-center justify-center gap-2 h-25.5 bg-white py-5 text-base font-bold tracking-widest text-gray-800 shadow-md active:scale-95 transition-transform cursor-pointer rounded-2xl border border-gray-200"
        >
          <Image src={chevronLeft} alt="Chevleft" width={13} height={13} />
          <p className="text-[32px]">KEMBALI</p>
        </button>
        <button
          onClick={() => router.push("/pilih-layanan")}
          className="flex-1 flex items-center text-[32px] justify-center gap-2 h-25.5 bg-linear-to-r from-[#1a6e8e] to-[#2aaecf] py-5 text-base font-bold tracking-widest text-white shadow-md active:scale-95 transition-transform cursor-pointer rounded-2xl"
        >
          <p className="text-[32px]">LANJUT</p>
          <Image
            src={chevronRight}
            alt="Chevron Right"
            width={13}
            height={13}
          />
        </button>
      </div>

      {/* Virtual Keyboard */}
      {activeInput && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl border-t-2 border-gray-300">
          <Keyboard
            keyboardRef={(r: any) => (keyboardRef.current = r)}
            layoutName={activeInput === "whatsapp" ? "numeric" : "default"}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            inputName={activeInput}
            layout={{
              default: [
                "q w e r t y u i o p",
                "a s d f g h j k l",
                "{shift} z x c v b n m {bksp}",
                "{space} {enter}",
              ],
              numeric: [
                "1 2 3",
                "4 5 6",
                "7 8 9",
                "0 {bksp}",
                "{space} {enter}",
              ],
            }}
            display={{
              "{enter}": "↵",
              "{shift}": "⇧",
              "{bksp}": "⌫",
              "{space}": "Space",
            }}
            theme="hg-theme-default hg-layout-default"
            buttonTheme={[
              {
                class: "hg-button-lg",
                buttons: "{enter} {shift} {bksp} {space}",
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
