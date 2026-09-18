import Link from "next/link";
import Image from "next/image";
import {
  getApplicationStats,
  listApplications,
} from "@/lib/applications/service";
import { getActorStats, listActors } from "@/lib/actors/service";
import { getContactStats, listContacts } from "@/lib/contacts/service";
import { getReferenceStats } from "@/lib/references/service";
import { PageHeader, StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort, fullName } from "@/lib/utils";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Dashboard",
  path: "/dashboard",
});

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const [appStats, actorStats, refStats, contactStats, apps, messages, actors] =
    await Promise.all([
      getApplicationStats().catch(() => ({ total: 0, new: 0, reviewing: 0 })),
      getActorStats().catch(() => ({ total: 0, active: 0 })),
      getReferenceStats().catch(() => ({ total: 0 })),
      getContactStats().catch(() => ({ unread: 0, new: 0 })),
      listApplications({ page: 1, pageSize: 5 }).catch(() => ({
        data: [],
        total: 0,
        page: 1,
        pageSize: 5,
        totalPages: 1,
      })),
      listContacts().catch(() => []),
      listActors({ page: 1, pageSize: 5 }).catch(() => ({
        data: [],
        total: 0,
        page: 1,
        pageSize: 5,
        totalPages: 1,
      })),
    ]);

  const cards = [
    { label: "Toplam Başvuru", value: appStats.total },
    { label: "Yeni Başvuru", value: appStats.new },
    { label: "İnceleniyor", value: appStats.reviewing },
    { label: "Aktif Oyuncu", value: actorStats.active },
    { label: "Referans", value: refStats.total },
    { label: "İletişim Talebi", value: contactStats.unread },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Başvuru, oyuncu ve iletişim özeti"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded border border-border bg-surface p-4"
          >
            <p className="text-xs tracking-wide text-ink-soft uppercase">
              {card.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="rounded border border-border bg-surface xl:col-span-1">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Son Başvurular</h2>
            <Link href="/dashboard/basvurular" className="text-xs text-ink-muted hover:text-ink">
              Tümü
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {apps.data.map((app) => (
              <li key={app.id}>
                <Link
                  href={`/dashboard/basvurular/${app.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bg-muted/60"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded bg-bg-muted">
                    {app.photos[0]?.thumbnailUrl ? (
                      <Image
                        src={app.photos[0].thumbnailUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {fullName(app.firstName, app.lastName)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {app.city} · {formatDateShort(app.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </Link>
              </li>
            ))}
            {!apps.data.length ? (
              <li className="px-4 py-6 text-sm text-ink-muted">Henüz başvuru yok.</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Son İletişim</h2>
            <Link href="/dashboard/iletisim" className="text-xs text-ink-muted hover:text-ink">
              Tümü
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {messages.slice(0, 5).map((msg) => (
              <li key={msg.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{msg.name}</p>
                  {msg.status === "new" ? (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      Yeni
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-xs text-ink-muted">{msg.subject}</p>
              </li>
            ))}
            {!messages.length ? (
              <li className="px-4 py-6 text-sm text-ink-muted">Mesaj yok.</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Son Oyuncular</h2>
            <Link href="/dashboard/oyuncular" className="text-xs text-ink-muted hover:text-ink">
              Tümü
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {actors.data.map((actor) => (
              <li key={actor.id}>
                <Link
                  href={`/dashboard/oyuncular/${actor.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bg-muted/60"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded bg-bg-muted">
                    {actor.coverPhotoUrl ? (
                      <Image
                        src={actor.coverPhotoUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {fullName(actor.firstName, actor.lastName)}
                    </p>
                    <p className="text-xs text-ink-muted">{actor.city}</p>
                  </div>
                </Link>
              </li>
            ))}
            {!actors.data.length ? (
              <li className="px-4 py-6 text-sm text-ink-muted">Oyuncu yok.</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
