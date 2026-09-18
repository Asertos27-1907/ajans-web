import {
  badRequest,
  requireDashboardApi,
  serverError,
  unauthorized,
} from "@/lib/api/auth";
import {
  getContactStats,
  listContacts,
  updateContactStatus,
} from "@/lib/contacts/service";
import type { ContactStatus } from "@/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("mode") === "stats") {
      return NextResponse.json(await getContactStats());
    }
    return NextResponse.json({ data: await listContacts() });
  } catch {
    return serverError("Mesajlar yüklenemedi.");
  }
}

export async function PATCH(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const body = (await request.json()) as { id?: string; status?: ContactStatus };
    if (!body.id || !body.status) return badRequest("Geçersiz istek.");
    if (!["new", "read", "resolved", "archived"].includes(body.status)) {
      return badRequest("Geçersiz durum.");
    }
    await updateContactStatus(body.id, body.status);
    return NextResponse.json({ ok: true });
  } catch {
    return serverError("Durum güncellenemedi.");
  }
}
