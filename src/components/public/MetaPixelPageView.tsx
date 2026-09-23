"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackMetaPageView } from "@/lib/analytics/meta-pixel";

/**
 * Fires PageView once per public URL (path + query).
 * Waits briefly for fbq if the base script has not finished loading.
 */
export function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedKey = useRef<string | null>(null);

  useEffect(() => {
    const key = `${pathname}?${searchParams?.toString() ?? ""}`;
    if (lastTrackedKey.current === key) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 50;

    const tryTrack = () => {
      if (cancelled) return;
      if (trackMetaPageView()) {
        lastTrackedKey.current = key;
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        window.setTimeout(tryTrack, 100);
      }
    };

    tryTrack();

    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  return null;
}
