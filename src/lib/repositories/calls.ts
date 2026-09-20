import type {
  CallFilters,
  CallHistoryEntry,
  CallRecord,
  CallStatus,
  PaginatedResult,
} from "@/types";
import type { ImportField, ImportRowInput } from "@/lib/calls/import";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "İşlem başarısız.");
  }
  return data;
}

function toQuery(filters: CallFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.personnelName) params.set("personnelName", filters.personnelName);
  if (filters.city) params.set("city", filters.city);
  if (filters.quickFilter) params.set("quickFilter", filters.quickFilter);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  return params.toString();
}

export const callRepository = {
  async list(filters: CallFilters = {}): Promise<PaginatedResult<CallRecord>> {
    const qs = toQuery(filters);
    const res = await fetch(`/api/dashboard/calls${qs ? `?${qs}` : ""}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    return parseJson<PaginatedResult<CallRecord>>(res);
  },

  async listPersonnelNames() {
    const res = await fetch("/api/dashboard/calls?mode=personnel", {
      credentials: "same-origin",
      cache: "no-store",
    });
    const json = await parseJson<{ data: string[] }>(res);
    return json.data;
  },

  async create(input: {
    fullName?: string;
    phone: string;
    city?: string;
    district?: string;
    source?: string;
    status?: CallStatus;
    note?: string;
    personnelName?: string;
    nextActionAt?: string | null;
  }) {
    const res = await fetch("/api/dashboard/calls", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await parseJson<{ data: CallRecord }>(res);
    return json.data;
  },

  async update(
    id: string,
    input: Partial<{
      fullName: string;
      phone: string;
      city: string;
      district: string;
      source: string;
      status: CallStatus;
      note: string;
      personnelName: string;
      lastCalledAt: string | null;
      nextActionAt: string | null;
    }>,
  ) {
    const res = await fetch(`/api/dashboard/calls/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await parseJson<{ data: CallRecord }>(res);
    return json.data;
  },

  async remove(id: string) {
    const res = await fetch(`/api/dashboard/calls/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    await parseJson(res);
  },

  async bulkRemove(ids: string[]) {
    const res = await fetch("/api/dashboard/calls/bulk-delete", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    return parseJson<{ ok: boolean; deleted: number }>(res);
  },

  async history(id: string): Promise<CallHistoryEntry[]> {
    const res = await fetch(`/api/dashboard/calls/${id}/history`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    const json = await parseJson<{ data: CallHistoryEntry[] }>(res);
    return json.data;
  },

  async addHistory(
    id: string,
    input: {
      status: CallStatus;
      note?: string;
      nextActionAt?: string | null;
      updateLastCalled?: boolean;
    },
  ) {
    const res = await fetch(`/api/dashboard/calls/${id}/history`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseJson<{ data: CallRecord; history: CallHistoryEntry }>(res);
  },

  async previewImport(rows: ImportRowInput[]) {
    const res = await fetch("/api/dashboard/calls/import", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "preview", rows }),
    });
    return parseJson<{
      total: number;
      valid: number;
      newCount: number;
      existingCount: number;
      fileDuplicates: number;
      errors: { row: number; message: string }[];
      preview: ImportRowInput[];
    }>(res);
  },

  async executeImport(
    rows: ImportRowInput[],
    strategy: "skip" | "update",
  ) {
    const res = await fetch("/api/dashboard/calls/import", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "execute", rows, strategy }),
    });
    return parseJson<{
      processed: number;
      inserted: number;
      skipped: number;
      updated: number;
      errors: { row: number; message: string }[];
    }>(res);
  },
};

export type { ImportField, ImportRowInput };
