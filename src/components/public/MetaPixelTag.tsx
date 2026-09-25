"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  META_PIXEL_ID,
  ensureMetaPixel,
  trackMetaPageView,
} from "@/lib/analytics/meta-pixel";

/**
 * Meta Pixel — public pages only (mounted from (public)/layout).
 * Bootstraps fbq + fbevents.js once; PageView on each distinct pathname.
 * Dashboard / login / update-password never mount this component.
 */
export function MetaPixelTag() {
  const pathname = usePathname();

  useEffect(() => {
    ensureMetaPixel();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    ensureMetaPixel();
    trackMetaPageView(pathname);
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
