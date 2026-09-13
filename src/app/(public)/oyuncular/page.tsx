import Image from "next/image";
import Link from "next/link";
import { actorRepository } from "@/lib/repositories";
import { createMetadata } from "@/lib/seo";
import { fullName } from "@/lib/utils";
import { GENDER_LABELS } from "@/config/constants";
import { EmptyState } from "@/components/ui/StatusBadge";

export const metadata = createMetadata({
  title: "Oyuncular",
  description: "+Akademi oyuncu ve yetenek portföyü.",
  path: "/oyuncular",
});

export default async function ActorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page || 1) || 1;
  const result = await actorRepository.listPublic(page, 24);

  return (
    <div>
      <section className="border-b border-border bg-bg-warm/50">
        <div className="container-wide py-14 md:py-20">
          <p className="eyebrow">Portföy</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Oyuncular
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {result.data.map((actor) => (
                <Link
                  key={actor.id}
                  href={`/oyuncular/${actor.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-bg-warm">
                    <Image
                      src={actor.coverPhotoUrl}
                      alt={fullName(actor.firstName, actor.lastName)}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width:768px) 50vw, 25vw"
                    />
                  </div>
                  <h2 className="mt-3 text-base font-semibold">
                    {fullName(actor.firstName, actor.lastName)}
                  </h2>
                  <p className="text-sm text-ink-muted">
                    {actor.city} · {actor.age} · {GENDER_LABELS[actor.gender]}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {actor.heightCm} cm · {actor.hairColor} saç · {actor.eyeColor} göz
                  </p>
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
                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded border px-3 text-sm ${
                      p === result.page
                        ? "border-ink bg-ink text-white"
                        : "border-border bg-surface text-ink"
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
