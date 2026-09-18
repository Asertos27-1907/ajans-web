const PLACEHOLDER_RE =
  /^(BURAYA_|YOUR_|REPLACE_|CHANGE_ME|PLACEHOLDER|xxx+$)/i;

function looksLikePlaceholder(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (PLACEHOLDER_RE.test(v)) return true;
  if (/^BURAYA_/i.test(v)) return true;
  return false;
}

export function getSupabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
}

export function getSupabasePublishableKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
}

/** Returns a Turkish user-facing message when public env is missing/placeholder. */
export function getPublicSupabaseConfigError(): string | null {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();

  if (!url || looksLikePlaceholder(url)) {
    return "Supabase yapılandırması eksik. NEXT_PUBLIC_SUPABASE_URL değerini kontrol edin.";
  }

  try {
    void new URL(url);
  } catch {
    return "Supabase yapılandırması geçersiz. NEXT_PUBLIC_SUPABASE_URL değerini kontrol edin.";
  }

  if (!key || looksLikePlaceholder(key)) {
    return "Supabase yapılandırması eksik. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY değerini .env.local içinde gerçek anahtarla güncelleyin ve sunucuyu yeniden başlatın.";
  }

  return null;
}
