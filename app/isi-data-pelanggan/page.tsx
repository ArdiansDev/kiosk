"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useState, useRef, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import bgDasar from "../assets/bg-dasar.png";
import plnIcon from "../assets/pln-icon.png";
import plnMobileIcon from "../assets/pln-mobile-icon.png";
import chevronLeft from "./../assets/chevron-left.svg";
import chevronRight from "./../assets/chevron-right.svg";
import {
  IconLayanan,
  IconLayananNumber,
} from "../pilih-layanan/_components/icon-layanan";
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

type IsiDataPelangganPageProps = {
  searchParams: Promise<{
    title?: string | string[];
    badge?: string | string[];
    index?: string | string[];
    nama?: string | string[];
    whatsapp?: string | string[];
  }>;
};

const readParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function IsiDataPelanggan({
  searchParams,
}: IsiDataPelangganPageProps) {
  const router = useRouter();
  const resolvedSearchParams = use(searchParams);
  const [form, setForm] = useState<FormState>({
    nama: readParam(resolvedSearchParams.nama) || "",
    whatsapp: readParam(resolvedSearchParams.whatsapp) || "",
    ktp: "",
    pelangganId: "",
    alamat: "",
    detail: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeInput, setActiveInput] = useState<keyof FormState | null>(null);
  const keyboardRef = useRef<any>(null);

  const title = readParam(resolvedSearchParams.title) || fallbackService.title;
  const badge =
    (readParam(resolvedSearchParams.badge) as BadgeType | undefined) ||
    fallbackService.badge;
  const iconIndex = (() => {
    const parsedIndex = Number(readParam(resolvedSearchParams.index));
    return Number.isInteger(parsedIndex) &&
      parsedIndex >= 0 &&
      parsedIndex <= 17
      ? (parsedIndex as IconLayananNumber)
      : 0;
  })();

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleInputChange = (input: string) => {
    if (activeInput) {
      updateField(activeInput, input);
    }
  };

  const handleKeyPress = (button: string) => {
    if (button === "{enter}") {
      setActiveInput(null);
    }
  };

  useEffect(() => {
    if (keyboardRef.current && activeInput) {
      keyboardRef.current.setInput(form[activeInput]);
    }
  }, [activeInput]);

  const handleContinue = async () => {
    if (!form.nama.trim() || !form.whatsapp.trim()) {
      setSubmitError("Nama dan No WhatsApp wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceTitle: title,
          badge,
          name: form.nama,
          whatsapp: form.whatsapp,
          ktp: form.ktp,
          customerId: form.pelangganId,
          address: form.alamat,
          detail: form.detail,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        entry?: {
          ticketNumber: string;
          name: string;
          whatsapp: string;
          detail: string;
          badge: BadgeType;
          dateText: string;
          timeText: string;
        };
      };

      if (!response.ok || !payload.entry) {
        throw new Error(payload.error || "Data antrean gagal disimpan.");
      }

      const params = new URLSearchParams({
        title,
        badge: payload.entry.badge,
        ticketNumber: payload.entry.ticketNumber,
        nama: payload.entry.name,
        whatsapp: payload.entry.whatsapp,
        keluhan: payload.entry.detail,
        dateText: payload.entry.dateText,
        timeText: payload.entry.timeText,
      });

      router.push(`/cetak-tiket?${params.toString()}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat tiket antrean.",
      );
    } finally {
      setIsSubmitting(false);
    }
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

      <header className="flex w-full items-center justify-between px-8 pt-6">
        <Image src={plnIcon} alt="PLN" width={200} height={71} priority />
        <Image
          src={plnMobileIcon}
          alt="PLN Mobile"
          width={130}
          height={130}
          priority
        />
      </header>

      <div className="mt-2 w-full max-w-220 px-0 pb-28">
        <div className="hidden text-center">
          <h1 className="text-[60px] font-black leading-none tracking-tight text-[#125D72]">
            ISI DATA PELANGGAN
          </h1>
          <p className="mt-1 text-[24px] text-[#5f666d]">
            Lengkapi data berikut untuk melanjutkan layanan
          </p>
        </div>

        <div className="text-[15px] text-[#6a7076]">Layanan yang dipilih:</div>

        <div className="mt-2 flex h-22 items-center gap-3 rounded-lg border border-[#d9e1e7] bg-white px-7 py-3 shadow-[0_8px_24px_rgba(17,74,108,0.08)]">
          <IconLayanan
            number={iconIndex as IconLayananNumber}
            width={52}
            height={52}
          />
          <div className="min-w-0 flex-1">
            <span
              className={`inline-flex rounded-[3px] px-2 py-1 text-[8px] font-bold leading-none ${badgeStyle[badge]}`}
            >
              {badge}
            </span>
            <p className="mt-1 text-[20px] font-bold uppercase leading-tight text-[#125D72]">
              {title}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[42px] leading-none text-black"
            aria-label="Kembali ke pilih layanan"
          >
            ×
          </button>
        </div>

        <div className="mt-6 min-h-215 border border-[#d9e1e7] bg-white px-8 py-8 shadow-[0_8px_24px_rgba(17,74,108,0.06)]">
          <div className="space-y-6">
            <div className="grid grid-cols-[270px_1fr] items-start gap-x-6 gap-y-2">
              <label className="pt-5 text-[18px] font-medium text-[#161616] w-full">
                Nama
              </label>
              <input
                type="text"
                value={form.nama}
                onChange={(event) => updateField("nama", event.target.value)}
                onFocus={() => setActiveInput("nama")}
                className="h-18 w-full rounded-md border border-[#c6d0d8] bg-white px-4 text-[20px] text-[#1b1b1b] outline-none"
              />
            </div>

            <div className="grid grid-cols-[270px_1fr] items-start gap-x-6 gap-y-2">
              <label className="pt-5 text-[18px] font-medium text-[#161616] w-full">
                No WhatsApp
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(event) =>
                  updateField("whatsapp", event.target.value)
                }
                onFocus={() => setActiveInput("whatsapp")}
                className="h-18 w-full rounded-md border border-[#c6d0d8] bg-white px-4 text-[20px] text-[#1b1b1b] outline-none"
              />
            </div>

            <div className="grid grid-cols-[270px_1fr] items-start gap-x-6 gap-y-2">
              <label className="pt-5 text-[18px] font-medium text-[#161616] w-full">
                No KTP
              </label>
              <input
                type="text"
                value={form.ktp}
                onChange={(event) => updateField("ktp", event.target.value)}
                onFocus={() => setActiveInput("ktp")}
                className="h-18 w-full rounded-md border border-[#c6d0d8] bg-white px-4 text-[20px] text-[#1b1b1b] outline-none"
              />
            </div>

            <div className="grid grid-cols-[270px_1fr] items-start gap-x-6 gap-y-2">
              <label className="pt-5 text-[18px] font-medium text-[#161616] w-full">
                ID Pelanggan
              </label>
              <input
                type="text"
                value={form.pelangganId}
                onChange={(event) =>
                  updateField("pelangganId", event.target.value)
                }
                onFocus={() => setActiveInput("pelangganId")}
                className="h-18 w-full rounded-md border border-[#c6d0d8] bg-white px-4 text-[20px] text-[#1b1b1b] outline-none"
              />
            </div>

            <div className="grid grid-cols-[270px_1fr] items-start gap-x-6 gap-y-2">
              <label className="pt-5 text-[18px] font-medium text-[#161616] w-full">
                Alamat Rumah
              </label>
              <textarea
                value={form.alamat}
                onChange={(event) => updateField("alamat", event.target.value)}
                onFocus={() => setActiveInput("alamat")}
                className="min-h-29 w-full resize-none rounded-md border border-[#c6d0d8] bg-white px-4 py-3 text-[20px] text-[#1b1b1b] outline-none"
              />
            </div>

            <div className="grid grid-cols-[270px_1fr] items-start gap-x-6 gap-y-2">
              <label className="pt-1 text-[18px] font-medium leading-tight text-[#161616] w-full">
                Detail kebutuhan pelanggan sesuai layanan yang dipilih
              </label>
              <textarea
                value={form.detail}
                onChange={(event) => updateField("detail", event.target.value)}
                onFocus={() => setActiveInput("detail")}
                className="min-h-29 w-full resize-none rounded-md border border-[#c6d0d8] bg-white px-4 py-3 text-[20px] text-[#1b1b1b] outline-none"
              />
            </div>
          </div>
          {submitError ? (
            <div className="mt-5 rounded-xl border border-[#f1b6b6] bg-[#fff4f4] px-4 py-3 text-sm text-[#9d2f2f]">
              {submitError}
            </div>
          ) : null}
        </div>
      </div>
      <div className="absolute bottom-24 left-4 right-4 flex gap-3">
        <button
          onClick={() => {
            const params = new URLSearchParams();
            if (form.nama.trim()) params.set("nama", form.nama.trim());
            if (form.whatsapp.trim())
              params.set("whatsapp", form.whatsapp.trim());
            const query = params.toString();
            router.push(query ? `/pilih-layanan?${query}` : "/pilih-layanan");
          }}
          className="flex-1 flex items-center justify-center gap-2 h-25.5 bg-white py-5 text-base font-bold tracking-widest text-gray-800 shadow-md active:scale-95 transition-transform cursor-pointer rounded-2xl border border-gray-200"
        >
          <Image src={chevronLeft} alt="Chevleft" width={13} height={13} />
          <p className="text-[32px]">KEMBALI</p>
        </button>
        <button
          onClick={() => handleContinue()}
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
            layoutName={
              activeInput === "whatsapp" ||
              activeInput === "ktp" ||
              activeInput === "pelangganId"
                ? "numeric"
                : "default"
            }
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
