import { NextResponse } from "next/server";
import {
  badRequest,
  requireDashboardApi,
  serverError,
  unauthorized,
} from "@/lib/api/auth";
import { bulkDeleteCallRecords } from "@/lib/calls/service";

export async function POST(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const body = (await request.json()) as { ids?: unknown };
    if (!Array.isArray(body.ids) || !body.ids.length) {
      return badRequest("Silinecek kayıt seçilmedi.");
    }
    if (body.ids.length > 500) {
      return badRequest("En fazla 500 kayıt silinebilir.");
    }
    if (!body.ids.every((id) => typeof id === "string")) {
      return badRequest("Geçersiz kayıt kimliği.");
    }

    const result = await bulkDeleteCallRecords(body.ids);
    return NextResponse.json({ ok: true, deleted: result.deleted });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "invalid_id") {
      return badRequest("Geçersiz kayıt kimliği.");
    }
    if (code === "too_many") {
      return badRequest("En fazla 500 kayıt silinebilir.");
    }
    return serverError("Kayıt silinemedi.");
  }
}
