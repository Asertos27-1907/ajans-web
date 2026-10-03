import {
  badRequest,
  requireDashboardApi,
  serverError,
  unauthorized,
} from "@/lib/api/auth";
import {
  addActorPhotos,
  deleteActor,
  deleteActorPhoto,
  getActorById,
  reorderActorPhotos,
  setActorPrimaryPhoto,
  updateActor,
} from "@/lib/actors/service";
import type { Gender } from "@/types";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: Ctx) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();
  try {
    const { id } = await context.params;
    const actor = await getActorById(id);
    if (!actor) return NextResponse.json({ error: "Oyuncu bulunamadı." }, { status: 404 });
    return NextResponse.json(actor);
  } catch {
    return serverError("Oyuncu yüklenemedi.");
  }
}

export async function PATCH(request: Request, context: Ctx) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const { id } = await context.params;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const action = String(formData.get("action") || "");

      if (action === "add_photos") {
        const photos = formData
          .getAll("photos")
          .filter((v): v is File => v instanceof File && v.size > 0);
        if (!photos.length) return badRequest("Fotoğraf seçin.");
        const actor = await addActorPhotos(id, photos);
        return NextResponse.json(actor);
      }

      if (action === "delete_photo") {
        const photoId = String(formData.get("photo_id") || "");
        if (!photoId) return badRequest("Fotoğraf seçilmedi.");
        const actor = await deleteActorPhoto(id, photoId);
        return NextResponse.json(actor);
      }

      if (action === "set_primary") {
        const photoId = String(formData.get("photo_id") || "");
        if (!photoId) return badRequest("Fotoğraf seçilmedi.");
        const actor = await setActorPrimaryPhoto(id, photoId);
        return NextResponse.json(actor);
      }

      if (action === "reorder_photos") {
        const raw = String(formData.get("ordered_ids") || "[]");
        const orderedIds = JSON.parse(raw) as string[];
        const actor = await reorderActorPhotos(id, orderedIds);
        return NextResponse.json(actor);
      }

      const updated = await updateActor(id, {
        firstName: String(formData.get("first_name") || undefined) || undefined,
        lastName: String(formData.get("last_name") || undefined) || undefined,
        phone: String(formData.get("phone") ?? "") || undefined,
        birthDate: String(formData.get("birth_date") || undefined) || undefined,
        gender: (String(formData.get("gender") || "") as Gender) || undefined,
        city: String(formData.get("city") || undefined) || undefined,
        heightCm: formData.get("height_cm")
          ? Number(formData.get("height_cm"))
          : undefined,
        weightKg: formData.get("weight_kg")
          ? Number(formData.get("weight_kg"))
          : undefined,
        age: formData.get("age") ? Number(formData.get("age")) : undefined,
        hairColor: String(formData.get("hair_color") ?? "") || undefined,
        eyeColor: String(formData.get("eye_color") ?? "") || undefined,
        experience: String(formData.get("experience") ?? ""),
        projects: String(formData.get("projects") ?? ""),
        adminNotes: String(formData.get("admin_note") ?? ""),
        isActive:
          formData.get("active") == null
            ? undefined
            : formData.get("active") !== "false",
        showOnWebsite:
          formData.get("is_public") == null
            ? undefined
            : formData.get("is_public") === "true",
        isFeatured:
          formData.get("is_featured") == null
            ? undefined
            : formData.get("is_featured") === "true",
        displayOrder: formData.get("display_order")
          ? Number(formData.get("display_order"))
          : formData.get("display_order") === ""
            ? null
            : undefined,
      });

      const photos = formData
        .getAll("photos")
        .filter((v): v is File => v instanceof File && v.size > 0);
      if (photos.length) {
        await addActorPhotos(id, photos);
      }

      return NextResponse.json(updated ?? (await getActorById(id)));
    }

    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      phone?: string;
      birthDate?: string;
      gender?: Gender;
      city?: string;
      heightCm?: number | null;
      weightKg?: number | null;
      age?: number | null;
      hairColor?: string;
      eyeColor?: string;
      experience?: string;
      projects?: string;
      adminNotes?: string;
      isActive?: boolean;
      showOnWebsite?: boolean;
      isFeatured?: boolean;
      displayOrder?: number | null;
      deletePhotoId?: string;
      primaryPhotoId?: string;
      orderedPhotoIds?: string[];
    };

    if (body.deletePhotoId) {
      return NextResponse.json(await deleteActorPhoto(id, body.deletePhotoId));
    }
    if (body.primaryPhotoId) {
      return NextResponse.json(
        await setActorPrimaryPhoto(id, body.primaryPhotoId),
      );
    }
    if (body.orderedPhotoIds) {
      return NextResponse.json(
        await reorderActorPhotos(id, body.orderedPhotoIds),
      );
    }

    const updated = await updateActor(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Oyuncu bulunamadı." }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    const message =
      err instanceof Error && err.message.length < 80
        ? err.message
        : "Oyuncu güncellenemedi.";
    if (
      message.includes("JPG") ||
      message.includes("MB") ||
      message.includes("Fotoğraf")
    ) {
      return badRequest(message);
    }
    return serverError("Oyuncu güncellenemedi.");
  }
}

export async function DELETE(_req: Request, context: Ctx) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();
  try {
    const { id } = await context.params;
    await deleteActor(id);
    return NextResponse.json({ ok: true });
  } catch {
    return serverError("Oyuncu silinemedi.");
  }
}
