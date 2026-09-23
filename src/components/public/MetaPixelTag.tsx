"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  META_PIXEL_ID,
  ensureMetaPixel,
  trackMetaPageView,
} from "@/lib/analytics/meta-pixel";

/**
 * Meta Pixel — public pages only (mounted from (public)/layout).
 * Bootstraps window.fbq in the browser (Chrome/Edge/Opera safe),
 * loads fbevents.js once, inits once, and tracks PageView per pathname.
 */
export function MetaPixelTag() {
  const pathname = usePathname();
  const lastPageViewPath = useRef<string | null>(null);

  useEffect(() => {
    ensureMetaPixel();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    if (lastPageViewPath.current === pathname) return;

    ensureMetaPixel();
    if (trackMetaPageView()) {
      lastPageViewPath.current = pathname;
    }
  }, [pathname]);

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
