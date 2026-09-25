/**
 * Meta Pixel helpers — public site only.
 * Pixel ID: prefer NEXT_PUBLIC_META_PIXEL_ID (see .env.example).
 */

export const META_PIXEL_SCRIPT_SRC =
  "https://connect.facebook.net/en_US/fbevents.js";

/** Public browser config — must match Events Manager Pixel ID. */
export const META_PIXEL_ID =
  (typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()
    : undefined) || "936307082890625";

type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: IArguments[];
  loaded?: boolean;
  version?: string;
  push: FbqFunction;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
    __META_PIXEL_INITIALIZED__?: string;
  }
}

const SCRIPT_ATTR = "data-meta-pixel";

/** Last PageView path key — module scope avoids Strict Mode remount duplicates. */
let lastPageViewKey: string | null = null;

/**
 * Official Meta Pixel bootstrap (matches Meta snippet).
 * Creates window.fbq immediately; queues calls until fbevents.js loads.
 */
export function ensureMetaPixel(): boolean {
  if (typeof window === "undefined") return false;
  if (!META_PIXEL_ID) return false;

  const f = window;

  if (typeof f.fbq !== "function") {
    // Exact Meta stub shape — use `arguments`, set push=self.
    const n = function (this: unknown) {
      // eslint-disable-next-line prefer-rest-params
      const args = arguments as unknown as IArguments;
      if (n.callMethod) {
        // Meta fbevents expects apply(this, arguments) — do not rewrite to spread.
        // eslint-disable-next-line prefer-spread
        n.callMethod.apply(n, args as unknown as unknown[]);
      } else {
        n.queue.push(args);
      }
    } as FbqFunction;

    n.queue = [];
    n.loaded = true;
    n.version = "2.0";
    n.push = n;

    f.fbq = n;
    if (!f._fbq) f._fbq = n;
  }

  if (!document.querySelector(`script[${SCRIPT_ATTR}]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = META_PIXEL_SCRIPT_SRC;
    script.setAttribute(SCRIPT_ATTR, "1");
    const first = document.getElementsByTagName("script")[0];
    if (first?.parentNode) {
      first.parentNode.insertBefore(script, first);
    } else {
      (document.head || document.documentElement).appendChild(script);
    }
  }

  // Init once per page lifetime / pixel id.
  if (f.__META_PIXEL_INITIALIZED__ !== META_PIXEL_ID) {
    f.fbq!("init", META_PIXEL_ID);
    f.__META_PIXEL_INITIALIZED__ = META_PIXEL_ID;
  }

  return typeof f.fbq === "function";
}

/**
 * PageView for a route key (pathname + optional search).
 * Skips duplicate for the same key; fires again when the key changes.
 */
export function trackMetaPageView(pathKey?: string): boolean {
  if (typeof window === "undefined") return false;
  if (!ensureMetaPixel()) return false;

  const key =
    pathKey ??
    `${window.location.pathname}${window.location.search || ""}`;

  if (lastPageViewKey === key) return false;

  const fbq = window.fbq;
  if (typeof fbq !== "function") return false;

  fbq("track", "PageView");
  lastPageViewKey = key;
  return true;
}

/**
 * Lead — only call after a successful public application save.
 * Does not touch PageView / init beyond ensuring the pixel exists.
 */
export function trackApplicationLead(): boolean {
  if (typeof window === "undefined") return false;
  if (!ensureMetaPixel()) return false;

  const fbq = window.fbq;
  if (typeof fbq !== "function") return false;

  fbq("track", "Lead");
  return true;
}
