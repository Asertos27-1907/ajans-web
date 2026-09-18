import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export const SIGNED_URL_TTL_SECONDS = 3600;

export async function createSignedUrlMap(
  bucket: string,
  paths: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!paths.length) return map;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return map;

  data.forEach((item, index) => {
    const path = item.path || paths[index];
    const url = item.signedUrl;
    if (path && url) map.set(path, url);
  });

  return map;
}

export function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!(IMAGE_MIME as readonly string[]).includes(file.type)) {
    return "Sadece JPG, PNG veya WEBP yükleyebilirsiniz";
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return "Her dosya en fazla 10 MB olabilir";
  }
  return null;
}
