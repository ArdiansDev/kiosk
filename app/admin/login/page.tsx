import {
  assertAdminEnvironment,
  getAdminSession,
  sanitizeAdminNextPath,
} from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import AdminLoginForm from "./login-form";

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

const readParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  assertAdminEnvironment();

  const session = await getAdminSession();
  const resolvedSearchParams = await searchParams;
  const nextPath = sanitizeAdminNextPath(readParam(resolvedSearchParams.next));

  if (session) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#4fd1ed_0%,#114a6c_42%,#0a2d42_100%)] px-6 py-10 text-white md:px-10 items-center justify-center flex">
      <div className="mx-auto grid max-w-6xl gap-8  items-center justify-center">
        <section className="rounded-4xl bg-white p-6 text-[#17384a] shadow-[0_24px_80px_rgba(3,15,24,0.28)] md:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#6a8595]">
              Admin Login
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#114a6c]">
              Masuk ke panel admin
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5f7888]">
              Setelah login, Anda bisa melihat data antrean, memfilter periode,
              dan mengekspor CSV.
            </p>
          </div>

          <div className="mt-8">
            <AdminLoginForm nextPath={nextPath} />
          </div>
        </section>
      </div>
    </main>
  );
}
