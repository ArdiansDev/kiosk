"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useRef, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import bgDasar from "../assets/bg-dasar.png";
import plnIcon from "../assets/pln-icon.png";
import plnMobileIcon from "../assets/pln-mobile-icon.png";
import chevronLeft from "../assets/chevron-left.svg";
import chevronRight from "../assets/chevron-right.svg";

const ratings = [1, 2, 3, 4, 5];

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

function FeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketNumber = searchParams.get("ticketNumber") ?? "";
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [showThanks, setShowThanks] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeInput, setActiveInput] = useState<"message" | null>(null);
  const [shiftActive, setShiftActive] = useState(false);
  const keyboardRef = useRef<any>(null);

  const handleInputChange = (input: string) => {
    setMessage(input);
  };

  const handleKeyPress = (button: string) => {
    if (button === "{shift}" || button === "{lock}") {
      setShiftActive((current) => !current);
    }

    if (button === "{enter}") {
      setActiveInput(null);
    }
  };

  useEffect(() => {
    if (keyboardRef.current && activeInput) {
      keyboardRef.current.setInput(message);
    }
  }, [activeInput]);

  const handleSubmit = async () => {
    if (selectedRating === null || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: selectedRating,
          message: message.trim() || null,
          ticketNumber: ticketNumber || null,
        }),
      });
    } catch (error) {
      console.error("Gagal mengirim feedback", error);
    } finally {
      setIsSubmitting(false);
      setShowThanks(true);
    }
  };

  const handleFinishThanks = () => {
    setShowThanks(false);
    setShowMore(true);
  };

  const handleMoreYes = () => {
    setShowMore(false);
    router.push("/pilih-layanan");
  };

  const handleMoreNo = () => {
    setShowMore(false);
    router.push("/");
  };

  return (
    <div className="relative flex min-h-screen flex-1 flex-col items-center overflow-hidden font-sans">
      {/* Background */}
      <Image
        src={bgDasar}
        alt="Background"
        fill
        className="-z-10 object-cover object-center"
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
      <main className="relative z-10 w-full max-w-2xl px-8 pb-8">
        <div className="text-center">
          <h1 className="text-[40px] font-black leading-tight tracking-tight text-[#125D72]">
            Bagaimana Pendapat Anda
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#377491]">
            Masukan Anda sangat berharga untuk membantu kami dalam meningkatkan
            kualitas pelayanan.
          </p>
        </div>

        {/* Rating */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-[#125D72]">
            Berikan nilai untuk kualitas pelayanan kami.
          </h2>
          <p className="mt-1 text-sm text-[#6c6c6c]">
            Pilih nilai paling sesuai dengan pengalaman Anda.
          </p>

          <div className="mt-5 grid grid-cols-5 gap-3">
            {ratings.map((value) => {
              const active = selectedRating === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedRating(value)}
                  className={`flex aspect-square items-center justify-center rounded-2xl border-2 text-[32px] font-black transition-all active:scale-95 ${
                    active
                      ? "border-[#22B0D8] bg-[#22B0D8] text-white shadow-[0_8px_20px_rgba(34,176,216,0.35)]"
                      : "border-[#22B0D8]/40 bg-white text-[#125D72]"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between text-xs font-medium text-[#6c6c6c]">
            <span>Sangat Tidak Puas</span>
            <span>Sangat Puas</span>
          </div>
        </section>

        {/* Message */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-[#125D72]">
            Berikan masukan untuk layanan kami.
          </h2>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onFocus={() => setActiveInput("message")}
            placeholder="Tulis masukan anda disini..."
            rows={4}
            className="mt-3 w-full resize-none rounded-2xl border border-[#d9e1e7] bg-white px-5 py-4 text-base text-[#222] outline-none placeholder:text-[#b6b6b6] focus:border-[#2aaecf] focus:ring-2 focus:ring-[#2aaecf]/30"
          />
        </section>
      </main>

      {/* Bottom buttons */}
      <div className="relative z-10 mt-auto flex w-full gap-3 px-4 pb-6 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-5 text-base font-bold tracking-widest text-gray-800 shadow-md transition-transform active:scale-95"
        >
          <Image src={chevronLeft} alt="Chevron Left" width={13} height={13} />
          <p className="text-xl">KEMBALI</p>
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedRating === null || isSubmitting}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#1a6e8e] to-[#2aaecf] py-5 text-base font-bold tracking-widest text-white shadow-md transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <p className="text-xl">{isSubmitting ? "MENGIRIM..." : "KIRIM"}</p>
          <Image
            src={chevronRight}
            alt="Chevron Right"
            width={13}
            height={13}
          />
        </button>
      </div>

      {/* Modal: Terima kasih */}
      {showThanks && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c4459]/40 px-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="thanks-title"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white px-8 py-10 text-center shadow-[0_24px_60px_rgba(12,68,89,0.25)]">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#22B0D8] text-white">
              {checkIcon}
            </div>

            <h2
              id="thanks-title"
              className="mt-6 text-[26px] font-black tracking-tight text-[#125D72]"
            >
              Terima kasih!
            </h2>

            <p className="mx-auto mt-3 max-w-xs text-[14px] leading-relaxed text-[#6c6c6c]">
              Feedback Anda membantu kami untuk terus meningkatkan kualitas
              layanan.
            </p>

            <button
              type="button"
              onClick={handleFinishThanks}
              className="mt-8 w-full cursor-pointer rounded-2xl bg-linear-to-r from-[#1a6e8e] to-[#2aaecf] py-4 text-base font-bold tracking-wide text-white shadow-md transition-transform active:scale-95"
            >
              SELESAI
            </button>
          </div>
        </div>
      )}

      {/* Modal: Keperluan lain */}
      {showMore && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c4459]/40 px-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="more-title"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white px-8 py-10 text-center shadow-[0_24px_60px_rgba(12,68,89,0.25)]">
            <h2
              id="more-title"
              className="text-[26px] font-black leading-tight tracking-tight text-[#125D72]"
            >
              Apakah Anda masih ada keperluan lain?
            </h2>

            <p className="mt-3 text-[14px] leading-relaxed text-[#6c6c6c]">
              Kami siap membantu Anda.
            </p>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={handleMoreYes}
                className="flex-1 cursor-pointer rounded-2xl border-2 border-[#22B0D8] bg-white py-4 text-base font-bold tracking-wide text-[#125D72] transition-transform active:scale-95"
              >
                YA, MASIH ADA
              </button>
              <button
                type="button"
                onClick={handleMoreNo}
                className="flex-1 cursor-pointer rounded-2xl bg-linear-to-r from-[#1a6e8e] to-[#2aaecf] py-4 text-base font-bold tracking-wide text-white shadow-md transition-transform active:scale-95"
              >
                TIDAK ADA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Keyboard */}
      {activeInput && (
        <div className="kiosk-keyboard fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl border-t-2 border-gray-300">
          <Keyboard
            keyboardRef={(r: any) => (keyboardRef.current = r)}
            layoutName={shiftActive ? "shift" : "default"}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            inputName={activeInput}
            layout={{
              default: [
                "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                "{tab} q w e r t y u i o p [ ] \\",
                "{lock} a s d f g h j k l ; ' {enter}",
                "{shift} z x c v b n m , . / {shift}",
                ".com @ {space}",
              ],
              shift: [
                "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
                "{tab} Q W E R T Y U I O P { } |",
                '{lock} A S D F G H J K L : " {enter}',
                "{shift} Z X C V B N M < > ? {shift}",
                ".com @ {space}",
              ],
            }}
            display={{
              "{enter}": "< enter",
              "{shift}": "shift",
              "{bksp}": "backspace",
              "{lock}": "caps",
              "{tab}": "tab",
              "{space}": " ",
            }}
            theme="hg-theme-default hg-layout-default"
            buttonTheme={[
              {
                class: "hg-button-lg",
                buttons: "{enter} {shift} {bksp} {tab} {lock}",
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}

export default function Feedback() {
  return (
    <Suspense fallback={null}>
      <FeedbackContent />
    </Suspense>
  );
}
