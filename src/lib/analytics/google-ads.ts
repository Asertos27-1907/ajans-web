export const GOOGLE_ADS_ID = "AW-11032333324";

/** Oyuncu Başvurusu conversion send_to */
export const GOOGLE_ADS_APPLICATION_CONVERSION_SEND_TO =
  "AW-11032333324/jhR9CLP214IdEIyY0Iwp";

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

/**
 * Fires Google Ads conversion once per successful application submit.
 * Safe no-op when gtag is unavailable (e.g. blocked scripts).
 */
export function trackApplicationConversion(): boolean {
  if (typeof window === "undefined") return false;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return false;

  gtag("event", "conversion", {
    send_to: GOOGLE_ADS_APPLICATION_CONVERSION_SEND_TO,
  });
  return true;
}
