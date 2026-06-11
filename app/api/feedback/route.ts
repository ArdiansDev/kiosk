import { createFeedback } from "@/lib/feedback";

export const runtime = "nodejs";

const getRemoteFeedbackUrl = (requestUrl: string) => {
  const remoteBaseUrl = process.env.ELECTRON_API_BASE_URL?.trim();

  if (!remoteBaseUrl) {
    return null;
  }

  const targetUrl = new URL("/api/feedback", remoteBaseUrl);
  const currentOrigin = new URL(requestUrl).origin;

  if (targetUrl.origin === currentOrigin) {
    return null;
  }

  return targetUrl;
};

type CreateFeedbackPayload = {
  rating?: number | string;
  message?: string;
  ticketNumber?: string;
};

export async function POST(request: Request) {
  const remoteFeedbackUrl = getRemoteFeedbackUrl(request.url);

  if (remoteFeedbackUrl) {
    const requestBody = await request.text();
    const upstreamResponse = await fetch(remoteFeedbackUrl, {
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

  let payload: CreateFeedbackPayload;

  try {
    payload = (await request.json()) as CreateFeedbackPayload;
  } catch {
    return Response.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const rating = Number(payload.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json(
      { error: "Nilai feedback harus antara 1 sampai 5." },
      { status: 400 },
    );
  }

  try {
    const entry = await createFeedback({
      rating,
      message: payload.message,
      ticketNumber: payload.ticketNumber,
    });

    return Response.json({ entry });
  } catch (error) {
    console.error("Failed to create feedback", error);

    return Response.json(
      { error: "Feedback gagal disimpan. Coba lagi." },
      { status: 500 },
    );
  }
}
