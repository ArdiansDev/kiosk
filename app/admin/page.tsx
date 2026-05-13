import { logoutAdmin } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/admin-auth";
import { getQueueDashboard, normalizeQueueRange } from "@/lib/queue";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{
    range?: string | string[];
    anchor?: string | string[];
  }>;
};

const readParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const rangeLabelMap = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
} as const;

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeRange = readParam(resolvedSearchParams.range);
  const activeAnchor = readParam(resolvedSearchParams.anchor);
  const adminQuery = new URLSearchParams();

  if (activeRange) {
    adminQuery.set("range", activeRange);
  }

  if (activeAnchor) {
    adminQuery.set("anchor", activeAnchor);
  }

  const adminSession = await requireAdminSession(
    adminQuery.size > 0 ? `/admin?${adminQuery.toString()}` : "/admin",
  );
  const range = normalizeQueueRange(readParam(resolvedSearchParams.range));
  const anchor = readParam(resolvedSearchParams.anchor);
  const dashboard = await getQueueDashboard(range, anchor);
  const exportQuery = new URLSearchParams({
    range,
    anchor: dashboard.anchorValue,
  });

  return (
    <main className="min-h-screen bg-[#edf4f7] px-6 py-8 text-[#17384a] md:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] bg-linear-to-r from-[#114a6c] via-[#136285] to-[#22b0d8] p-8 text-white shadow-[0_24px_80px_rgba(17,74,108,0.18)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                Kiosk Admin Panel
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                Data Antrean Pelanggan
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
                Pantau antrean, ubah jangkauan laporan ke harian, mingguan, atau
                bulanan, lalu ekspor hasilnya ke CSV.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/88 backdrop-blur">
                Login sebagai{" "}
                <span className="font-bold">{adminSession.username}</span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={`/api/admin/queue/export?${exportQuery.toString()}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold tracking-wide text-[#114a6c] shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  Export CSV
                </a>
                <form action={logoutAdmin}>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-white/25 bg-transparent px-5 py-3 text-sm font-bold tracking-wide text-white transition-transform hover:-translate-y-0.5 sm:w-auto"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_12px_40px_rgba(17,74,108,0.08)] backdrop-blur">
          <form
            className="grid gap-4 md:grid-cols-[180px_180px_auto] md:items-end"
            method="get"
          >
            <label className="block text-sm font-semibold text-[#35576b]">
              Filter periode
              <select
                name="range"
                defaultValue={range}
                className="mt-2 h-12 w-full rounded-2xl border border-[#d7e3ea] bg-white px-4 text-sm font-medium text-[#17384a] outline-none"
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </label>

            <label className="block text-sm font-semibold text-[#35576b]">
              Tanggal acuan
              <input
                type={dashboard.anchorInputType}
                name="anchor"
                defaultValue={dashboard.anchorValue}
                className="mt-2 h-12 w-full rounded-2xl border border-[#d7e3ea] bg-white px-4 text-sm font-medium text-[#17384a] outline-none"
              />
            </label>

            <button
              type="submit"
              className="h-12 rounded-2xl bg-[#114a6c] px-6 text-sm font-bold tracking-wide text-white shadow-md"
            >
              Terapkan Filter
            </button>
          </form>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-3xl bg-white p-5 shadow-[0_12px_32px_rgba(17,74,108,0.08)]">
            <p className="text-sm font-medium text-[#6a8595]">Tipe Filter</p>
            <div className="mt-3 text-2xl font-black text-[#114a6c]">
              {rangeLabelMap[range]}
            </div>
          </article>
          <article className="rounded-3xl bg-white p-5 shadow-[0_12px_32px_rgba(17,74,108,0.08)]">
            <p className="text-sm font-medium text-[#6a8595]">Periode Aktif</p>
            <div className="mt-3 text-xl font-black text-[#114a6c]">
              {dashboard.rangeLabel}
            </div>
          </article>
          <article className="rounded-3xl bg-white p-5 shadow-[0_12px_32px_rgba(17,74,108,0.08)]">
            <p className="text-sm font-medium text-[#6a8595]">Total Antrean</p>
            <div className="mt-3 text-4xl font-black text-[#114a6c]">
              {dashboard.totalEntries}
            </div>
          </article>
          <article className="rounded-3xl bg-white p-5 shadow-[0_12px_32px_rgba(17,74,108,0.08)]">
            <p className="text-sm font-medium text-[#6a8595]">Tiket Terbaru</p>
            <div className="mt-3 text-4xl font-black text-[#114a6c]">
              {dashboard.latestTicketNumber}
            </div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {dashboard.byBadge.map((item) => (
            <article
              key={item.badge}
              className="rounded-3xl border border-[#d7e3ea] bg-white p-5 shadow-[0_12px_32px_rgba(17,74,108,0.06)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6a8595]">
                {item.badge}
              </p>
              <div className="mt-3 text-4xl font-black text-[#114a6c]">
                {item.count}
              </div>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(17,74,108,0.08)]">
          <div className="flex items-center justify-between border-b border-[#e5eef3] px-6 py-5">
            <div>
              <h2 className="text-xl font-black text-[#114a6c]">
                Daftar Antrean
              </h2>
              <p className="mt-1 text-sm text-[#5f7888]">
                Menampilkan {dashboard.totalEntries} data untuk periode{" "}
                {dashboard.rangeLabel}.
              </p>
            </div>
          </div>

          {dashboard.entries.length === 0 ? (
            <div className="px-6 py-16 text-center text-[#5f7888]">
              Belum ada data antrean pada periode ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-[#f3f8fb] text-[#4b6778]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Tiket</th>
                    <th className="px-6 py-4 font-semibold">Waktu</th>
                    <th className="px-6 py-4 font-semibold">Nama</th>
                    <th className="px-6 py-4 font-semibold">Kontak</th>
                    <th className="px-6 py-4 font-semibold">Kategori</th>
                    <th className="px-6 py-4 font-semibold">Layanan</th>
                    <th className="px-6 py-4 font-semibold">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.entries.map(
                    (entry: {
                      id: string;
                      ticketNumber: string;
                      createdAtLabel: string;
                      queueDate: string;
                      name: string;
                      customerId?: string;
                      whatsapp: string;
                      ktp?: string;
                      badge: string;
                      serviceTitle: string;
                      detail: string;
                      address?: string;
                    }) => (
                      <tr
                        key={entry.id}
                        className="border-t border-[#edf3f6] align-top text-[#26485d]"
                      >
                        <td className="px-6 py-4 font-bold text-[#114a6c]">
                          {entry.ticketNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div>{entry.createdAtLabel}</div>
                          <div className="mt-1 text-xs text-[#6a8595]">
                            {entry.queueDate}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold">{entry.name}</div>
                          {entry.customerId ? (
                            <div className="mt-1 text-xs text-[#6a8595]">
                              ID Pelanggan: {entry.customerId}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-6 py-4">
                          <div>{entry.whatsapp}</div>
                          {entry.ktp ? (
                            <div className="mt-1 text-xs text-[#6a8595]">
                              KTP: {entry.ktp}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-[#dff4fb] px-3 py-1 text-xs font-bold text-[#136285]">
                            {entry.badge}
                          </span>
                        </td>
                        <td className="px-6 py-4">{entry.serviceTitle}</td>
                        <td className="px-6 py-4">
                          <div>{entry.detail}</div>
                          {entry.address ? (
                            <div className="mt-1 text-xs text-[#6a8595]">
                              {entry.address}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
