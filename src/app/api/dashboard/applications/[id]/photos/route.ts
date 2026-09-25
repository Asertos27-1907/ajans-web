import { NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth/session";
import { addApplicationPhotos } from "@/lib/applications/service";

export const runtime = "nodejs";

async function requireDashboardApi() {
  const auth = await getAuthProfile();
  if (!auth?.profile.active) return null;
  return auth;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireDashboardApi();
  if (!auth) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const photos = formData
      .getAll("photos")
      .filter((value): value is File => value instanceof File && value.size > 0);

    const updated = await addApplicationPhotos(id, photos);
    if (!updated) {
      return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Fotoğraflar yüklenemedi.";
    const status =
      message.includes("5 fotoğraf") ||
      message.includes("En fazla") ||
      message.includes("En az") ||
      message.includes("JPG") ||
      message.includes("MB")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
