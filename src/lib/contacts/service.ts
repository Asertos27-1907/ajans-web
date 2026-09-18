import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ContactMessage, ContactStatus } from "@/types";

interface DbContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

function mapContact(row: DbContact): ContactMessage {
  const status = (
    ["new", "read", "resolved", "archived"].includes(row.status)
      ? row.status
      : "new"
  ) as ContactStatus;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    subject: row.subject,
    message: row.message,
    status,
    isRead: status !== "new",
    createdAt: row.created_at,
  };
}

export async function createContact(input: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  honeypot?: string;
}) {
  if (input.honeypot?.trim()) {
    return { ok: true as const };
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (!name || !email || !subject || !message) {
    throw new Error("validation_failed");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("invalid_email");
  }
  if (message.length > 5000) throw new Error("validation_failed");

  const admin = createAdminClient();
  const { error } = await admin.from("contacts").insert({
    name,
    email,
    phone: input.phone?.trim() || null,
    subject,
    message,
    status: "new",
  });

  if (error) throw new Error("create_failed");
  return { ok: true as const };
}

export async function listContacts(): Promise<ContactMessage[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("contacts")
    .select("id, name, email, phone, subject, message, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error("list_failed");
  return ((data ?? []) as DbContact[]).map(mapContact);
}

export async function updateContactStatus(id: string, status: ContactStatus) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("contacts")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error("update_failed");
}

export async function getContactStats() {
  const admin = createAdminClient();
  const { count } = await admin
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");
  return { unread: count ?? 0, new: count ?? 0 };
}
