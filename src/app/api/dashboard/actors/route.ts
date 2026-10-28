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
    const birthDate = String(formData.get("birth_date") || "").trim() || null;
    const gender = String(formData.get("gender") || "").trim() as Gender;

    if (!firstName || !lastName || !city || !gender) {
      return badRequest("Ad, soyad, şehir ve cinsiyet zorunlu.");
    }

    const heightRaw = String(formData.get("height_cm") || "").trim();
    const weightRaw = String(formData.get("weight_kg") || "").trim();
    const ageRaw = String(formData.get("age") || "").trim();
    const orderRaw = String(formData.get("display_order") || "").trim();

    const actor = await createActor({
      firstName,
      lastName,
      phone: String(formData.get("phone") || "").trim() || undefined,
      birthDate,
      gender,
      city,
      heightCm: heightRaw ? Number(heightRaw) : null,
      weightKg: weightRaw ? Number(weightRaw) : null,
      age: ageRaw ? Number(ageRaw) : null,
      hairColor: String(formData.get("hair_color") || "").trim() || undefined,
      eyeColor: String(formData.get("eye_color") || "").trim() || undefined,
      experience: String(formData.get("experience") || "").trim() || undefined,
      projects: String(formData.get("projects") || "").trim() || undefined,
      adminNotes: String(formData.get("admin_note") || "").trim() || undefined,
      isActive: formData.get("active") !== "false",
      showOnWebsite: formData.get("is_public") === "true",
      isFeatured: formData.get("is_featured") === "true",
      displayOrder: orderRaw ? Number(orderRaw) : null,
      photos,
    });

    return NextResponse.json(actor);
  } catch (err) {
    console.warn("[api/dashboard/actors] POST", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return serverError("Oyuncu oluşturulamadı.");
  }
}
