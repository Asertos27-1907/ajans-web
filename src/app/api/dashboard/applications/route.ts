import { NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth/session";
import type { ApplicationFilters, ApplicationStatus, Gender } from "@/types";
import {
  getApplicationStats,
  listAllApplicationsRaw,
  listApplications,
} from "@/lib/applications/service";
import { isApplicationStatus } from "@/lib/applications/map";

async function requireDashboardApi() {
  const auth = await getAuthProfile();
  if (!auth?.profile.active) return null;
  return auth;
}

export async function GET(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    if (mode === "stats") {
      const stats = await getApplicationStats();
      return NextResponse.json(stats);
    }

    if (mode === "all") {
      const data = await listAllApplicationsRaw();
      return NextResponse.json({ data });
    }

    const statusParam = searchParams.get("status") ?? "";
    const filters: ApplicationFilters = {
      search: searchParams.get("search") || undefined,
      city: searchParams.get("city") || undefined,
      gender: (searchParams.get("gender") as Gender) || undefined,
      status: isApplicationStatus(statusParam)
        ? (statusParam as ApplicationStatus)
        : undefined,
      ageMin: searchParams.get("ageMin")
        ? Number(searchParams.get("ageMin"))
        : undefined,
      ageMax: searchParams.get("ageMax")
        ? Number(searchParams.get("ageMax"))
        : undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      pageSize: searchParams.get("pageSize")
        ? Number(searchParams.get("pageSize"))
        : 20,
    };

    const result = await listApplications(filters);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Başvurular yüklenemedi." },
      { status: 500 },
    );
  }
}
