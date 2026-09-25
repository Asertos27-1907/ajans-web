import "server-only";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createSignedUrlMap,
  extensionForMime,
  validateImageFile,
} from "@/lib/storage/signed";
import {
  mapActor,
  mapActorPhoto,
  type DbActorPhotoRow,
  type DbActorRow,
} from "@/lib/actors/map";
import type {
  Actor,
  ActorFilters,
  Application,
  Gender,
  PaginatedResult,
} from "@/types";
import { APPLICATION_PHOTOS_BUCKET } from "@/lib/applications/schema";

export const ACTOR_PHOTOS_BUCKET = "actor-photos";

const ACTOR_SELECT =
  "id, first_name, last_name, phone, birth_date, gender, city, height_cm, weight_kg, experience, active, application_id, created_at, updated_at";

function logActorError(
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
  console.warn(`[actors/${stage}]`, {
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
    return "permission_denied";
  }
  return null;
}

async function attachPhotos(rows: DbActorRow[]): Promise<Actor[]> {
  if (!rows.length) return [];
  const admin = createAdminClient();
  const ids = rows.map((r) => r.id);
  const { data: photoRows } = await admin
    .from("actor_photos")
    .select("id, actor_id, storage_path, sort_order")
    .in("actor_id", ids)
    .order("sort_order", { ascending: true });

  const photos = (photoRows ?? []) as DbActorPhotoRow[];
  const signed = await createSignedUrlMap(
    ACTOR_PHOTOS_BUCKET,
    photos.map((p) => p.storage_path),
  );

  return rows.map((row) =>
    mapActor(
      row,
      photos
        .filter((p) => p.actor_id === row.id)
        .map((p) => mapActorPhoto(p, signed.get(p.storage_path) ?? null)),
    ),
  );
}

export async function listActors(
  filters: ActorFilters = {},
): Promise<PaginatedResult<Actor>> {
  const admin = createAdminClient();
  const {
    search,
    gender,
    isActive,
    page = 1,
    pageSize = 60,
  } = filters;

  let query = admin
    .from("actors")
    .select(ACTOR_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (gender) query = query.eq("gender", gender);
  if (isActive != null) query = query.eq("active", isActive);
  if (search?.trim()) {
    const q = search.trim().replace(/[%_,]/g, "");
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,city.ilike.%${q}%`,
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error("list_failed");

  const mapped = await attachPhotos((data ?? []) as DbActorRow[]);
  const total = count ?? mapped.length;
  return {
    data: mapped,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listPublicActors(page = 1, pageSize = 24) {
  return listActors({ isActive: true, page, pageSize });
}

export async function getActorById(id: string): Promise<Actor | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("actors")
    .select(ACTOR_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const [actor] = await attachPhotos([data as DbActorRow]);
  return actor ?? null;
}

export async function getActorBySlug(slug: string): Promise<Actor | null> {
  const result = await listPublicActors(1, 200);
  return result.data.find((a) => a.slug === slug) ?? null;
}

export async function createActor(input: {
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate: string;
  gender: Gender;
  city: string;
  heightCm?: number;
  weightKg?: number;
  experience?: string;
  isActive?: boolean;
  applicationId?: string;
  photos?: File[];
}): Promise<Actor> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("actors")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone || null,
      birth_date: input.birthDate,
      gender: input.gender,
      city: input.city,
      height_cm: input.heightCm ?? null,
      weight_kg: input.weightKg ?? null,
      experience: input.experience || null,
      active: input.isActive ?? true,
      application_id: input.applicationId ?? null,
    })
    .select(ACTOR_SELECT)
    .single();

  if (error || !data) throw new Error("create_failed");

  const actorId = (data as DbActorRow).id;
  const uploaded: string[] = [];

  try {
    if (input.photos?.length) {
      for (let i = 0; i < input.photos.length; i++) {
        const file = input.photos[i];
        const err = validateImageFile(file);
        if (err) throw new Error(err);
        const path = `actors/${actorId}/${randomUUID()}.${extensionForMime(file.type)}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const { error: upErr } = await admin.storage
          .from(ACTOR_PHOTOS_BUCKET)
          .upload(path, buffer, { contentType: file.type, upsert: false });
        if (upErr) throw new Error("upload_failed");
        uploaded.push(path);
        const { error: rowErr } = await admin.from("actor_photos").insert({
          actor_id: actorId,
          storage_path: path,
          sort_order: i,
        });
        if (rowErr) throw new Error("photo_row_failed");
      }
    }
  } catch (e) {
    if (uploaded.length) {
      await admin.storage.from(ACTOR_PHOTOS_BUCKET).remove(uploaded);
    }
    await admin.from("actor_photos").delete().eq("actor_id", actorId);
    await admin.from("actors").delete().eq("id", actorId);
    throw e;
  }

  const actor = await getActorById(actorId);
  if (!actor) throw new Error("create_failed");
  return actor;
}

export async function updateActor(
  id: string,
  patch: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    birthDate?: string;
    gender?: Gender;
    city?: string;
    heightCm?: number | null;
    weightKg?: number | null;
    experience?: string;
    isActive?: boolean;
  },
): Promise<Actor | null> {
  const payload: Record<string, unknown> = {};
  if (patch.firstName !== undefined) payload.first_name = patch.firstName;
  if (patch.lastName !== undefined) payload.last_name = patch.lastName;
  if (patch.phone !== undefined) payload.phone = patch.phone || null;
  if (patch.birthDate !== undefined) payload.birth_date = patch.birthDate;
  if (patch.gender !== undefined) payload.gender = patch.gender;
  if (patch.city !== undefined) payload.city = patch.city;
  if (patch.heightCm !== undefined) payload.height_cm = patch.heightCm;
  if (patch.weightKg !== undefined) payload.weight_kg = patch.weightKg;
  if (patch.experience !== undefined) payload.experience = patch.experience || null;
  if (patch.isActive !== undefined) payload.active = patch.isActive;

  const admin = createAdminClient();
  const { error } = await admin.from("actors").update(payload).eq("id", id);
  if (error) throw new Error("update_failed");
  return getActorById(id);
}

export async function addActorPhotos(actorId: string, files: File[]) {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("actor_photos")
    .select("sort_order")
    .eq("actor_id", actorId)
    .order("sort_order", { ascending: false })
    .limit(1);

  let nextOrder = existing?.[0]?.sort_order != null ? existing[0].sort_order + 1 : 0;
  const uploaded: string[] = [];

  try {
    for (const file of files) {
      const err = validateImageFile(file);
      if (err) throw new Error(err);
      const path = `actors/${actorId}/${randomUUID()}.${extensionForMime(file.type)}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: upErr } = await admin.storage
        .from(ACTOR_PHOTOS_BUCKET)
        .upload(path, buffer, { contentType: file.type, upsert: false });
      if (upErr) throw new Error("upload_failed");
      uploaded.push(path);
      const { error: rowErr } = await admin.from("actor_photos").insert({
        actor_id: actorId,
        storage_path: path,
        sort_order: nextOrder,
      });
      if (rowErr) throw new Error("photo_row_failed");
      nextOrder += 1;
    }
  } catch (e) {
    if (uploaded.length) {
      await admin.storage.from(ACTOR_PHOTOS_BUCKET).remove(uploaded);
    }
    throw e;
  }

  return getActorById(actorId);
}

export async function deleteActorPhoto(actorId: string, photoId: string) {
  const admin = createAdminClient();
  const { data: photo } = await admin
    .from("actor_photos")
    .select("id, storage_path")
    .eq("id", photoId)
    .eq("actor_id", actorId)
    .maybeSingle();

  if (!photo) throw new Error("not_found");

  await admin.from("actor_photos").delete().eq("id", photoId);
  await admin.storage.from(ACTOR_PHOTOS_BUCKET).remove([photo.storage_path]);
  return getActorById(actorId);
}

export async function reorderActorPhotos(
  actorId: string,
  orderedIds: string[],
) {
  const admin = createAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await admin
      .from("actor_photos")
      .update({ sort_order: i })
      .eq("id", orderedIds[i])
      .eq("actor_id", actorId);
  }
  return getActorById(actorId);
}

export async function deleteActor(id: string) {
  const admin = createAdminClient();
  const { data: photos } = await admin
    .from("actor_photos")
    .select("storage_path")
    .eq("actor_id", id);

  const paths = (photos ?? []).map((p) => p.storage_path as string);

  // Storage first, then DB rows — avoids orphaned objects if later steps fail mid-way.
  if (paths.length) {
    const { error: storageError } = await admin.storage
      .from(ACTOR_PHOTOS_BUCKET)
      .remove(paths);
    if (storageError) throw new Error("delete_failed");
  }

  const { error: photosError } = await admin
    .from("actor_photos")
    .delete()
    .eq("actor_id", id);
  if (photosError) throw new Error("delete_failed");

  const { error } = await admin.from("actors").delete().eq("id", id);
  if (error) throw new Error("delete_failed");
}

export async function getActorStats() {
  const admin = createAdminClient();
  const [total, active] = await Promise.all([
    admin.from("actors").select("id", { count: "exact", head: true }),
    admin
      .from("actors")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
  ]);
  return {
    total: total.count ?? 0,
    active: active.count ?? 0,
  };
}

export async function convertApplicationToActor(
  applicationId: string,
): Promise<Actor> {
  const admin = createAdminClient();

  const { data: existing, error: existingErr } = await admin
    .from("actors")
    .select("id")
    .eq("application_id", applicationId)
    .maybeSingle();

  if (existingErr) {
    logActorError("convert-existing-check", existingErr);
    if (mapDbPermissionMessage(existingErr)) {
      throw new Error("permission_denied");
    }
    throw new Error("create_failed");
  }

  if (existing) {
    throw new Error("already_converted");
  }

  const { data: app, error: appErr } = await admin
    .from("applications")
    .select(
      "id, first_name, last_name, phone, birth_date, gender, city, height_cm, weight_kg, experience",
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (appErr) {
    logActorError("convert-application-read", appErr);
    if (mapDbPermissionMessage(appErr)) {
      throw new Error("permission_denied");
    }
    throw new Error("application_not_found");
  }
  if (!app) throw new Error("application_not_found");

  const missing: string[] = [];
  if (!app.birth_date) missing.push("doğum tarihi");
  if (!app.gender) missing.push("cinsiyet");
  if (missing.length) {
    throw new Error(`missing_profile:${missing.join(",")}`);
  }

  const { data: appPhotos, error: photosErr } = await admin
    .from("application_photos")
    .select("storage_path, sort_order")
    .eq("application_id", applicationId)
    .order("sort_order", { ascending: true });

  if (photosErr) {
    logActorError("convert-application-photos-read", photosErr);
    if (mapDbPermissionMessage(photosErr)) {
      throw new Error("permission_denied");
    }
  }

  const { data: actorRow, error: insertErr } = await admin
    .from("actors")
    .insert({
      first_name: app.first_name,
      last_name: app.last_name,
      phone: app.phone,
      birth_date: app.birth_date,
      gender: app.gender,
      city: app.city,
      height_cm: app.height_cm,
      weight_kg: app.weight_kg,
      experience: app.experience,
      active: true,
      application_id: applicationId,
    })
    .select(ACTOR_SELECT)
    .single();

  if (insertErr || !actorRow) {
    logActorError("convert-actors-insert", insertErr);
    if (
      insertErr?.code === "23505" ||
      /duplicate|unique/i.test(insertErr?.message ?? "")
    ) {
      throw new Error("already_converted");
    }
    if (mapDbPermissionMessage(insertErr)) {
      throw new Error("permission_denied");
    }
    throw new Error("create_failed");
  }

  const actorId = (actorRow as DbActorRow).id;
  const uploaded: string[] = [];

  try {
    for (const photo of appPhotos ?? []) {
      const sourcePath = photo.storage_path as string;
      const ext = sourcePath.split(".").pop() || "jpg";
      const destPath = `actors/${actorId}/${randomUUID()}.${ext}`;

      const { data: blob, error: dlErr } = await admin.storage
        .from(APPLICATION_PHOTOS_BUCKET)
        .download(sourcePath);
      if (dlErr || !blob) {
        logActorError("convert-storage-download", dlErr);
        throw new Error("copy_failed");
      }

      const buffer = Buffer.from(await blob.arrayBuffer());
      const contentType =
        ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : "image/jpeg";

      const { error: upErr } = await admin.storage
        .from(ACTOR_PHOTOS_BUCKET)
        .upload(destPath, buffer, { contentType, upsert: false });
      if (upErr) {
        logActorError("convert-storage-upload", upErr);
        throw new Error("copy_failed");
      }
      uploaded.push(destPath);

      const { error: rowErr } = await admin.from("actor_photos").insert({
        actor_id: actorId,
        storage_path: destPath,
        sort_order: photo.sort_order ?? uploaded.length - 1,
      });
      if (rowErr) {
        logActorError("convert-actor-photos-insert", rowErr);
        if (mapDbPermissionMessage(rowErr)) {
          throw new Error("permission_denied");
        }
        throw new Error("copy_failed");
      }
    }

    const { error: statusErr } = await admin
      .from("applications")
      .update({ status: "accepted" })
      .eq("id", applicationId);

    if (statusErr) {
      logActorError("convert-application-status", statusErr);
      // Actor already created; do not roll back solely for status update failure.
    }
  } catch (e) {
    if (uploaded.length) {
      await admin.storage.from(ACTOR_PHOTOS_BUCKET).remove(uploaded);
    }
    await admin.from("actor_photos").delete().eq("actor_id", actorId);
    await admin.from("actors").delete().eq("id", actorId);
    throw e;
  }

  const actor = await getActorById(actorId);
  if (!actor) throw new Error("create_failed");
  return actor;
}

/** Used only for type-check compatibility with old fromApplication signature */
export type ConvertibleApplication = Pick<
  Application,
  | "id"
  | "firstName"
  | "lastName"
  | "phone"
  | "birthDate"
  | "gender"
  | "city"
  | "heightCm"
  | "weightKg"
  | "experience"
  | "photos"
>;
