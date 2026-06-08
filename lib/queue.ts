import { prisma } from "./prisma";

export const queueBadges = [
  "PLN MOBILE",
  "INFO ONLINE",
  "BACK OFFICE",
] as const;

export type QueueBadge = (typeof queueBadges)[number];
export type QueueRange = "daily" | "weekly" | "monthly";

type NullableText = string | null | undefined;

export type CreateQueueEntryInput = {
  serviceTitle: string;
  badge: QueueBadge;
  name: string;
  whatsapp: string;
  ktp?: NullableText;
  customerId?: NullableText;
  address?: NullableText;
  detail?: NullableText;
};

export type QueueEntryView = {
  id: string;
  queueDate: string;
  sequence: number;
  ticketNumber: string;
  serviceTitle: string;
  badge: QueueBadge;
  name: string;
  whatsapp: string;
  ktp: string;
  customerId: string;
  address: string;
  detail: string;
  createdAt: string;
  createdAtLabel: string;
  dateText: string;
  timeText: string;
};

type RangeWindow = {
  anchorValue: string;
  inputType: "date" | "month";
  label: string;
  start: Date;
  end: Date;
};

const dayFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const padNumber = (value: number) => String(value).padStart(2, "0");

const capitalize = (value: string) =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, amount: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
};

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;

const formatMonthKey = (date: Date) =>
  `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}`;

const parseDateKey = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const parsedDate = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );

  return Number.isNaN(parsedDate.getTime()) ? null : startOfDay(parsedDate);
};

const parseMonthKey = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const parsedDate = new Date(Number(match[1]), Number(match[2]) - 1, 1);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const normalizeOptionalText = (value: NullableText) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const getWeekStart = (date: Date) => {
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(date, offset));
};

const formatTicketNumber = (sequence: number) =>
  `A-${String(sequence).padStart(3, "0")}`;

export const isQueueBadge = (value: string): value is QueueBadge =>
  queueBadges.includes(value as QueueBadge);

export const normalizeQueueRange = (
  value: string | null | undefined,
): QueueRange => {
  if (value === "weekly" || value === "monthly") {
    return value;
  }

  return "daily";
};

export const formatTicketDate = (date: Date) => ({
  dateText: capitalize(dayFormatter.format(date)),
  timeText: timeFormatter.format(date),
});

const serializeEntry = (entry: {
  id: string;
  queueDate: string;
  sequence: number;
  ticketNumber: string;
  serviceTitle: string;
  badge: string;
  name: string;
  whatsapp: string;
  ktp: string | null;
  customerId: string | null;
  address: string | null;
  detail: string;
  createdAt: Date;
}): QueueEntryView => {
  const { dateText, timeText } = formatTicketDate(entry.createdAt);

  return {
    id: entry.id,
    queueDate: entry.queueDate,
    sequence: entry.sequence,
    ticketNumber: entry.ticketNumber,
    serviceTitle: entry.serviceTitle,
    badge: isQueueBadge(entry.badge) ? entry.badge : "BACK OFFICE",
    name: entry.name,
    whatsapp: entry.whatsapp,
    ktp: entry.ktp ?? "",
    customerId: entry.customerId ?? "",
    address: entry.address ?? "",
    detail: entry.detail,
    createdAt: entry.createdAt.toISOString(),
    createdAtLabel: dateTimeFormatter.format(entry.createdAt),
    dateText,
    timeText,
  };
};

const resolveRangeWindow = (
  range: QueueRange,
  anchorValue?: string | null,
): RangeWindow => {
  const today = startOfDay(new Date());

  if (range === "weekly") {
    const anchorDate = parseDateKey(anchorValue) ?? today;
    const start = getWeekStart(anchorDate);
    const end = addDays(start, 7);

    return {
      anchorValue: formatDateKey(anchorDate),
      inputType: "date",
      label: `${shortDateFormatter.format(start)} - ${shortDateFormatter.format(addDays(end, -1))}`,
      start,
      end,
    };
  }

  if (range === "monthly") {
    const anchorDate = parseMonthKey(anchorValue) ?? today;
    const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const end = new Date(
      anchorDate.getFullYear(),
      anchorDate.getMonth() + 1,
      1,
    );

    return {
      anchorValue: formatMonthKey(start),
      inputType: "month",
      label: capitalize(monthFormatter.format(start)),
      start,
      end,
    };
  }

  const anchorDate = parseDateKey(anchorValue) ?? today;
  const start = startOfDay(anchorDate);

  return {
    anchorValue: formatDateKey(start),
    inputType: "date",
    label: capitalize(dayFormatter.format(start)),
    start,
    end: addDays(start, 1),
  };
};

export const createQueueEntry = async (input: CreateQueueEntryInput) => {
  const queueDate = formatDateKey(new Date());

  const createdEntry = await prisma.$transaction(async (transaction: any) => {
    const counter = await transaction.dailyQueueCounter.upsert({
      where: { queueDate },
      update: { lastSequence: { increment: 1 } },
      create: { queueDate, lastSequence: 1 },
    });

    return transaction.queueEntry.create({
      data: {
        queueDate,
        sequence: counter.lastSequence,
        ticketNumber: formatTicketNumber(counter.lastSequence),
        serviceTitle: input.serviceTitle.trim(),
        badge: input.badge,
        name: input.name.trim(),
        whatsapp: input.whatsapp.trim(),
        ktp: normalizeOptionalText(input.ktp),
        customerId: normalizeOptionalText(input.customerId),
        address: normalizeOptionalText(input.address),
        detail:
          normalizeOptionalText(input.detail) ?? input.serviceTitle.trim(),
      },
    });
  });

  return serializeEntry(createdEntry);
};

export const getQueueDashboard = async (
  range: QueueRange,
  anchorValue?: string | null,
) => {
  const window = resolveRangeWindow(range, anchorValue);
  const entries = await prisma.queueEntry.findMany({
    where: {
      createdAt: {
        gte: window.start,
        lt: window.end,
      },
    },
    orderBy: [{ createdAt: "desc" }, { sequence: "desc" }],
  });

  const serializedEntries = entries.map(serializeEntry);

  return {
    range,
    rangeLabel: window.label,
    anchorValue: window.anchorValue,
    anchorInputType: window.inputType,
    totalEntries: serializedEntries.length,
    latestTicketNumber:
      serializedEntries.length > 0 ? serializedEntries[0].ticketNumber : "-",
    entries: serializedEntries,
    byBadge: queueBadges.map((badge) => ({
      badge,
      count: serializedEntries.filter((entry: any) => entry.badge === badge)
        .length,
    })),
  };
};

const escapeCsvCell = (value: string) => `"${value.replaceAll('"', '""')}"`;

export const buildQueueCsv = (entries: QueueEntryView[]) => {
  const header = [
    "Nomor Tiket",
    "Tanggal Antrean",
    "Waktu Dibuat",
    "Nama",
    "No WhatsApp",
    "No KTP",
    "ID Pelanggan",
    "Alamat",
    "Kategori",
    "Layanan",
    "Detail",
  ];

  const rows = entries.map((entry) => [
    entry.ticketNumber,
    entry.queueDate,
    entry.createdAtLabel,
    entry.name,
    entry.whatsapp,
    entry.ktp,
    entry.customerId,
    entry.address,
    entry.badge,
    entry.serviceTitle,
    entry.detail,
  ]);

  return [header, ...rows]
    .map((columns) => columns.map((column) => escapeCsvCell(column)).join(","))
    .join("\r\n");
};
