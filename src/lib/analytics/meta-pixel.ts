export const META_PIXEL_ID = "936307082890625";

type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

/**
 * Fires Meta Lead once a successful application has been saved.
 * Safe no-op when fbq is unavailable (e.g. blocked scripts).
 */
export function trackApplicationLead(): boolean {
  if (typeof window === "undefined") return false;
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
  const fbq = window.fbq;
  if (typeof fbq !== "function") return false;

  fbq("track", "PageView");
  return true;
}
