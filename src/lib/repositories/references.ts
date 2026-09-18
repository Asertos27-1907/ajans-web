import type { ReferenceCategory, ReferenceProject } from "@/types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "İşlem başarısız.");
  }
  return data;
}

export const referenceRepository = {
  async list(): Promise<ReferenceProject[]> {
    const res = await fetch("/api/dashboard/references", {
      credentials: "same-origin",
      cache: "no-store",
    });
    const json = await parseJson<{ data: ReferenceProject[] }>(res);
    return json.data;
  },

  async create(input: {
    title: string;
    category: ReferenceCategory;
    year: number;
    description: string;
    coverImageUrl: string;
    isActive: boolean;
    sortOrder: number;
    actorIds?: string[];
    isFeatured?: boolean;
  }) {
    const res = await fetch("/api/dashboard/references", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseJson<ReferenceProject>(res);
  },

  async update(id: string, patch: Partial<ReferenceProject>) {
    const res = await fetch("/api/dashboard/references", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        title: patch.title,
        category: patch.category,
        year: patch.year,
        description: patch.description,
        coverImageUrl: patch.coverImageUrl,
        imagePath: patch.imagePath,
        isActive: patch.isActive,
        sortOrder: patch.sortOrder,
      }),
    });
    return parseJson<ReferenceProject>(res);
  },

  async remove(id: string) {
    const res = await fetch(`/api/dashboard/references?id=${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    await parseJson(res);
  },

  async stats() {
    const res = await fetch("/api/dashboard/references?mode=stats", {
      credentials: "same-origin",
      cache: "no-store",
    });
    return parseJson<{ total: number }>(res);
  },
};
