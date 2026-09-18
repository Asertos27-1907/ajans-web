import type { SiteSettings } from "@/types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "İşlem başarısız.");
  }
  return data;
}

/** Dashboard client settings API */
export const settingsRepository = {
  async get(): Promise<SiteSettings> {
    const res = await fetch("/api/dashboard/settings", {
      credentials: "same-origin",
      cache: "no-store",
    });
    return parseJson(res);
  },

  async update(payload: SiteSettings): Promise<SiteSettings> {
    const res = await fetch("/api/dashboard/settings", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return parseJson(res);
  },
};
