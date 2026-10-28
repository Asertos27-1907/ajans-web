import "server-only";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockSiteSettings } from "@/data/mock";
import type { SiteSettings } from "@/types";

const SETTING_KEYS = [
  "general",
  "hero",
  "about",
  "services",
  "social",
  "contact",
  "footer",
] as const;

type SettingKey = (typeof SETTING_KEYS)[number];

function logSettingsError(
  stage: string,
  error: {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null,
) {
  if (!error) return;
  console.warn(`[settings/${stage}]`, {
    message: error.message ?? null,
    code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
  });
}

function splitSettings(settings: SiteSettings): Record<SettingKey, unknown> {
  return {
    general: {
      companyName: settings.companyName,
      agencyName: settings.agencyName,
      logoUrl: settings.logoUrl,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email,
    },
    contact: {
      addressLines: settings.addressLines,
      googleMapsUrl: settings.googleMapsUrl,
      googleMapsEmbedUrl: settings.googleMapsEmbedUrl,
    },
    hero: {
      heroTitle: settings.heroTitle,
      heroDescription: settings.heroDescription,
      heroImageUrl: settings.heroImageUrl,
      ctaText: settings.ctaText,
      ctaLink: settings.ctaLink,
      slides: settings.slides,
    },
    about: {
      aboutTitle: settings.aboutTitle,
      aboutVision: settings.aboutVision,
      aboutParagraphs: settings.aboutParagraphs,
      aboutFeatures: settings.aboutFeatures,
      aboutImageUrl: settings.aboutImageUrl,
      stats: settings.stats,
    },
    services: {
      servicesSectionTitle: settings.servicesSectionTitle,
      services: settings.services,
    },
    social: {
      instagram: settings.instagram,
      facebook: settings.facebook,
      youtube: settings.youtube,
      tiktok: settings.tiktok,
      linkedin: settings.linkedin,
    },
    footer: {
      footerText: settings.footerText,
    },
  };
}

function mergeSettings(
  base: SiteSettings,
  parts: Partial<Record<SettingKey, unknown>>,
): SiteSettings {
  let next = { ...base };
  for (const key of SETTING_KEYS) {
    const value = parts[key];
    if (value && typeof value === "object") {
      next = { ...next, ...(value as Partial<SiteSettings>) };
    }
  }
  return next;
}

/** Invalidate public pages that render site settings (static at build). */
function revalidatePublicSettingsPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/hakkimizda");
  revalidatePath("/hizmetler");
  revalidatePath("/iletisim");
  revalidatePath("/basvuru");
  revalidatePath("/oyuncular");
}

export async function getMergedSiteSettings(): Promise<SiteSettings> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("site_settings")
      .select("key, value");

    if (error) {
      logSettingsError("select", error);
      return structuredClone(mockSiteSettings);
    }

    if (!data?.length) {
      return structuredClone(mockSiteSettings);
    }

    const parts: Partial<Record<SettingKey, unknown>> = {};
    for (const row of data) {
      const key = row.key as SettingKey;
      if (SETTING_KEYS.includes(key)) {
        parts[key] = row.value;
      }
    }

    return mergeSettings(structuredClone(mockSiteSettings), parts);
  } catch (err) {
    console.warn("[settings/select] unexpected", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return structuredClone(mockSiteSettings);
  }
}

export async function saveSiteSettings(
  settings: SiteSettings,
): Promise<SiteSettings> {
  const admin = createAdminClient();
  const parts = splitSettings(settings);
  const now = new Date().toISOString();

  const rows = SETTING_KEYS.map((key) => ({
    key,
    value: parts[key],
    updated_at: now,
  }));

  const { error } = await admin.from("site_settings").upsert(rows, {
    onConflict: "key",
  });

  if (error) {
    logSettingsError("upsert", error);
    throw new Error("save_failed");
  }

  // Public routes are statically generated — invalidate so DB changes appear
  // without a redeploy.
  revalidatePublicSettingsPaths();

  return getMergedSiteSettings();
}
