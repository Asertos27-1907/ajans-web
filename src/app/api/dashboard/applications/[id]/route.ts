import { NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth/session";
import {
  archiveApplication,
  getApplicationById,
  updateApplication,
} from "@/lib/applications/service";
import type { ApplicationStatus, Gender } from "@/types";

async function requireDashboardApi() {
  const auth = await getAuthProfile();
  if (!auth?.profile.active) return null;
  return auth;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireDashboardApi();
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const app = await getApplicationById(id);
    if (!app) {
      return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
    }
    return NextResponse.json(app);
  } catch {
    return NextResponse.json(
      { error: "Başvuru yüklenemedi." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireDashboardApi();
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      status?: ApplicationStatus;
      adminNotes?: string;
      tags?: string[];
      archive?: boolean;
      birthDate?: string | null;
      gender?: Gender | "" | null;
      heightCm?: number | null;
      weightKg?: number | null;
      experience?: string | null;
    };

    if (body.archive) {
      const archived = await archiveApplication(id);
      if (!archived) {
        return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
      }
      return NextResponse.json(archived);
    }

    const updated = await updateApplication(id, {
      status: body.status,
      adminNotes: body.adminNotes,
      tags: body.tags,
      birthDate: body.birthDate,
      gender: body.gender,
      heightCm: body.heightCm,
      weightKg: body.weightKg,
      experience: body.experience,
    });

    if (!updated) {
      return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (
      message &&
      message !== "update_failed" &&
      message !== "validation_failed"
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Değişiklikler kaydedilemedi." },
      { status: 500 },
    );
  }
}
