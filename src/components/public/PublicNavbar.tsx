"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/config/constants";
import { BrandLogo } from "@/components/public/BrandLogo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors",
        scrolled
          ? "border-border bg-[color-mix(in_oklab,var(--bg)_92%,white)] backdrop-blur-md"
          : "border-transparent bg-bg/80 backdrop-blur-sm",
      )}
    >
      <div className="container-wide flex h-16 items-center justify-between gap-4 md:h-[4.25rem]">
        <BrandLogo priority />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/basvuru" className="hidden sm:block">
            <Button size="sm">Oyuncu Başvurusu</Button>
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-border bg-surface lg:hidden"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface lg:hidden">
          <nav className="container-wide flex flex-col py-3" aria-label="Mobil menü">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-1 py-3 text-sm font-medium text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/basvuru" className="mt-2" onClick={() => setOpen(false)}>
              <Button className="w-full">Oyuncu Başvurusu</Button>
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
