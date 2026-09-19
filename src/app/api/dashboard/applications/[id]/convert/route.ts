import {
  requireDashboardApi,
  serverError,
  unauthorized,
} from "@/lib/api/auth";
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
    const message = err instanceof Error ? err.message : "unknown";

    if (process.env.NODE_ENV === "development") {
      console.warn("[api/convert]", { message });
    }

    if (message === "already_converted") {
      return NextResponse.json(
        { error: "Bu başvuru zaten oyuncuya dönüştürülmüş." },
        { status: 409 },
      );
    }
    if (message === "application_not_found") {
      return NextResponse.json(
        { error: "Başvuru bulunamadı." },
        { status: 404 },
      );
    }
    if (message === "permission_denied") {
      return NextResponse.json(
        {
          error:
            "Oyuncu tablosu erişim izni eksik. Supabase SQL Editor'da src/lib/actors/fix-actors-access.sql dosyasını çalıştırın.",
        },
        { status: 403 },
      );
    }
    if (message === "copy_failed") {
      return NextResponse.json(
        {
          error:
            "Fotoğraflar kopyalanamadı. actor-photos / application-photos storage izinlerini kontrol edin.",
        },
        { status: 500 },
      );
    }
    return serverError("Oyuncuya dönüştürme başarısız.");
  }
}
