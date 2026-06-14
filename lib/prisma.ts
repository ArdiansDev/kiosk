import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

// In the packaged Electron app, the bundled .env can set a RELATIVE
// DATABASE_URL ("file:./prisma/dev.db") that breaks when the app folder is
// moved. The Electron main process exports an absolute path via
// __KIOSK_DATABASE_URL; prefer it so the DB is always found.
const resolveDatabaseUrl = () => {
  const electronAbsoluteUrl = process.env.__KIOSK_DATABASE_URL?.trim();

  if (electronAbsoluteUrl) {
    return electronAbsoluteUrl;
  }

  return process.env.DATABASE_URL;
};

const databaseUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
