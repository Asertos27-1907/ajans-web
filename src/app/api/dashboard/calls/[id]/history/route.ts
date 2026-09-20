import { NextResponse } from "next/server";
import {
  badRequest,
  requireDashboardApi,
  serverError,
  unauthorized,
} from "@/lib/api/auth";
import { isCallStatus } from "@/lib/calls/map";
import { addCallHistory, listCallHistory } from "@/lib/calls/service";
import type { CallStatus } from "@/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const { id } = await context.params;
    return NextResponse.json({ data: await listCallHistory(id) });
  } catch {
    return serverError("Görüşme geçmişi yüklenemedi.");
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      status?: CallStatus;
      note?: string;
      nextActionAt?: string | null;
      updateLastCalled?: boolean;
    };

    if (!body.status || !isCallStatus(body.status)) {
      return badRequest("Geçersiz durum.");
    }

    const result = await addCallHistory(id, auth.profile.id, {
      status: body.status,
      note: body.note,
      nextActionAt: body.nextActionAt,
      updateLastCalled: body.updateLastCalled,
    });

    return NextResponse.json({
      data: result.record,
      history: result.history,
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "invalid_status") return badRequest("Geçersiz durum.");
    return serverError("Arama sonucu kaydedilemedi.");
  }
}
