import type {
  Application,
  ApplicationFilters,
  ApplicationStatus,
  PaginatedResult,
} from "@/types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || "İşlem başarısız oldu.",
    );
  }
  return data;
}

function toQuery(filters: ApplicationFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.city) params.set("city", filters.city);
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.status) params.set("status", filters.status);
  if (filters.ageMin != null) params.set("ageMin", String(filters.ageMin));
  if (filters.ageMax != null) params.set("ageMax", String(filters.ageMax));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  return params.toString();
}

export const applicationRepository = {
  async list(
    filters: ApplicationFilters = {},
  ): Promise<PaginatedResult<Application>> {
    const qs = toQuery(filters);
    const res = await fetch(`/api/dashboard/applications?${qs}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    return parseJson(res);
  },

  async getById(id: string) {
    const res = await fetch(`/api/dashboard/applications/${id}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (res.status === 404) return null;
    return parseJson<Application>(res);
  },

  async update(id: string, patch: Partial<Application>) {
    const res = await fetch(`/api/dashboard/applications/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: patch.status,
        adminNotes: patch.adminNotes,
        tags: patch.tags,
      }),
    });
    return parseJson<Application>(res);
  },

  async updateStatus(id: string, status: ApplicationStatus) {
    return this.update(id, { status });
  },

  async archive(id: string) {
    const res = await fetch(`/api/dashboard/applications/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive: true }),
    });
    return parseJson<Application>(res);
  },

  /** Soft-delete: archive instead of hard delete */
  async remove(id: string) {
    await this.archive(id);
  },

  async getAllRaw() {
    const res = await fetch(`/api/dashboard/applications?mode=all`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    const json = await parseJson<{ data: Application[] }>(res);
    return json.data;
  },

  async stats() {
    const res = await fetch(`/api/dashboard/applications?mode=stats`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    return parseJson<{ total: number; new: number; reviewing: number }>(res);
  },
};
