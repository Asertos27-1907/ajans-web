import Image from "next/image";
import Link from "next/link";
import { SITE_IMAGES } from "@/config/site-images";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  priority,
  size = "default",
}: {
  className?: string;
  priority?: boolean;
  /** `nav` fills the public header better without growing header height. */
  size?: "default" | "nav";
}) {
  const frame =
    size === "nav"
      ? "relative block h-12 w-[11.75rem] overflow-hidden bg-white sm:h-[3.25rem] sm:w-[13.75rem]"
      : "relative block h-10 w-[148px] overflow-hidden bg-white sm:h-11 sm:w-[168px]";

  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label="+Akademi ana sayfa"
    >
      <span className={frame}>
        <Image
          src={SITE_IMAGES.brand.logo}
          alt="+Akademi Oyunculuk & Menajerlik"
          fill
          className={cn(
            "object-contain object-left",
            // Crop baked-in white padding so the mark reads larger.
            size === "nav"
              ? "origin-left scale-[1.28]"
              : "origin-left scale-[1.12]",
          )}
          sizes={size === "nav" ? "(max-width: 640px) 188px, 220px" : "168px"}
          priority={priority}
        />
      </span>
    </Link>
  );
}
