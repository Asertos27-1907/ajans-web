/**
 * Normalize Turkish phone numbers to canonical digits: 905XXXXXXXXX
 */
export function normalizePhoneTR(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("90") && digits.length === 12) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length === 11) {
    return `90${digits.slice(1)}`;
  }

  if (digits.length === 10 && digits.startsWith("5")) {
    return `90${digits}`;
  }

  // Already international without leading zeros, 11–13 digits starting with 90
  if (digits.startsWith("90") && digits.length >= 12 && digits.length <= 13) {
    return digits.slice(0, 12);
  }

  return null;
}

/** Display: 0532 123 45 67 */
export function formatPhoneDisplay(normalizedOrRaw: string | null | undefined): string {
  const normalized = normalizePhoneTR(normalizedOrRaw);
  if (!normalized || normalized.length !== 12) {
    return (normalizedOrRaw || "").trim();
  }
  const national = `0${normalized.slice(2)}`;
  return `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7, 9)} ${national.slice(9, 11)}`;
}

/** tel: link href */
export function phoneTelHref(normalizedOrRaw: string | null | undefined): string {
  const normalized = normalizePhoneTR(normalizedOrRaw);
  if (normalized) return `tel:+${normalized}`;
  const digits = (normalizedOrRaw || "").replace(/\D/g, "");
  return digits ? `tel:${digits}` : "#";
}

export function isValidTRMobile(normalized: string | null): boolean {
  return Boolean(normalized && /^905\d{9}$/.test(normalized));
}
