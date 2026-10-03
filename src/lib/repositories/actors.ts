import type { Actor, ActorFilters, PaginatedResult } from "@/types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "İşlem başarısız.");
  }
  return data;
}

export const actorRepository = {
  async list(filters: ActorFilters = {}): Promise<PaginatedResult<Actor>> {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.isActive != null) params.set("isActive", filters.isActive ? "1" : "0");
    if (filters.page) params.set("page", String(filters.page));
    if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
    const res = await fetch(`/api/dashboard/actors?${params}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    return parseJson(res);
  },

  async getById(id: string) {
    const res = await fetch(`/api/dashboard/actors/${id}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (res.status === 404) return null;
    return parseJson<Actor>(res);
  },

  async create(input: {
    firstName: string;
    lastName: string;
    phone?: string;
    birthDate: string;
    gender: Actor["gender"];
    city: string;
    heightCm?: number;
    weightKg?: number;
    age?: number | null;
    hairColor?: string;
    eyeColor?: string;
    experience: string;
    projects?: string;
    adminNotes?: string;
    isActive: boolean;
    showOnWebsite?: boolean;
    isFeatured?: boolean;
    displayOrder?: number | null;
    photos?: File[];
  }) {
    const form = new FormData();
    form.set("first_name", input.firstName);
    form.set("last_name", input.lastName);
    if (input.phone) form.set("phone", input.phone);
    form.set("birth_date", input.birthDate);
    form.set("gender", input.gender);
    form.set("city", input.city);
    if (input.heightCm) form.set("height_cm", String(input.heightCm));
    if (input.weightKg) form.set("weight_kg", String(input.weightKg));
    if (input.age != null) form.set("age", String(input.age));
    if (input.hairColor) form.set("hair_color", input.hairColor);
    if (input.eyeColor) form.set("eye_color", input.eyeColor);
    form.set("experience", input.experience);
    if (input.projects) form.set("projects", input.projects);
    if (input.adminNotes) form.set("admin_note", input.adminNotes);
    form.set("active", input.isActive ? "true" : "false");
    form.set("is_public", input.showOnWebsite ? "true" : "false");
    form.set("is_featured", input.isFeatured ? "true" : "false");
    if (input.displayOrder != null)
      form.set("display_order", String(input.displayOrder));
    input.photos?.forEach((f) => form.append("photos", f));

    const res = await fetch("/api/dashboard/actors", {
      method: "POST",
      credentials: "same-origin",
      body: form,
    });
    return parseJson<Actor>(res);
  },

  async update(
    id: string,
    patch: Partial<Omit<Actor, "age" | "displayOrder">> & {
      age?: number | null;
      displayOrder?: number | null;
      newPhotos?: File[];
      deletePhotoId?: string;
      primaryPhotoId?: string;
    },
  ) {
    if (patch.newPhotos?.length || patch.deletePhotoId || patch.primaryPhotoId) {
      const form = new FormData();
      if (patch.deletePhotoId) {
        form.set("action", "delete_photo");
        form.set("photo_id", patch.deletePhotoId);
      } else if (patch.primaryPhotoId) {
        form.set("action", "set_primary");
        form.set("photo_id", patch.primaryPhotoId);
      } else if (patch.newPhotos?.length) {
        form.set("action", "add_photos");
        patch.newPhotos.forEach((f) => form.append("photos", f));
      }
      const res = await fetch(`/api/dashboard/actors/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        body: form,
      });
      return parseJson<Actor>(res);
    }

    const res = await fetch(`/api/dashboard/actors/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: patch.firstName,
        lastName: patch.lastName,
        phone: patch.phone,
        birthDate: patch.birthDate,
        gender: patch.gender,
        city: patch.city,
        heightCm: patch.heightCm,
        weightKg: patch.weightKg,
        age: patch.age,
        hairColor: patch.hairColor,
        eyeColor: patch.eyeColor,
        experience: patch.experience,
        projects: patch.projects,
        adminNotes: patch.adminNotes,
        isActive: patch.isActive,
        showOnWebsite: patch.showOnWebsite,
        isFeatured: patch.isFeatured,
        displayOrder: patch.displayOrder,
      }),
    });
    return parseJson<Actor>(res);
  },

  async remove(id: string) {
    const res = await fetch(`/api/dashboard/actors/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    await parseJson(res);
  },

  async fromApplication(app: { id: string }) {
    const res = await fetch(`/api/dashboard/applications/${app.id}/convert`, {
      method: "POST",
      credentials: "same-origin",
    });
    return parseJson<Actor>(res);
  },

  async stats() {
    const res = await fetch(`/api/dashboard/actors?mode=stats`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    return parseJson<{ total: number; active: number }>(res);
  },
};
