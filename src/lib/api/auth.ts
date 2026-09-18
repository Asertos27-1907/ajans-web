import { NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth/session";
import { canManageAdmins } from "@/lib/auth/types";

export async function requireDashboardApi() {
  const auth = await getAuthProfile();
  if (!auth?.profile.active) return null;
  return auth;
}

export async function requireOwnerApi() {
  const auth = await requireDashboardApi();
  if (!auth || !canManageAdmins(auth.profile.role)) return null;
  return auth;
}

export function unauthorized() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
}

export function forbidden(message = "Bu işlem için yetkiniz yok.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(message = "İşlem başarısız oldu.") {
  return NextResponse.json({ error: message }, { status: 500 });
}
