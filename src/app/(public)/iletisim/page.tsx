import { getMergedSiteSettings } from "@/lib/settings/service";
import { createMetadata } from "@/lib/seo";
import { hasValue } from "@/lib/utils";
import ContactForm from "@/components/forms/ContactForm";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
// Contact layout: info + map from siteSettings

export const metadata = createMetadata({
  title: "İletişim | +Akademi Oyunculuk & Menajerlik",
  description:
    "+Akademi Oyunculuk & Menajerlik İzmir Konak / Alsancak ofisiyle iletişime geçin. Adres, sosyal medya ve iletişim bilgilerine ulaşın.",
  path: "/iletisim",
  absolute: true,
});

export default async function ContactPage() {
  const settings = await getMergedSiteSettings();

  const socials = [
    { href: settings.instagram, label: "Instagram", Icon: Instagram },
    { href: settings.facebook, label: "Facebook", Icon: Facebook },
    { href: settings.tiktok, label: "TikTok", Icon: ClapperIcon },
    { href: settings.youtube, label: "YouTube", Icon: Youtube },
    { href: settings.linkedin, label: "LinkedIn", Icon: Linkedin },
  ].filter((s) => hasValue(s.href));

  return (
    <div>
      <section className="border-b border-border bg-bg-muted/50">
        <div className="container-wide py-14 md:py-16">
          <p className="eyebrow">İletişim</p>
          <h1 className="font-display title-accent mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            İletişim
          </h1>
          <p className="mt-4 max-w-2xl text-ink-muted">
            +Akademi Oyunculuk & Menajerlik İzmir Konak, Alsancak ofisinde
            casting talepleri, iş ortaklığı ve genel sorularınız için formu
            kullanabilir veya ofisimizi ziyaret edebilirsiniz.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="text-xl font-semibold">İzmir ofisimiz</h2>
            <address className="mt-4 space-y-1 text-base not-italic text-ink-muted">
              {settings.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </address>

            <div className="mt-6 space-y-2 text-sm">
              {hasValue(settings.phone) ? (
                <p>
                  <span className="text-ink-soft">Telefon: </span>
                  <a
                    href={`tel:${settings.phone}`}
                    className="cursor-pointer font-medium text-ink hover:text-primary"
                  >
                    {settings.phone}
                  </a>
                </p>
              ) : null}
              {hasValue(settings.email) ? (
                <p>
                  <span className="text-ink-soft">E-posta: </span>
                  <a
                    href={`mailto:${settings.email}`}
                    className="cursor-pointer font-medium text-ink hover:text-primary"
                  >
                    {settings.email}
                  </a>
                </p>
              ) : null}
              {hasValue(settings.whatsapp) ? (
                <p>
                  <span className="text-ink-soft">WhatsApp: </span>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer font-medium text-ink hover:text-primary"
                  >
                    {settings.whatsapp}
                  </a>
                </p>
              ) : null}
            </div>

            {socials.length ? (
              <div className="mt-8">
                <p className="text-sm font-medium text-ink">Sosyal medya</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socials.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded border border-border text-ink-muted transition-colors duration-200 hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-10">
              <ContactForm />
            </div>
          </div>

          <div className="min-h-[320px] overflow-hidden border border-border bg-bg-muted lg:min-h-[520px]">
            {hasValue(settings.googleMapsEmbedUrl) ? (
              <iframe
                title="+Akademi konum haritası"
                src={settings.googleMapsEmbedUrl}
                className="h-full min-h-[320px] w-full border-0 lg:min-h-[520px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center p-8 text-center text-sm text-ink-muted">
                Harita bağlantısı henüz eklenmedi. Dashboard → Firma Bilgileri
                alanından Google Maps Embed URL girilebilir.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ClapperIcon(props: { size?: number }) {
  return (
    <svg
      width={props.size ?? 18}
      height={props.size ?? 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4.2c1.1-.3 2.2.3 2.5 1.3Z" />
      <path d="m6.2 5.3 3.1 4.1" />
      <path d="m11.1 3.8 3.1 4.1" />
      <path d="M3 11v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9" />
    </svg>
  );
}
