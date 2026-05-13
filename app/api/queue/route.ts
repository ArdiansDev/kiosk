import { createQueueEntry, isQueueBadge } from "@/lib/queue";

export const runtime = "nodejs";

type CreateQueuePayload = {
  serviceTitle?: string;
  badge?: string;
  name?: string;
  whatsapp?: string;
  ktp?: string;
  customerId?: string;
  address?: string;
  detail?: string;
};

export async function POST(request: Request) {
  let payload: CreateQueuePayload;

  try {
    payload = (await request.json()) as CreateQueuePayload;
  } catch {
    return Response.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const serviceTitle = payload.serviceTitle?.trim();
  const badge = payload.badge?.trim();
  const name = payload.name?.trim();
  const whatsapp = payload.whatsapp?.trim();

  if (!serviceTitle || !badge || !name || !whatsapp) {
    return Response.json(
      { error: "Nama, WhatsApp, layanan, dan kategori wajib diisi." },
      { status: 400 },
    );
  }

  if (!isQueueBadge(badge)) {
    return Response.json(
      { error: "Kategori layanan tidak dikenali." },
      { status: 400 },
    );
  }

  try {
    const entry = await createQueueEntry({
      serviceTitle,
      badge,
      name,
      whatsapp,
      ktp: payload.ktp,
      customerId: payload.customerId,
      address: payload.address,
      detail: payload.detail,
    });

    return Response.json({ entry });
  } catch (error) {
    console.error("Failed to create queue entry", error);

    return Response.json(
      { error: "Data antrean gagal disimpan. Coba lagi." },
      { status: 500 },
    );
  }
}
