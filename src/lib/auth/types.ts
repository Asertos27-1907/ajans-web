export type ProfileRole = "owner" | "admin";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: ProfileRole;
  active: boolean;
}

export function isDashboardRole(role: string | null | undefined): role is ProfileRole {
  return role === "owner" || role === "admin";
}

export function canManageAdmins(role: ProfileRole): boolean {
  return role === "owner";
}
