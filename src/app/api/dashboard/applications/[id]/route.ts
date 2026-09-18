import { NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth/session";
import {
  archiveApplication,
  getApplicationById,
  updateApplication,
} from "@/lib/applications/service";
import type { ApplicationStatus } from "@/types";

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
    });

    if (!updated) {
      return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Değişiklikler kaydedilemedi." },
      { status: 500 },
    );
  }
}
