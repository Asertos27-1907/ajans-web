import Image from "next/image";
import { listReferences } from "@/lib/references/service";
import { createMetadata } from "@/lib/seo";
import { CATEGORY_LABELS } from "@/config/constants";
import { EmptyState } from "@/components/ui/StatusBadge";

export const metadata = createMetadata({
  title: "Referanslar",
  description: "+Akademi referans proje ve prodüksiyon çalışmaları.",
  path: "/referanslar",
});

export default async function ReferencesPage() {
  const items = await listReferences()
    .then((rows) => rows.filter((r) => r.isActive))
    .catch(() => []);

  return (
    <div>
      <section className="relative overflow-hidden bg-secondary text-white">
        <div className="pointer-events-none absolute -top-4 right-10 h-24 w-24 rotate-12 border border-white/10" />
        <div className="container-wide py-14 md:py-20">
          <p className="eyebrow text-white/50">Referanslar</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Projelerimizden seçkiler
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">
            Dizi, sinema, reklam ve prodüksiyon çalışmalarından örnekler.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide">
          {!items.length ? (
            <EmptyState title="Referans bulunamadı" />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="group overflow-hidden bg-surface">
                  <div className="relative aspect-[16/10] overflow-hidden bg-bg-muted">
                    <Image
                      src={item.coverImageUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                    <div className="absolute top-3 left-3 bg-primary px-2 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
                      {CATEGORY_LABELS[item.category]}
                    </div>
                  </div>
                  <div className="border border-t-0 border-border p-5">
                    <p className="text-xs tracking-wide text-ink-soft uppercase">
                      {item.year}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm text-ink-muted">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
