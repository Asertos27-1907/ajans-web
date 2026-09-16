import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import { BrandLogo } from "@/components/public/BrandLogo";
import { NAV_LINKS } from "@/config/constants";
import { hasValue } from "@/lib/utils";
import type { SiteSettings } from "@/types";

export function PublicFooter({ settings }: { settings: SiteSettings }) {
  const socials = [
    { href: settings.instagram, label: "Instagram", Icon: Instagram },
    { href: settings.facebook, label: "Facebook", Icon: Facebook },
  ].filter((s) => hasValue(s.href));

  return (
    <footer className="border-t border-border bg-bg-deep text-[#f3efe8]">
      <div className="container-wide grid gap-8 py-12 sm:gap-10 sm:py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="min-w-0">
          <div className="inline-flex rounded-sm bg-white/95 p-1.5 sm:p-2">
            <BrandLogo variant="footer" />
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">
            {settings.footerText}
          </p>
          {socials.length > 0 ? (
            <div className="mt-5 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-white/45 uppercase">
            Menü
          </p>
          <ul className="mt-4 space-y-1 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-11 items-center text-white/75 hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/basvuru"
                className="inline-flex min-h-11 items-center text-white/75 hover:text-white"
              >
                Oyuncu Başvurusu
              </Link>
            </li>
          </ul>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.14em] text-white/45 uppercase">
            İletişim
          </p>
          <address className="mt-4 space-y-1 text-sm not-italic text-white/75">
            {settings.addressLines.map((line) => (
              <p key={line} className="break-words">
                {line}
              </p>
            ))}
          </address>
          <div className="mt-4 space-y-1 text-sm">
            {hasValue(settings.phone) ? (
              <a
                href={`tel:${settings.phone}`}
                className="block break-all text-white/75 hover:text-white"
              >
                {settings.phone}
              </a>
            ) : null}
            {hasValue(settings.email) ? (
              <a
                href={`mailto:${settings.email}`}
                className="block break-all text-white/75 hover:text-white"
              >
                {settings.email}
              </a>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/50">
            <Link href="/kvkk" className="inline-flex min-h-11 items-center hover:text-white">
              KVKK
            </Link>
            <Link
              href="/gizlilik"
              className="inline-flex min-h-11 items-center hover:text-white"
            >
              Gizlilik
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.companyName}</p>
          <p>İzmir</p>
        </div>
      </div>
    </footer>
  );
}
