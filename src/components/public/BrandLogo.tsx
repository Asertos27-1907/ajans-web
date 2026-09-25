import Image from "next/image";
import Link from "next/link";
import { SITE_IMAGES } from "@/config/site-images";
import { cn } from "@/lib/utils";

/** Horizontal logo aspect ≈ 1024×341 */
const LOGO_ASPECT = "aspect-[1024/341]";

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
      ? cn(
          "relative block h-11 w-auto bg-white sm:h-12",
          LOGO_ASPECT,
        )
      : cn(
          "relative block h-10 w-auto bg-white sm:h-11",
          LOGO_ASPECT,
        );

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
          className="object-contain object-left"
          sizes={
            size === "nav"
              ? "(max-width: 640px) 176px, 200px"
              : "(max-width: 640px) 160px, 176px"
          }
          priority={priority}
        />
      </span>
    </Link>
  );
}
