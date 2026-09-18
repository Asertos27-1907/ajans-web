import { calcAge, slugify } from "@/lib/utils";
import type { Actor, ActorPhoto, Gender } from "@/types";

export interface DbActorRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  birth_date: string;
  gender: string;
  city: string;
  height_cm: number | null;
  weight_kg: number | null;
  experience: string | null;
  active: boolean;
  application_id: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface DbActorPhotoRow {
  id: string;
  actor_id: string;
  storage_path: string;
  sort_order: number;
}

export function mapActorPhoto(
  row: DbActorPhotoRow,
  signedUrl: string | null,
): ActorPhoto {
  return {
    id: row.id,
    actorId: row.actor_id,
    storagePath: row.storage_path,
    url: signedUrl ?? "",
    thumbnailUrl: signedUrl ?? "",
    alt: `Fotoğraf ${row.sort_order + 1}`,
    isCover: row.sort_order === 0,
    sortOrder: row.sort_order,
  };
}

export function mapActor(row: DbActorRow, photos: ActorPhoto[] = []): Actor {
  const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder);
  const cover = sorted.find((p) => p.isCover)?.url || sorted[0]?.url || "";

  return {
    id: row.id,
    slug: slugify(`${row.first_name}-${row.last_name}-${row.id.slice(0, 8)}`),
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone ?? undefined,
    birthDate: row.birth_date,
    age: calcAge(row.birth_date),
    gender: row.gender as Gender,
    city: row.city,
    heightCm: row.height_cm ?? undefined,
    weightKg: row.weight_kg ?? undefined,
    experience: row.experience ?? "",
    photos: sorted,
    coverPhotoUrl: cover,
    isActive: Boolean(row.active),
    showOnWebsite: Boolean(row.active),
    isFeatured: false,
    applicationId: row.application_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}
