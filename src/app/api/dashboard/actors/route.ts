import {
  badRequest,
  requireDashboardApi,
  serverError,
  unauthorized,
} from "@/lib/api/auth";
import {
  createActor,
  getActorStats,
  listActors,
} from "@/lib/actors/service";
import type { Gender } from "@/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("mode") === "stats") {
      return NextResponse.json(await getActorStats());
    }

    const status = searchParams.get("isActive");
    const result = await listActors({
      search: searchParams.get("search") || undefined,
      gender: (searchParams.get("gender") as Gender) || undefined,
      isActive:
        status === "" || status == null
          ? undefined
          : status === "1" || status === "true",
      page: Number(searchParams.get("page") || 1),
      pageSize: Number(searchParams.get("pageSize") || 60),
    });
    return NextResponse.json(result);
  } catch {
    return serverError("Oyuncular yüklenemedi.");
  }
}

export async function POST(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const formData = await request.formData();
    const photos = formData
      .getAll("photos")
      .filter((v): v is File => v instanceof File && v.size > 0);

    const firstName = String(formData.get("first_name") || "").trim();
    const lastName = String(formData.get("last_name") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const birthDate = String(formData.get("birth_date") || "").trim();
    const gender = String(formData.get("gender") || "").trim() as Gender;

    if (!firstName || !lastName || !city || !birthDate || !gender) {
      return badRequest("Zorunlu alanları doldurun.");
    }

    const actor = await createActor({
      firstName,
      lastName,
      phone: String(formData.get("phone") || "").trim() || undefined,
      birthDate,
      gender,
      city,
      heightCm: formData.get("height_cm")
        ? Number(formData.get("height_cm"))
        : undefined,
      weightKg: formData.get("weight_kg")
        ? Number(formData.get("weight_kg"))
        : undefined,
      experience: String(formData.get("experience") || ""),
      isActive: formData.get("active") !== "false",
      photos,
    });

    return NextResponse.json(actor);
  } catch {
    return serverError("Oyuncu oluşturulamadı.");
  }
}
