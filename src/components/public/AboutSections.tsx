"use client";

import Image from "next/image";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SITE_IMAGES } from "@/config/site-images";

const SECTIONS = [
  {
    id: "biz-kimiz",
    title: "Biz Kimiz",
    text: "+Akademi, oyunculuk eğitimi, cast, menajerlik ve prodüksiyon alanlarını aynı çatı altında buluşturan profesyonel bir oluşumdur. Sektörün ihtiyaçlarını yakından takip eden ekibimizle, farklı yaş ve deneyim seviyelerindeki yeteneklere kariyerlerinin her aşamasında destek oluyoruz.",
  },
  {
    id: "yaklasimimiz",
    title: "Yaklaşımımız",
    text: "Her oyuncunun hikâyesi ve potansiyeli farklıdır. Bu nedenle standart çözümler yerine kişiye özel gelişim ve temsil anlayışını benimsiyoruz. Eğitim, yönlendirme ve proje eşleştirme süreçlerini adayın güçlü yönlerine göre şekillendiriyoruz.",
  },
  {
    id: "neler-yapiyoruz",
    title: "Neler Yapıyoruz",
    text: "Yeni yeteneklerin keşfedilmesinden oyunculuk eğitimlerine, cast süreçlerinden menajerlik ve prodüksiyon çalışmalarına kadar sektörün farklı alanlarında hizmet veriyoruz. Yapım şirketleri, reklam ajansları ve profesyonel prodüksiyon ekipleriyle kurulacak doğru bağlantıların kariyer gelişiminde önemli olduğuna inanıyoruz.",
  },
  {
    id: "neden",
    title: "Neden +Akademi",
    text: "Alanında deneyimli profesyonellerle çalışıyor, adayların yalnızca bugünkü projelere değil, uzun vadeli kariyer hedeflerine hazırlanmasına önem veriyoruz. Güvenilir iletişim, doğru yönlendirme ve sürekli gelişim yaklaşımı çalışma kültürümüzün temelini oluşturuyor.",
  },
] as const;

export function AboutSections({ aboutImageUrl }: { aboutImageUrl: string }) {
  return (
    <>
      <section className="section-pad">
        <div className="container-wide grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal
            direction="left"
            className="frame-corner relative aspect-[4/5] overflow-hidden bg-bg-muted lg:col-span-5"
          >
            <Image
              src={aboutImageUrl || SITE_IMAGES.about.main}
              alt="+Akademi ofis ve prodüksiyon atmosferi"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 42vw"
              priority
            />
          </Reveal>
          <div className="lg:col-span-7">
            <Reveal direction="up">
              <p className="eyebrow">Biz Kimiz</p>
              <h2 className="font-display title-accent mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                {SECTIONS[0].title}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-ink-muted md:text-lg">
                {SECTIONS[0].text}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-pad bg-bg-muted decor-geo">
        <div className="container-wide">
          <Stagger className="grid gap-10 md:grid-cols-3">
            {SECTIONS.slice(1).map((section) => (
              <article key={section.id} className="border-l-2 border-primary pl-5">
                <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                  {section.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted md:text-base">
                  {section.text}
                </p>
              </article>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
