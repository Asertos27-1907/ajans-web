import Image from "next/image";
import Link from "next/link";
import { SITE_IMAGES } from "@/config/site-images";
import { cn } from "@/lib/utils";

/**
 * Logo JPEG is 1536×1024 with large vertical padding.
 * Visible mark is ~1362×608 (≈2.24:1). Containers use that
 * aspect with object-cover so the mark fills the box.
 */
const LOGO_ASPECT = "aspect-[1362/608]";

const sizeClass = {
  nav: cn(
    LOGO_ASPECT,
    "h-[46px] w-auto",
    "sm:h-[52px]",
    "md:h-[60px]",
    "lg:h-[68px]",
  ),
  hero: cn(
    LOGO_ASPECT,
    "h-auto w-[min(148px,72vw)]",
    "sm:w-[168px]",
    "md:w-[220px]",
    "lg:w-[248px]",
  ),
  footer: cn(LOGO_ASPECT, "h-[48px] w-auto sm:h-[56px]"),
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
        className="object-cover object-center"
        sizes={
          variant === "hero"
            ? "(max-width:640px) 148px, (max-width:1024px) 220px, 248px"
            : variant === "footer"
              ? "160px"
              : "(max-width:640px) 120px, (max-width:1024px) 150px, 190px"
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
