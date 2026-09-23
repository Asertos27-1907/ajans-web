export const META_PIXEL_ID = "936307082890625";
export const META_PIXEL_SCRIPT_SRC =
  "https://connect.facebook.net/en_US/fbevents.js";

type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded?: boolean;
  version?: string;
  push: (...args: unknown[]) => number;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
    __META_PIXEL_INITIALIZED__?: boolean;
  }
}

const SCRIPT_ATTR = "data-meta-pixel";

/**
 * Creates the fbq stub + loads fbevents.js + inits the pixel once.
 * Safe to call repeatedly; typeof window.fbq becomes "function" immediately.
 */
export function ensureMetaPixel(): boolean {
  if (typeof window === "undefined") return false;

  const w = window;

  if (typeof w.fbq !== "function") {
    const n = function (...args: unknown[]) {
      if (n.callMethod) {
        n.callMethod(...args);
      } else {
        n.queue.push(args);
      }
    } as FbqFunction;

    n.queue = [];
    n.loaded = true;
    n.version = "2.0";
    n.push = (...args: unknown[]) => n.queue.push(args);

    w.fbq = n;
    if (!w._fbq) w._fbq = n;
  }

  if (!document.querySelector(`script[${SCRIPT_ATTR}]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = META_PIXEL_SCRIPT_SRC;
    script.setAttribute(SCRIPT_ATTR, META_PIXEL_ID);
    const first = document.getElementsByTagName("script")[0];
    if (first?.parentNode) {
      first.parentNode.insertBefore(script, first);
    } else {
      document.head.appendChild(script);
    }
  }

  if (!w.__META_PIXEL_INITIALIZED__) {
    w.fbq!("init", META_PIXEL_ID);
    w.__META_PIXEL_INITIALIZED__ = true;
  }

  return typeof w.fbq === "function";
}

/**
 * Fires Meta Lead once a successful application has been saved.
 * Safe no-op when fbq is unavailable (e.g. blocked scripts).
 */
export function trackApplicationLead(): boolean {
  if (typeof window === "undefined") return false;
  ensureMetaPixel();
  const fbq = window.fbq;
  if (typeof fbq !== "function") return false;

  fbq("track", "Lead");
  return true;
}

/**
 * Fires Meta PageView. Safe no-op when fbq is unavailable.
 */
export function trackMetaPageView(): boolean {
  if (typeof window === "undefined") return false;
  ensureMetaPixel();
  const fbq = window.fbq;
  if (typeof fbq !== "function") return false;

  fbq("track", "PageView");
  return true;
}
