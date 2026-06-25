import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE_NAME = "kiosk_admin_session";

const SESSION_TTL_SECONDS = 60 * 60 * 12;
const ADMIN_APP_ENV = "admin";
const DEFAULT_LOGIN_PATH = "/admin/login";

// The Electron build serves the app over plain http://127.0.0.1, so a `Secure`
// cookie would be silently dropped by Chromium and the admin session would
// never persist (login appears to succeed but bounces straight back to the
// login page). Derive `secure` from the actual request protocol instead of
// NODE_ENV: only mark the cookie Secure when the request really arrived over
// HTTPS (e.g. a reverse-proxied web deployment).
const isSecureRequest = async () => {
  const headerStore = await headers();
  const forwardedProto = headerStore.get("x-forwarded-proto");

  return forwardedProto?.split(",")[0]?.trim().toLowerCase() === "https";
};

type AdminSessionPayload = {
  username: string;
  expiresAt: number;
};

const getAdminConfig = () => ({
  username: process.env.ADMIN_USERNAME?.trim() || "admin",
  password: process.env.ADMIN_PASSWORD?.trim() || "admin12345",
  sessionSecret:
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    "kiosk-admin-session-secret-2026-change-this",
});

const getAppEnv = () =>
  process.env.APP_ENV?.trim().toLowerCase() ||
  process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase() ||
  "";

export const isAdminEnvironment = () => getAppEnv() === ADMIN_APP_ENV;

export const assertAdminEnvironment = () => {
  if (!isAdminEnvironment()) {
    notFound();
  }
};

const safeCompareText = (left: string, right: string) => {
  const leftDigest = createHash("sha256").update(left).digest();
  const rightDigest = createHash("sha256").update(right).digest();

  return timingSafeEqual(leftDigest, rightDigest);
};

const signPayload = (payload: string) =>
  createHmac("sha256", getAdminConfig().sessionSecret)
    .update(payload)
    .digest("base64url");

const createSessionToken = (username: string) => {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = Buffer.from(
    JSON.stringify({ username, expiresAt } satisfies AdminSessionPayload),
  ).toString("base64url");

  return {
    token: `${payload}.${signPayload(payload)}`,
    expiresAt,
  };
};

export const sanitizeAdminNextPath = (value: string | null | undefined) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
};

export const getAdminLoginPath = (nextPath?: string | null) => {
  const sanitizedNextPath = sanitizeAdminNextPath(nextPath);

  if (sanitizedNextPath === "/admin") {
    return DEFAULT_LOGIN_PATH;
  }

  return `${DEFAULT_LOGIN_PATH}?next=${encodeURIComponent(sanitizedNextPath)}`;
};

export const validateAdminCredentials = (
  username: string,
  password: string,
) => {
  if (!isAdminEnvironment()) {
    return false;
  }

  const config = getAdminConfig();

  return (
    safeCompareText(username.trim(), config.username) &&
    safeCompareText(password, config.password)
  );
};

export const readAdminSessionFromCookieValue = (value?: string | null) => {
  if (!isAdminEnvironment()) {
    return null;
  }

  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);

  if (!safeCompareText(signature, expectedSignature)) {
    return null;
  }

  try {
    const parsedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSessionPayload;

    if (
      parsedPayload.username !== getAdminConfig().username ||
      parsedPayload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return parsedPayload;
  } catch {
    return null;
  }
};

export const getAdminSession = async () => {
  const cookieStore = await cookies();

  return readAdminSessionFromCookieValue(
    cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value,
  );
};

export const requireAdminSession = async (nextPath?: string | null) => {
  assertAdminEnvironment();

  const session = await getAdminSession();

  if (!session) {
    redirect(getAdminLoginPath(nextPath));
  }

  return session;
};

export const createAdminSession = async () => {
  assertAdminEnvironment();

  const cookieStore = await cookies();
  const config = getAdminConfig();
  const { token, expiresAt } = createSessionToken(config.username);

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: await isSecureRequest(),
    path: "/",
    expires: new Date(expiresAt),
  });
};

export const clearAdminSession = async () => {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: await isSecureRequest(),
    path: "/",
    expires: new Date(0),
  });
};
