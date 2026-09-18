import {
  requireDashboardApi,
  serverError,
  unauthorized,
} from "@/lib/api/auth";
import {
  getMergedSiteSettings,
  saveSiteSettings,
} from "@/lib/settings/service";
import type { SiteSettings } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();
  try {
    return NextResponse.json(await getMergedSiteSettings());
  } catch {
    return serverError("Ayarlar yüklenemedi.");
  }
}

export async function PUT(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();
  try {
    const body = (await request.json()) as SiteSettings;
    const saved = await saveSiteSettings(body);
    return NextResponse.json(saved);
  } catch {
    return serverError("Ayarlar kaydedilemedi.");
  }
}
