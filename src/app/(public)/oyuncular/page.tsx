import Image from "next/image";
import { listPublicActors } from "@/lib/actors/service";
import { ActorsRoster } from "@/components/public/ActorsRoster";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Oyuncularımız | +Akademi Oyunculuk & Menajerlik",
  description:
    "+Akademi bünyesindeki profesyonel oyuncuları ve yetenekleri keşfedin.",
  path: "/oyuncular",
  absolute: true,
});

export default async function ActorsPage() {
  const result = await listPublicActors(1, 200).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    pageSize: 200,
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
            Oyuncularımız
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            +Akademi bünyesindeki oyuncularımızı keşfedin. Cast ve menajerlik
            için profesyonel yetenek portföyümüz.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide">
          <ActorsRoster actors={result.data} />
        </div>
      </section>
    </div>
  );
}
