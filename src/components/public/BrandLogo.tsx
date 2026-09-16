import Image from "next/image";
import Link from "next/link";
import { SITE_IMAGES } from "@/config/site-images";
import { cn } from "@/lib/utils";

/** Cropped logo mark ≈ 1399×653 (≈2.14:1). */
const LOGO_ASPECT = "aspect-[1399/653]";

const sizeClass = {
  nav: cn(
    LOGO_ASPECT,
    "h-[48px] w-auto",
    "sm:h-[54px]",
    "md:h-[62px]",
    "lg:h-[70px]",
  ),
  hero: cn(
    LOGO_ASPECT,
    "h-auto w-[min(158px,78vw)]",
    "sm:w-[180px]",
    "md:w-[228px]",
    "lg:w-[252px]",
  ),
  footer: cn(LOGO_ASPECT, "h-[50px] w-auto sm:h-[58px]"),
} as const;

export type BrandLogoVariant = keyof typeof sizeClass;

export function BrandLogo({
  className,
  priority,
  variant = "nav",
  href = "/",
}: {
  className?: string;
  priority?: boolean;
  variant?: BrandLogoVariant;
  href?: string | null;
}) {
  const mark = (
    <span className={cn("relative block overflow-hidden", sizeClass[variant])}>
      <Image
        src={SITE_IMAGES.brand.logo}
        alt="+Akademi Oyunculuk & Menajerlik"
        fill
        className="object-contain object-center"
        sizes={
          variant === "hero"
            ? "(max-width:640px) 158px, (max-width:1024px) 228px, 252px"
            : variant === "footer"
              ? "170px"
              : "(max-width:640px) 140px, (max-width:1024px) 170px, 200px"
        }
        priority={priority}
      />
    </span>
  );

  if (href === null) {
    return (
      <span className={cn("inline-flex items-center", className)}>{mark}</span>
    );
  }

  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label="+Akademi ana sayfa"
    >
      {mark}
    </Link>
  );
}
