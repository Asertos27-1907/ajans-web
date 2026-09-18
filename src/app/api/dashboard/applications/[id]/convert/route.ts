import { requireDashboardApi, serverError, unauthorized } from "@/lib/api/auth";
import { convertApplicationToActor } from "@/lib/actors/service";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: Ctx) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const { id } = await context.params;
    const actor = await convertApplicationToActor(id);
    return NextResponse.json(actor);
  } catch (err) {
    if (err instanceof Error && err.message === "already_converted") {
      return NextResponse.json(
        { error: "Bu başvuru zaten oyuncuya dönüştürülmüş." },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "application_not_found") {
      return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
    }
    return serverError("Oyuncuya dönüştürme başarısız.");
  }
}
