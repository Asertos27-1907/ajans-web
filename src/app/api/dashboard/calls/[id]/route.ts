import { NextResponse } from "next/server";
import {
  badRequest,
  requireDashboardApi,
  serverError,
  unauthorized,
} from "@/lib/api/auth";
import { isCallStatus } from "@/lib/calls/map";
import {
  deleteCallRecord,
  getCallRecord,
  updateCallRecord,
} from "@/lib/calls/service";
import type { CallStatus } from "@/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const { id } = await context.params;
    const data = await getCallRecord(id);
    if (!data) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
    return NextResponse.json({ data });
  } catch {
    return serverError("Kayıt yüklenemedi.");
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      fullName?: string;
      phone?: string;
      city?: string;
      district?: string;
      source?: string;
      status?: CallStatus;
      note?: string;
      personnelName?: string;
      lastCalledAt?: string | null;
      nextActionAt?: string | null;
    };

    if (body.status !== undefined && !isCallStatus(body.status)) {
      return badRequest("Geçersiz durum.");
    }

    const data = await updateCallRecord(id, body);
    return NextResponse.json({ data });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "invalid_phone") {
      return badRequest("Geçersiz telefon numarası.");
    }
    if (code === "duplicate_phone") {
      return badRequest("Bu kayıt zaten mevcut.");
    }
    if (code === "invalid_status") {
      return badRequest("Geçersiz durum.");
    }
    return serverError("Kayıt güncellenemedi.");
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const { id } = await context.params;
    await deleteCallRecord(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "invalid_id") {
      return badRequest("Geçersiz kayıt kimliği.");
    }
    if (code === "not_found") {
      return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
    }
    return serverError("Kayıt silinemedi.");
  }
}
