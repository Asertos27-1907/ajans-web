import Image from "next/image";
import Link from "next/link";
import { listPublicActors } from "@/lib/actors/service";
import { createMetadata } from "@/lib/seo";
import { fullName } from "@/lib/utils";
import { GENDER_LABELS } from "@/config/constants";
import { EmptyState } from "@/components/ui/StatusBadge";

export const metadata = createMetadata({
  title: "Oyuncular",
  description:
    "+Akademi oyuncu ve yetenek portföyünü inceleyin. Cast ve menajerlik için profesyonel oyuncu kadromuz.",
  path: "/oyuncular",
});

export default async function ActorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page || 1) || 1;
  const result = await listPublicActors(page, 24).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    pageSize: 24,
    totalPages: 1,
  }));

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-bg-deep text-white">
        <Image
          src="/assets/photos/p06.jpg"
          alt=""
          fill
          className="object-cover opacity-35"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-secondary/40" />
        <div className="container-wide relative py-14 md:py-20">
          <p className="eyebrow text-white/55">Portföy</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Oyuncular
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            Web sitesinde yayınlanan aktif yetenekler. Detay için oyuncu
            profiline tıklayın.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide">
          {!result.data.length ? (
            <EmptyState
              title="Henüz yayınlanan oyuncu yok"
              description="Yakında yeni profiller eklenecek."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {result.data.map((actor) => (
                <Link
                  key={actor.id}
                  href={`/oyuncular/${actor.slug}`}
                  className="group block cursor-pointer"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-bg-muted">
                    <Image
                      src={actor.coverPhotoUrl}
                      alt={fullName(actor.firstName, actor.lastName)}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width:768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 pt-12 opacity-0 transition group-hover:opacity-100 md:opacity-100">
                      <p className="text-sm font-medium text-white">
                        {fullName(actor.firstName, actor.lastName)}
                      </p>
                      <p className="text-xs text-white/75">
                        {actor.city} · {actor.age} · {GENDER_LABELS[actor.gender]}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 md:hidden">
                    <h2 className="text-sm font-semibold">
                      {fullName(actor.firstName, actor.lastName)}
                    </h2>
                    <p className="text-xs text-ink-muted">
                      {actor.city} · {actor.age}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {result.totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: result.totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <Link
                    key={p}
                    href={`/oyuncular?page=${p}`}
                    className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded border px-3 text-sm ${
                      p === result.page
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface text-ink hover:border-primary/40"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
