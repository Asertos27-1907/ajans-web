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
  hair_color?: string | null;
  eye_color?: string | null;
  experience: string | null;
  projects?: string | null;
  admin_note?: string | null;
  age?: number | null;
  active: boolean;
  is_public?: boolean | null;
  is_featured?: boolean | null;
  display_order?: number | null;
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
  actorName?: string,
): ActorPhoto {
  return {
    id: row.id,
    actorId: row.actor_id,
    storagePath: row.storage_path,
    url: signedUrl ?? "",
    thumbnailUrl: signedUrl ?? "",
    alt: actorName
      ? `${actorName} - +Akademi oyuncusu`
      : `Fotoğraf ${row.sort_order + 1}`,
    isCover: row.sort_order === 0,
    sortOrder: row.sort_order,
  };
}

export function mapActor(row: DbActorRow, photos: ActorPhoto[] = []): Actor {
  const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder);
  const cover = sorted.find((p) => p.isCover)?.url || sorted[0]?.url || "";
  const calendarAge = row.birth_date ? calcAge(row.birth_date) : 0;
  const age =
    row.age != null && Number.isFinite(Number(row.age))
      ? Number(row.age)
      : calendarAge;

  return {
    id: row.id,
    slug: slugify(`${row.first_name}-${row.last_name}-${row.id.slice(0, 8)}`),
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone ?? undefined,
    birthDate: row.birth_date,
    age,
    gender: row.gender as Gender,
    city: row.city,
    heightCm: row.height_cm ?? undefined,
    weightKg: row.weight_kg ?? undefined,
    hairColor: row.hair_color ?? "",
    eyeColor: row.eye_color ?? "",
    experience: row.experience ?? "",
    projects: row.projects ?? "",
    adminNotes: row.admin_note ?? "",
    photos: sorted,
    coverPhotoUrl: cover,
    isActive: Boolean(row.active),
    showOnWebsite: Boolean(row.is_public),
    isFeatured: Boolean(row.is_featured),
    displayOrder:
      row.display_order == null || !Number.isFinite(Number(row.display_order))
        ? null
        : Number(row.display_order),
    applicationId: row.application_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}
