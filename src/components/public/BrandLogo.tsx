import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2", className)}
      aria-label="+Akademi ana sayfa"
    >
      <span className="relative block h-10 w-[148px] overflow-hidden bg-white sm:h-11 sm:w-[168px]">
        <Image
          src="/brand/logo.jpeg"
          alt="+Akademi Oyunculuk & Menajerlik"
          fill
          className="object-contain object-left"
          sizes="168px"
          priority={priority}
        />
      </span>
    </Link>
  );
}
