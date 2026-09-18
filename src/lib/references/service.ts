import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ReferenceCategory, ReferenceProject } from "@/types";

interface DbReference {
  id: string;
  title: string;
  category: string;
  year: number;
  description: string | null;
  image_path: string | null;
  active: boolean;
  sort_order: number;
  created_at?: string;
}

function mapReference(row: DbReference): ReferenceProject {
  return {
    id: row.id,
    title: row.title,
    category: row.category as ReferenceCategory,
    year: row.year,
    description: row.description ?? "",
    coverImageUrl: row.image_path || "/placeholders/ref-01.jpg",
    imagePath: row.image_path,
    actorIds: [],
    isFeatured: false,
    isActive: Boolean(row.active),
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export async function listReferences(): Promise<ReferenceProject[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("references")
    .select(
      "id, title, category, year, description, image_path, active, sort_order, created_at",
    )
    .order("sort_order", { ascending: true });

  if (error) throw new Error("list_failed");
  return ((data ?? []) as DbReference[]).map(mapReference);
}

export async function createReference(input: {
  title: string;
  category: ReferenceCategory;
  year: number;
  description?: string;
  imagePath?: string | null;
  active?: boolean;
  sortOrder?: number;
}) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("references")
    .insert({
      title: input.title,
      category: input.category,
      year: input.year,
      description: input.description || null,
      image_path: input.imagePath || null,
      active: input.active ?? true,
      sort_order: input.sortOrder ?? 0,
    })
    .select(
      "id, title, category, year, description, image_path, active, sort_order, created_at",
    )
    .single();

  if (error || !data) throw new Error("create_failed");
  return mapReference(data as DbReference);
}

export async function updateReference(
  id: string,
  patch: Partial<{
    title: string;
    category: ReferenceCategory;
    year: number;
    description: string;
    imagePath: string | null;
    active: boolean;
    sortOrder: number;
  }>,
) {
  const payload: Record<string, unknown> = {};
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.category !== undefined) payload.category = patch.category;
  if (patch.year !== undefined) payload.year = patch.year;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.imagePath !== undefined) payload.image_path = patch.imagePath;
  if (patch.active !== undefined) payload.active = patch.active;
  if (patch.sortOrder !== undefined) payload.sort_order = patch.sortOrder;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("references")
    .update(payload)
    .eq("id", id)
    .select(
      "id, title, category, year, description, image_path, active, sort_order, created_at",
    )
    .single();

  if (error || !data) throw new Error("update_failed");
  return mapReference(data as DbReference);
}

export async function deleteReference(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("references").delete().eq("id", id);
  if (error) throw new Error("delete_failed");
}

export async function getReferenceStats() {
  const admin = createAdminClient();
  const { count } = await admin
    .from("references")
    .select("id", { count: "exact", head: true })
    .eq("active", true);
  return { total: count ?? 0 };
}
