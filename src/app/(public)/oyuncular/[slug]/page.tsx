import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActorBySlug } from "@/lib/actors/service";
import { createMetadata } from "@/lib/seo";
import { fullName } from "@/lib/utils";
import { GENDER_LABELS } from "@/config/constants";
import { Button } from "@/components/ui/Button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const actor = await getActorBySlug(slug).catch(() => null);
  if (!actor) {
    return createMetadata({
      title: "Oyuncu",
      path: `/oyuncular/${slug}`,
      noIndex: true,
    });
  }
  const name = fullName(actor.firstName, actor.lastName);
  return createMetadata({
    title: name,
    description: `${name} — ${actor.city} · +Akademi oyuncu portföyü`,
    path: `/oyuncular/${slug}`,
    image: actor.coverPhotoUrl || undefined,
  });
}

export default async function ActorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const actor = await getActorBySlug(slug).catch(() => null);
  if (!actor) notFound();

  const rows: [string, string][] = [
    ["Şehir", actor.city],
    ["Yaş", String(actor.age)],
    ["Cinsiyet", GENDER_LABELS[actor.gender]],
  ];
  if (actor.heightCm) rows.push(["Boy", `${actor.heightCm} cm`]);
  if (actor.weightKg) rows.push(["Kilo", `${actor.weightKg} kg`]);

  return (
    <div>
      <section className="border-b border-border bg-secondary text-white">
        <div className="container-wide py-10 md:py-14">
          <p className="eyebrow text-white/55">Oyuncu profili</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {fullName(actor.firstName, actor.lastName)}
          </h1>
          <p className="mt-3 text-white/70">
            {actor.city} · {actor.age} · {GENDER_LABELS[actor.gender]}
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <div className="relative aspect-[3/4] overflow-hidden bg-bg-muted">
              <Image
                src={actor.coverPhotoUrl}
                alt={fullName(actor.firstName, actor.lastName)}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 40vw"
                priority
              />
            </div>
            {actor.photos.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {actor.photos.slice(0, 4).map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden bg-bg-muted"
                  >
                    <Image
                      src={photo.thumbnailUrl}
                      alt={photo.alt}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              {rows.map(([k, v]) => (
                <div key={k} className="border-t border-border pt-3">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="mt-1 font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            {actor.experience ? (
              <section className="mt-8">
                <h2 className="text-lg font-semibold">Deneyim</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {actor.experience}
                </p>
              </section>
            ) : null}

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/basvuru">
                <Button>Oyuncu Başvurusu</Button>
              </Link>
              <Link href="/oyuncular">
                <Button variant="outline">Tüm oyuncular</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
