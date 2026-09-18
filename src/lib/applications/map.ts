import { calcAge } from "@/lib/utils";
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
  birth_date: string;
  gender: string;
  city: string;
  height_cm: number | null;
  weight_kg: number | null;
  experience: string | null;
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

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    birthDate: row.birth_date,
    age: calcAge(row.birth_date),
    gender: row.gender as Gender,
    city: row.city,
    heightCm: row.height_cm ?? undefined,
    weightKg: row.weight_kg ?? undefined,
    experience: row.experience ?? "",
    photos: photos.sort((a, b) => a.sortOrder - b.sortOrder),
    status,
    tags: row.tags ?? [],
    adminNotes: row.admin_note ?? "",
    isFavorite: false,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}
