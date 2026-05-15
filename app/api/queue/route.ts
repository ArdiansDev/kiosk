import { createQueueEntry, isQueueBadge } from "@/lib/queue";

export const runtime = "nodejs";

const getRemoteQueueUrl = (requestUrl: string) => {
  const remoteBaseUrl = process.env.ELECTRON_API_BASE_URL?.trim();

  if (!remoteBaseUrl) {
    return null;
  }

  const targetUrl = new URL("/api/queue", remoteBaseUrl);
  const currentOrigin = new URL(requestUrl).origin;

  if (targetUrl.origin === currentOrigin) {
    return null;
  }

  return targetUrl;
};

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
  const remoteQueueUrl = getRemoteQueueUrl(request.url);

  if (remoteQueueUrl) {
    const requestBody = await request.text();
    const upstreamResponse = await fetch(remoteQueueUrl, {
      method: "POST",
      headers: {
        "Content-Type":
          request.headers.get("content-type") || "application/json",
      },
      body: requestBody,
      cache: "no-store",
    });
    const responseBody = await upstreamResponse.text();

    return new Response(responseBody, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type":
          upstreamResponse.headers.get("content-type") ||
          "application/json; charset=utf-8",
      },
    });
  }

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
