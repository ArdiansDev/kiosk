import {
  buildQueueCsv,
  getQueueDashboard,
  normalizeQueueRange,
} from "@/lib/queue";
import {
  getAdminLoginPath,
  isAdminEnvironment,
  readAdminSessionFromCookieValue,
  ADMIN_SESSION_COOKIE_NAME,
} from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAdminEnvironment()) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const session = readAdminSessionFromCookieValue(
    request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value,
  );

  if (!session) {
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(
      new URL(getAdminLoginPath(nextPath), request.url),
    );
  }

  const range = normalizeQueueRange(request.nextUrl.searchParams.get("range"));
  const anchor = request.nextUrl.searchParams.get("anchor");
  const dashboard = await getQueueDashboard(range, anchor);
  const csv = buildQueueCsv(dashboard.entries);
  const filename = `antrean-${range}-${dashboard.anchorValue}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
