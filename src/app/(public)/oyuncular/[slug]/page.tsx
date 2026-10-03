import Link from "next/link";
import { notFound } from "next/navigation";
import { getActorBySlug } from "@/lib/actors/service";
import { ActorPhotoGallery } from "@/components/public/ActorPhotoGallery";
import { createMetadata } from "@/lib/seo";
import { fullName } from "@/lib/utils";
import { GENDER_LABELS } from "@/config/constants";
import { Button } from "@/components/ui/Button";

function projectLines(projects: string): string[] {
  return projects
    .split(/\r?\n|;|•/)
    .map((line) => line.replace(/^[-–—*]\s*/, "").trim())
    .filter(Boolean);
}

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
    title: `${name} | +Akademi Oyunculuk & Menajerlik`,
    description: `${name} — ${actor.city} · +Akademi oyuncu portföyü`,
    path: `/oyuncular/${slug}`,
    image: actor.coverPhotoUrl || undefined,
    absolute: true,
  });
}

export default async function ActorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const actor = await getActorBySlug(slug).catch(() => null);
  if (!actor || !actor.showOnWebsite) notFound();

  const name = fullName(actor.firstName, actor.lastName);
  const rows: [string, string][] = [];
  if (actor.age) rows.push(["Yaş", String(actor.age)]);
  if (actor.city) rows.push(["Şehir", actor.city]);
  if (actor.gender) rows.push(["Cinsiyet", GENDER_LABELS[actor.gender]]);
  if (actor.heightCm) rows.push(["Boy", `${actor.heightCm} cm`]);
  if (actor.hairColor) rows.push(["Saç rengi", actor.hairColor]);
  if (actor.eyeColor) rows.push(["Göz rengi", actor.eyeColor]);

  const projects = projectLines(actor.projects);

  return (
    <div>
      <section className="border-b border-border bg-secondary text-white">
        <div className="container-wide py-10 md:py-14">
          <p className="eyebrow text-white/55">Oyuncu profili</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {name}
          </h1>
          <p className="mt-3 text-white/70">
            {[actor.city, actor.age ? String(actor.age) : ""]
              .filter(Boolean)
              .join(" · ") || " +Akademi"}
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <ActorPhotoGallery actor={actor} />

          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {name}
            </h2>
            <p className="mt-1 text-sm tracking-wider text-ink-soft uppercase">
              Oyuncu
            </p>

            {rows.length ? (
              <dl className="mt-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                {rows.map(([k, v]) => (
                  <div key={k} className="border-t border-border pt-3">
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="mt-1 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {actor.experience ? (
              <section className="mt-10">
                <h3 className="text-lg font-semibold">Deneyim</h3>
                <p className="mt-3 max-w-prose text-sm leading-relaxed whitespace-pre-line text-ink-muted">
                  {actor.experience}
                </p>
              </section>
            ) : null}

            {projects.length ? (
              <section className="mt-10">
                <h3 className="text-lg font-semibold">Yer Aldığı Projeler</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                  {projects.map((line) => (
                    <li
                      key={line}
                      className="border-l-2 border-primary/40 pl-3 leading-relaxed"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
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
