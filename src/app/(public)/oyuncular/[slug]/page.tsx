import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { actorRepository } from "@/lib/repositories";
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
  const actor = await actorRepository.getBySlug(slug);
  if (!actor) return createMetadata({ title: "Oyuncu", path: `/oyuncular/${slug}` });
  const name = fullName(actor.firstName, actor.lastName);
  return createMetadata({
    title: name,
    description: actor.bio.slice(0, 150),
    path: `/oyuncular/${slug}`,
    image: actor.coverPhotoUrl,
  });
}

export default async function ActorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const actor = await actorRepository.getBySlug(slug);
  if (!actor) notFound();

  return (
    <div className="section-pad">
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
                <div key={photo.id} className="relative aspect-square overflow-hidden bg-bg-muted">
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
          <p className="eyebrow">Oyuncu profili</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">
            {fullName(actor.firstName, actor.lastName)}
          </h1>
          <p className="mt-2 text-ink-muted">
            {actor.city} · {actor.age} yaş · {GENDER_LABELS[actor.gender]}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            {[
              ["Boy", `${actor.heightCm} cm`],
              ["Kilo", `${actor.weightKg} kg`],
              ["Saç", actor.hairColor],
              ["Göz", actor.eyeColor],
              ["Beden", actor.bodySize],
              ["Şehir", actor.city],
            ].map(([k, v]) => (
              <div key={k} className="border-t border-border pt-3">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="mt-1 font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 space-y-6">
            <section>
              <h2 className="text-lg font-semibold">Biyografi</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{actor.bio}</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold">Deneyimler</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {actor.experiences}
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold">Projeler</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {actor.projects}
              </p>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/iletisim">
              <Button>İletişime geç</Button>
            </Link>
            <Link href="/oyuncular">
              <Button variant="outline">Tüm oyuncular</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
