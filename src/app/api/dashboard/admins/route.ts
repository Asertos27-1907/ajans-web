import {
  badRequest,
  forbidden,
  requireDashboardApi,
  requireOwnerApi,
  serverError,
  unauthorized,
} from "@/lib/api/auth";
import { inviteAdmin, listAdmins, setAdminActive } from "@/lib/admins/service";
import { canManageAdmins } from "@/lib/auth/types";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();
  if (!canManageAdmins(auth.profile.role)) return forbidden();

  try {
    return NextResponse.json({ data: await listAdmins() });
  } catch {
    return serverError("Admin listesi yüklenemedi.");
  }
}

export async function POST(request: Request) {
  const auth = await requireOwnerApi();
  if (!auth) {
    const base = await requireDashboardApi();
    if (!base) return unauthorized();
    return forbidden();
  }

  try {
    const body = (await request.json()) as {
      email?: string;
      full_name?: string;
      fullName?: string;
      role?: string;
    };
    // role from client is intentionally ignored — invite always creates admin
    void body.role;
    const email = String(body.email || "").trim();
    const fullName = String(body.full_name || body.fullName || "").trim();
    if (!email || !fullName) {
      return badRequest("Ad ve e-posta gerekli.");
    }

    const admin = await inviteAdmin({ email, fullName });
    return NextResponse.json(admin);
  } catch (err) {
    if (err instanceof Error && err.message === "already_exists") {
      return badRequest("Bu e-posta ile kayıtlı bir yönetici zaten var.");
    }
    return serverError("Davet gönderilemedi.");
  }
}

export async function PATCH(request: Request) {
  const auth = await requireOwnerApi();
  if (!auth) {
    const base = await requireDashboardApi();
    if (!base) return unauthorized();
    return forbidden();
  }

  try {
    const body = (await request.json()) as {
      id?: string;
      active?: boolean;
      role?: string;
    };
    // role mutation is not supported
    if (body.role !== undefined) {
      return forbidden("Rol değiştirilemez.");
    }
    if (!body.id || typeof body.active !== "boolean") {
      return badRequest("Geçersiz istek.");
    }

    await setAdminActive({
      actorId: auth.userId,
      targetId: body.id,
      active: body.active,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "self_modify") {
      return forbidden("Kendi hesabınızı pasifleştiremezsiniz.");
    }
    if (err instanceof Error && err.message === "owner_protected") {
      return forbidden("Owner hesabı değiştirilemez.");
    }
    return serverError("Güncelleme başarısız.");
  }
}
