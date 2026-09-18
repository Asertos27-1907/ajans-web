import {
  badRequest,
  requireDashboardApi,
  serverError,
  unauthorized,
} from "@/lib/api/auth";
import {
  createReference,
  deleteReference,
  getReferenceStats,
  listReferences,
  updateReference,
} from "@/lib/references/service";
import type { ReferenceCategory } from "@/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("mode") === "stats") {
      return NextResponse.json(await getReferenceStats());
    }
    return NextResponse.json({ data: await listReferences() });
  } catch {
    return serverError("Referanslar yüklenemedi.");
  }
}

export async function POST(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();
  try {
    const body = (await request.json()) as {
      title?: string;
      category?: ReferenceCategory;
      year?: number;
      description?: string;
      coverImageUrl?: string;
      imagePath?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    };
    if (!body.title?.trim()) return badRequest("Başlık gerekli.");
    const item = await createReference({
      title: body.title.trim(),
      category: body.category || "diger",
      year: body.year || new Date().getFullYear(),
      description: body.description,
      imagePath: body.imagePath ?? body.coverImageUrl ?? null,
      active: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    });
    return NextResponse.json(item);
  } catch {
    return serverError("Referans oluşturulamadı.");
  }
}

export async function PATCH(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();
  try {
    const body = (await request.json()) as {
      id?: string;
      title?: string;
      category?: ReferenceCategory;
      year?: number;
      description?: string;
      coverImageUrl?: string;
      imagePath?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    };
    if (!body.id) return badRequest("Geçersiz istek.");
    const item = await updateReference(body.id, {
      title: body.title,
      category: body.category,
      year: body.year,
      description: body.description,
      imagePath: body.imagePath ?? body.coverImageUrl,
      active: body.isActive,
      sortOrder: body.sortOrder,
    });
    return NextResponse.json(item);
  } catch {
    return serverError("Referans güncellenemedi.");
  }
}

export async function DELETE(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return badRequest("Geçersiz istek.");
    await deleteReference(id);
    return NextResponse.json({ ok: true });
  } catch {
    return serverError("Referans silinemedi.");
  }
}
