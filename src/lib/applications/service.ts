import "server-only";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  APPLICATION_PHOTOS_BUCKET,
  ALLOWED_PHOTO_MIME,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  MIN_PHOTOS,
  SIGNED_URL_TTL_SECONDS,
  applicationFieldsSchema,
  applicationUpdateSchema,
  type ApplicationFieldsInput,
} from "@/lib/applications/schema";
import {
  mapApplication,
  mapPhoto,
  APPLICATION_SELECT,
  type DbApplicationPhotoRow,
  type DbApplicationRow,
} from "@/lib/applications/map";
import type {
  Application,
  ApplicationFilters,
  ApplicationStatus,
  PaginatedResult,
} from "@/types";

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function resolvePhotoMime(file: File): string | null {
  if ((ALLOWED_PHOTO_MIME as readonly string[]).includes(file.type)) {
    return file.type;
  }
  // Some browsers leave File.type empty; fall back to extension.
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return null;
}

function validatePhotoFiles(
  files: File[],
  options: { min?: number; maxRemaining?: number } = {},
): string | null {
  const min = options.min ?? MIN_PHOTOS;
  const max = options.maxRemaining ?? MAX_PHOTOS;

  if (files.length < min) {
    return min === 1
      ? "En az 1 fotoğraf gerekli"
      : `En az ${min} fotoğraf gerekli`;
  }
  if (files.length > max) {
    return max < MAX_PHOTOS
      ? `En fazla ${max} fotoğraf daha ekleyebilirsiniz`
      : "En fazla 5 fotoğraf yükleyebilirsiniz";
  }

  for (const file of files) {
    if (!resolvePhotoMime(file)) {
      return "Sadece JPG, PNG veya WEBP fotoğraf yükleyebilirsiniz";
    }
    if (file.size <= 0 || file.size > MAX_PHOTO_BYTES) {
      return "Her fotoğraf en fazla 10 MB olabilir";
    }
  }

  return null;
}

function logApplicationError(
  stage: string,
  error: {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
    statusCode?: string | number;
    name?: string;
  } | null,
) {
  if (process.env.NODE_ENV !== "development" || !error) return;
  console.warn(`[applications/${stage}]`, {
    message: error.message ?? null,
    code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
    statusCode: error.statusCode ?? null,
    name: error.name ?? null,
  });
}

function mapDbPermissionMessage(error: {
  message?: string;
  code?: string;
  hint?: string;
} | null): string | null {
  if (!error) return null;
  const blob = `${error.message ?? ""} ${error.hint ?? ""} ${error.code ?? ""}`.toLowerCase();
  if (
    error.code === "42501" ||
    blob.includes("permission denied") ||
    blob.includes("grant ")
  ) {
    return "Başvuru veritabanı erişim izni eksik. Supabase SQL Editor'da src/lib/applications/fix-applications-access.sql dosyasını çalıştırın.";
  }
  return null;
}

async function cleanupApplication(
  applicationId: string,
  storagePaths: string[],
) {
  const admin = createAdminClient();

  if (storagePaths.length) {
    await admin.storage.from(APPLICATION_PHOTOS_BUCKET).remove(storagePaths);
  }

  await admin.from("application_photos").delete().eq("application_id", applicationId);
  await admin.from("applications").delete().eq("id", applicationId);
}

async function signPaths(
  paths: string[],
): Promise<Map<string, string>> {
  const admin = createAdminClient();
  const map = new Map<string, string>();
  if (!paths.length) return map;

  const { data, error } = await admin.storage
    .from(APPLICATION_PHOTOS_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    return map;
  }

  data.forEach((item, index) => {
    const path = paths[index];
    if (path && item.signedUrl) {
      map.set(path, item.signedUrl);
    }
  });

  return map;
}

async function attachSignedPhotos(
  rows: DbApplicationRow[],
): Promise<Application[]> {
  if (!rows.length) return [];

  const admin = createAdminClient();
  const ids = rows.map((r) => r.id);
  const { data: photoRows } = await admin
    .from("application_photos")
    .select("id, application_id, storage_path, sort_order")
    .in("application_id", ids)
    .order("sort_order", { ascending: true });

  const photos = (photoRows ?? []) as DbApplicationPhotoRow[];
  const signed = await signPaths(photos.map((p) => p.storage_path));

  return rows.map((row) => {
    const appPhotos = photos
      .filter((p) => p.application_id === row.id)
      .map((p) => mapPhoto(p, signed.get(p.storage_path) ?? null));
    return mapApplication(row, appPhotos);
  });
}

export async function createPublicApplication(input: {
  fields: Record<string, FormDataEntryValue | null>;
  photos: File[];
  honeypot?: string;
}): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  if (input.honeypot && input.honeypot.trim()) {
    return { ok: false, message: "Başvuru gönderilemedi." };
  }

  const parsed = applicationFieldsSchema.safeParse({
    first_name: input.fields.first_name,
    last_name: input.fields.last_name,
    phone: input.fields.phone,
    city: input.fields.city,
    kvkk: input.fields.kvkk,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Form bilgileri geçersiz";
    if (process.env.NODE_ENV === "development") {
      console.warn("[applications/validation]", {
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    return { ok: false, message: first };
  }

  // Photos are optional on the public short form.
  if (input.photos.length > 0) {
    const photoError = validatePhotoFiles(input.photos);
    if (photoError) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[applications/photos-validation]", {
          message: photoError,
          count: input.photos.length,
          types: input.photos.map((f) => f.type || "(empty)"),
        });
      }
      return { ok: false, message: photoError };
    }
  }

  const data = parsed.data as ApplicationFieldsInput;
  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[applications/admin-init]", {
        message: err instanceof Error ? err.message : "unknown",
      });
    }
    return {
      ok: false,
      message: "Sunucu yapılandırması eksik. Lütfen daha sonra tekrar deneyin.",
    };
  }

  // Explicit insert only — never spread FormData / never send kvkk or website.
  // Omit optional profile columns so missing DB columns cannot cause 400.
  const insertPayload = {
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone,
    city: data.city,
    status: "new" as const,
  };

  const { data: inserted, error: insertError } = await admin
    .from("applications")
    .insert(insertPayload)
    .select("id")
    .single();

  if (insertError || !inserted?.id) {
    logApplicationError("applications-insert", insertError);
    return {
      ok: false,
      message:
        mapDbPermissionMessage(insertError) ??
        "Başvuru kaydedilemedi. Lütfen daha sonra tekrar deneyin.",
    };
  }

  const applicationId = inserted.id as string;

  if (!input.photos.length) {
    return { ok: true, id: applicationId };
  }

  const uploadedPaths: string[] = [];

  try {
    for (let i = 0; i < input.photos.length; i++) {
      const file = input.photos[i];
      const mime = resolvePhotoMime(file) ?? "image/jpeg";
      const ext = extensionForMime(mime);
      const storagePath = `applications/${applicationId}/${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await admin.storage
        .from(APPLICATION_PHOTOS_BUCKET)
        .upload(storagePath, buffer, {
          contentType: mime,
          upsert: false,
        });

      if (uploadError) {
        logApplicationError("storage-upload", uploadError);
        throw Object.assign(new Error("upload_failed"), { cause: uploadError });
      }

      uploadedPaths.push(storagePath);

      const { error: photoRowError } = await admin
        .from("application_photos")
        .insert({
          application_id: applicationId,
          storage_path: storagePath,
          sort_order: i,
        });

      if (photoRowError) {
        logApplicationError("application-photos-insert", photoRowError);
        throw Object.assign(new Error("photo_row_failed"), {
          cause: photoRowError,
        });
      }
    }

    return { ok: true, id: applicationId };
  } catch (err) {
    await cleanupApplication(applicationId, uploadedPaths);

    const cause =
      err && typeof err === "object" && "cause" in err
        ? (err.cause as {
            message?: string;
            code?: string;
            details?: string;
            hint?: string;
          } | null)
        : null;

    if (process.env.NODE_ENV === "development") {
      console.warn("[applications/photos-pipeline]", {
        stage: err instanceof Error ? err.message : "unknown",
        cause: cause
          ? {
              message: cause.message ?? null,
              code: cause.code ?? null,
              details: cause.details ?? null,
              hint: cause.hint ?? null,
            }
          : null,
      });
    }

    return {
      ok: false,
      message:
        mapDbPermissionMessage(cause) ??
        "Fotoğraflar yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }
}

export async function listApplications(
  filters: ApplicationFilters = {},
): Promise<PaginatedResult<Application>> {
  const admin = createAdminClient();
  const {
    search,
    city,
    gender,
    status,
    ageMin,
    ageMax,
    page = 1,
    pageSize = 20,
  } = filters;

  let query = admin
    .from("applications")
    .select(APPLICATION_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (city) query = query.eq("city", city);
  if (gender) query = query.eq("gender", gender);
  if (status) query = query.eq("status", status);

  if (search?.trim()) {
    const q = search.trim().replace(/[%_,]/g, "");
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%`,
    );
  }

  // Age filters need birth_date math; fetch a larger window then paginate in memory when used.
  const needsAgeFilter = ageMin != null || ageMax != null;

  if (!needsAgeFilter) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error("list_failed");
  }

  const rows = (data ?? []) as DbApplicationRow[];
  let mapped = await attachSignedPhotos(rows);

  if (needsAgeFilter) {
    mapped = mapped.filter((app) => {
      if (app.age == null) return false;
      if (ageMin != null && app.age < ageMin) return false;
      if (ageMax != null && app.age > ageMax) return false;
      return true;
    });
    const total = mapped.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    return {
      data: mapped.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  const total = count ?? mapped.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    data: mapped,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getApplicationById(
  id: string,
): Promise<Application | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("applications")
    .select(APPLICATION_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const [mapped] = await attachSignedPhotos([data as DbApplicationRow]);
  return mapped ?? null;
}

export async function updateApplication(
  id: string,
  patch: {
    status?: ApplicationStatus;
    adminNotes?: string;
    tags?: string[];
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    birthDate?: string | null;
    age?: number | null;
    gender?: string | null;
    heightCm?: number | null;
    weightKg?: number | null;
    hairColor?: string | null;
    eyeColor?: string | null;
    experience?: string | null;
    projects?: string | null;
  },
): Promise<Application | null> {
  const parsed = applicationUpdateSchema.safeParse({
    status: patch.status,
    admin_note: patch.adminNotes,
    tags: patch.tags,
    first_name: patch.firstName,
    last_name: patch.lastName,
    phone: patch.phone,
    city: patch.city,
    birth_date: patch.birthDate,
    age: patch.age,
    gender: patch.gender,
    height_cm: patch.heightCm,
    weight_kg: patch.weightKg,
    hair_color: patch.hairColor,
    eye_color: patch.eyeColor,
    experience: patch.experience,
    projects: patch.projects,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "validation_failed";
    throw new Error(first);
  }

  const updatePayload: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updatePayload.status = parsed.data.status;
  if (parsed.data.admin_note !== undefined) {
    updatePayload.admin_note = parsed.data.admin_note;
  }
  if (parsed.data.tags !== undefined) updatePayload.tags = parsed.data.tags;
  if (patch.firstName !== undefined && parsed.data.first_name !== undefined) {
    updatePayload.first_name = parsed.data.first_name;
  }
  if (patch.lastName !== undefined && parsed.data.last_name !== undefined) {
    updatePayload.last_name = parsed.data.last_name;
  }
  if (patch.phone !== undefined && parsed.data.phone !== undefined) {
    updatePayload.phone = parsed.data.phone;
  }
  if (patch.city !== undefined && parsed.data.city !== undefined) {
    updatePayload.city = parsed.data.city;
  }
  if (patch.birthDate !== undefined) {
    updatePayload.birth_date = parsed.data.birth_date ?? null;
  }
  if (patch.age !== undefined) {
    updatePayload.age = parsed.data.age ?? null;
  }
  if (patch.gender !== undefined) {
    updatePayload.gender = parsed.data.gender ?? null;
  }
  if (patch.heightCm !== undefined) {
    updatePayload.height_cm = parsed.data.height_cm ?? null;
  }
  if (patch.weightKg !== undefined) {
    updatePayload.weight_kg = parsed.data.weight_kg ?? null;
  }
  if (patch.hairColor !== undefined) {
    updatePayload.hair_color = parsed.data.hair_color || null;
  }
  if (patch.eyeColor !== undefined) {
    updatePayload.eye_color = parsed.data.eye_color || null;
  }
  if (patch.experience !== undefined) {
    updatePayload.experience = parsed.data.experience || null;
  }
  if (patch.projects !== undefined) {
    updatePayload.projects = parsed.data.projects || null;
  }

  if (!Object.keys(updatePayload).length) {
    return getApplicationById(id);
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("applications")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    logApplicationError("applications-update", error);
    throw new Error("update_failed");
  }

  return getApplicationById(id);
}

/**
 * Append photos to an existing application (dashboard staff only).
 * Respects MAX_PHOTOS total across existing + new files.
 */
export async function addApplicationPhotos(
  applicationId: string,
  files: File[],
): Promise<Application | null> {
  if (!files.length) {
    throw new Error("En az 1 fotoğraf seçin.");
  }

  const existing = await getApplicationById(applicationId);
  if (!existing) return null;

  const remaining = MAX_PHOTOS - existing.photos.length;
  if (remaining <= 0) {
    throw new Error("Bu başvuruda zaten 5 fotoğraf var. Yeni fotoğraf eklenemez.");
  }

  const photoError = validatePhotoFiles(files, {
    min: 1,
    maxRemaining: remaining,
  });
  if (photoError) {
    throw new Error(photoError);
  }

  const admin = createAdminClient();
  const startOrder = existing.photos.reduce(
    (max, photo) => Math.max(max, photo.sortOrder),
    -1,
  );
  const uploadedPaths: string[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mime = resolvePhotoMime(file) ?? "image/jpeg";
      const ext = extensionForMime(mime);
      const storagePath = `applications/${applicationId}/${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await admin.storage
        .from(APPLICATION_PHOTOS_BUCKET)
        .upload(storagePath, buffer, {
          contentType: mime,
          upsert: false,
        });

      if (uploadError) {
        logApplicationError("dashboard-storage-upload", uploadError);
        throw new Error("Fotoğraflar yüklenirken bir sorun oluştu.");
      }

      uploadedPaths.push(storagePath);

      const { error: photoRowError } = await admin
        .from("application_photos")
        .insert({
          application_id: applicationId,
          storage_path: storagePath,
          sort_order: startOrder + 1 + i,
        });

      if (photoRowError) {
        logApplicationError("dashboard-photos-insert", photoRowError);
        throw new Error("Fotoğraf kaydı oluşturulamadı.");
      }
    }
  } catch (err) {
    if (uploadedPaths.length) {
      await admin.storage.from(APPLICATION_PHOTOS_BUCKET).remove(uploadedPaths);
      await admin
        .from("application_photos")
        .delete()
        .eq("application_id", applicationId)
        .in("storage_path", uploadedPaths);
    }
    throw err;
  }

  return getApplicationById(applicationId);
}

export async function archiveApplication(id: string) {
  return updateApplication(id, { status: "archived" });
}

export async function getApplicationStats() {
  const admin = createAdminClient();

  const [totalRes, newRes, reviewingRes] = await Promise.all([
    admin.from("applications").select("id", { count: "exact", head: true }),
    admin
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    admin
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "reviewing"),
  ]);

  return {
    total: totalRes.count ?? 0,
    new: newRes.count ?? 0,
    reviewing: reviewingRes.count ?? 0,
  };
}

export async function listAllApplicationsRaw(): Promise<Application[]> {
  const result = await listApplications({ page: 1, pageSize: 1000 });
  return result.data;
}
