import { getAdminSession, sanitizeAdminNextPath } from "@/lib/admin-auth";
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
  const session = await getAdminSession();
  const resolvedSearchParams = await searchParams;
  const nextPath = sanitizeAdminNextPath(readParam(resolvedSearchParams.next));

  if (session) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#4fd1ed_0%,_#114a6c_42%,_#0a2d42_100%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <section className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">
            Kiosk Admin Access
          </p>
          <h1 className="max-w-xl text-4xl font-black tracking-tight md:text-6xl">
            Login untuk mengakses panel admin antrean.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/78 md:text-lg">
            Halaman ini membatasi akses ke data antrean dan file ekspor. Gunakan
            akun admin yang tersimpan di konfigurasi lingkungan aplikasi.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                Proteksi
              </p>
              <div className="mt-3 text-2xl font-black">Cookie Session</div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                Area
              </p>
              <div className="mt-3 text-2xl font-black">Dashboard Antrean</div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 text-[#17384a] shadow-[0_24px_80px_rgba(3,15,24,0.28)] md:p-8">
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
