import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminRole, AdminUser } from "@/types";

interface DbProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  active: boolean;
  created_at: string;
}

function mapAdmin(row: DbProfile): AdminUser {
  return {
    id: row.id,
    name: row.full_name || row.email || "—",
    email: row.email || "",
    role: (row.role === "owner" ? "owner" : "admin") as AdminRole,
    isActive: Boolean(row.active),
    createdAt: row.created_at,
  };
}

export async function listAdmins(): Promise<AdminUser[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, email, full_name, role, active, created_at")
    .in("role", ["owner", "admin"])
    .order("created_at", { ascending: true });

  if (error) throw new Error("list_failed");
  return ((data ?? []) as DbProfile[]).map(mapAdmin);
}

export async function inviteAdmin(input: {
  email: string;
  fullName: string;
}): Promise<AdminUser> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (!email || !fullName) throw new Error("validation_failed");

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) throw new Error("already_exists");

  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
    });

  if (inviteError) throw new Error("invite_failed");

  const userId = invited.user?.id;
  if (!userId) throw new Error("invite_failed");

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        role: "admin",
        active: true,
      },
      { onConflict: "id" },
    )
    .select("id, email, full_name, role, active, created_at")
    .single();

  if (profileError || !profile) {
    await admin.auth.admin.deleteUser(userId).catch(() => undefined);
    throw new Error("profile_failed");
  }
  return mapAdmin(profile as DbProfile);
}

export async function setAdminActive(input: {
  actorId: string;
  targetId: string;
  active: boolean;
}) {
  if (input.actorId === input.targetId) {
    throw new Error("self_modify");
  }

  const admin = createAdminClient();
  const { data: target } = await admin
    .from("profiles")
    .select("id, role, active")
    .eq("id", input.targetId)
    .maybeSingle();

  if (!target) throw new Error("not_found");
  if (target.role === "owner") throw new Error("owner_protected");

  const { error } = await admin
    .from("profiles")
    .update({ active: input.active })
    .eq("id", input.targetId);

  if (error) throw new Error("update_failed");
}
