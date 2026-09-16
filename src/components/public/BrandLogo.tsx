import Image from "next/image";
import Link from "next/link";
import { SITE_IMAGES } from "@/config/site-images";
import { cn } from "@/lib/utils";

type LogoSize = "nav" | "hero" | "footer";

const sizeClass: Record<LogoSize, string> = {
  // Mobile ~44–52px height, desktop ~60–72px
  nav: "h-11 w-[148px] sm:h-14 sm:w-[190px] md:h-16 md:w-[220px]",
  // Mobile ~120–170px wide, desktop ~180–260px
  hero: "h-[52px] w-[140px] sm:h-[72px] sm:w-[200px] md:h-[84px] md:w-[240px]",
  footer: "h-11 w-[150px] sm:h-12 sm:w-[170px]",
};

export function BrandLogo({
  className,
  priority,
  size = "nav",
}: {
  className?: string;
  priority?: boolean;
  size?: LogoSize;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label="+Akademi ana sayfa"
    >
      <span className={cn("relative block overflow-hidden", sizeClass[size])}>
        <Image
          src={SITE_IMAGES.brand.logo}
          alt="+Akademi Oyunculuk & Menajerlik"
          fill
          className="object-contain object-left"
          sizes={
            size === "hero"
              ? "(max-width:640px) 160px, 240px"
              : size === "nav"
                ? "(max-width:640px) 148px, 220px"
                : "170px"
          }
          priority={priority}
        />
      </span>
    </Link>
  );
}
