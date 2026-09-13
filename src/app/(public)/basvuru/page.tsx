import { ApplicationWizard } from "@/components/forms/ApplicationWizard";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Oyuncu Başvurusu",
  description:
    "+Akademi oyuncu, model ve yetenek başvuru formu. Birkaç adımda başvurunu tamamla.",
  path: "/basvuru",
});

export default function ApplicationPage() {
  return (
    <div>
      <section className="border-b border-border bg-bg-warm/50">
        <div className="container-site py-12 md:py-16">
          <p className="eyebrow">Başvuru</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Oyuncu Başvurusu
          </h1>
          <p className="mt-4 max-w-2xl text-ink-muted">
            Formu adım adım doldurun. 18 yaş altı başvurular için veli bilgileri
            zorunludur. Medya yüklemeleri şu an demo modundadır.
          </p>
        </div>
      </section>
      <section className="section-pad pt-10">
        <div className="container-site">
          <ApplicationWizard />
        </div>
      </section>
    </div>
  );
}
