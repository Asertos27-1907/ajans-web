import type {
  Application,
  ApplicationPhoto,
  ApplicationStatus,
  Gender,
} from "@/types";
import { APPLICATION_STATUSES } from "@/lib/applications/schema";

export interface DbApplicationRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string | null;
  age: number | null;
  gender: string | null;
  city: string;
  height_cm: number | null;
  weight_kg: number | null;
  hair_color: string | null;
  eye_color: string | null;
  experience: string | null;
  projects: string | null;
  status: string;
  admin_note: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at?: string | null;
}

export interface DbApplicationPhotoRow {
  id: string;
  application_id: string;
  storage_path: string;
  sort_order: number;
}

export const APPLICATION_SELECT =
  "id, first_name, last_name, phone, birth_date, age, gender, city, height_cm, weight_kg, hair_color, eye_color, experience, projects, status, admin_note, tags, created_at, updated_at";

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function mapPhoto(
  row: DbApplicationPhotoRow,
  signedUrl: string | null,
): ApplicationPhoto {
  return {
    id: row.id,
    applicationId: row.application_id,
    storagePath: row.storage_path,
    sortOrder: row.sort_order,
    url: signedUrl ?? "",
    thumbnailUrl: signedUrl ?? "",
    type: row.sort_order === 0 ? "portre" : "ek",
    alt: `Fotoğraf ${row.sort_order + 1}`,
  };
}

export function mapApplication(
  row: DbApplicationRow,
  photos: ApplicationPhoto[] = [],
): Application {
  const status = isApplicationStatus(row.status) ? row.status : "new";
  const birthDate = row.birth_date?.trim() || "";
  const gender =
    row.gender === "kadin" ||
    row.gender === "erkek" ||
    row.gender === "diger" ||
    row.gender === "belirtmek_istemiyor"
      ? (row.gender as Gender)
      : "";

  const age =
    row.age != null && Number.isFinite(Number(row.age))
      ? Math.round(Number(row.age))
      : null;

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    birthDate,
    age,
    gender,
    city: row.city,
    heightCm: row.height_cm ?? undefined,
    weightKg: row.weight_kg ?? undefined,
    hairColor: row.hair_color ?? "",
    eyeColor: row.eye_color ?? "",
    experience: row.experience ?? "",
    projects: row.projects ?? "",
    photos: photos.sort((a, b) => a.sortOrder - b.sortOrder),
    status,
    tags: row.tags ?? [],
    adminNotes: row.admin_note ?? "",
    isFavorite: false,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}
