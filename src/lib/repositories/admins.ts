import type { AdminUser } from "@/types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "İşlem başarısız.");
  }
  return data;
}

export const adminRepository = {
  async list(): Promise<AdminUser[]> {
    const res = await fetch("/api/dashboard/admins", {
      credentials: "same-origin",
      cache: "no-store",
    });
    const json = await parseJson<{ data: AdminUser[] }>(res);
    return json.data;
  },

  async invite(input: { name: string; email: string }) {
    const res = await fetch("/api/dashboard/admins", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        full_name: input.name,
      }),
    });
    return parseJson<AdminUser>(res);
  },

  async setActive(id: string, isActive: boolean) {
    const res = await fetch("/api/dashboard/admins", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: isActive }),
    });
    await parseJson(res);
  },
};
