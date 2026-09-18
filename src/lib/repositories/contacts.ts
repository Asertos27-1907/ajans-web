import type { ContactMessage, ContactStatus } from "@/types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "İşlem başarısız.");
  }
  return data;
}

export const contactRepository = {
  async list(): Promise<ContactMessage[]> {
    const res = await fetch("/api/dashboard/contacts", {
      credentials: "same-origin",
      cache: "no-store",
    });
    const json = await parseJson<{ data: ContactMessage[] }>(res);
    return json.data;
  },

  async create(input: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    website?: string;
  }) {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseJson(res);
  },

  async markRead(id: string, isRead = true) {
    await this.updateStatus(id, isRead ? "read" : "new");
  },

  async updateStatus(id: string, status: ContactStatus) {
    const res = await fetch("/api/dashboard/contacts", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await parseJson(res);
  },

  async stats() {
    const res = await fetch("/api/dashboard/contacts?mode=stats", {
      credentials: "same-origin",
      cache: "no-store",
    });
    return parseJson<{ unread: number; new: number }>(res);
  },
};
