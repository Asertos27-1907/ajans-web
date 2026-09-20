import { NextResponse } from "next/server";
import {
  badRequest,
  requireDashboardApi,
  serverError,
  unauthorized,
} from "@/lib/api/auth";
import { isCallStatus } from "@/lib/calls/map";
import {
  createCallRecord,
  listAllCallRecordsFiltered,
  listCallRecords,
  listPersonnelNames,
} from "@/lib/calls/service";
import type { CallFilters, CallStatus } from "@/types";

export async function GET(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    if (mode === "personnel") {
      return NextResponse.json({ data: await listPersonnelNames() });
    }

    if (mode === "all") {
      const filters: Omit<CallFilters, "page" | "pageSize"> = {
        search: searchParams.get("search") || undefined,
        status: isCallStatus(searchParams.get("status") || "")
          ? (searchParams.get("status") as CallStatus)
          : undefined,
        personnelName: searchParams.get("personnelName") || undefined,
        city: searchParams.get("city") || undefined,
        quickFilter:
          (searchParams.get("quickFilter") as CallFilters["quickFilter"]) ||
          "all",
        dateFrom: searchParams.get("dateFrom") || undefined,
        dateTo: searchParams.get("dateTo") || undefined,
      };
      return NextResponse.json({
        data: await listAllCallRecordsFiltered(filters),
      });
    }

    const statusParam = searchParams.get("status") || "";
    const filters: CallFilters = {
      search: searchParams.get("search") || undefined,
      status: isCallStatus(statusParam)
        ? (statusParam as CallStatus)
        : undefined,
      personnelName: searchParams.get("personnelName") || undefined,
      city: searchParams.get("city") || undefined,
      quickFilter:
        (searchParams.get("quickFilter") as CallFilters["quickFilter"]) ||
        "all",
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      page: searchParams.get("page")
        ? Number(searchParams.get("page"))
        : 1,
      pageSize: searchParams.get("pageSize")
        ? Number(searchParams.get("pageSize"))
        : 50,
    };

    return NextResponse.json(await listCallRecords(filters));
  } catch {
    return serverError("Arama kayıtları yüklenemedi.");
  }
}

export async function POST(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const body = (await request.json()) as {
      fullName?: string;
      phone?: string;
      city?: string;
      district?: string;
      source?: string;
      status?: CallStatus;
      note?: string;
      personnelName?: string;
      nextActionAt?: string | null;
    };

    if (!body.phone?.trim()) {
      return badRequest("Telefon zorunludur.");
    }

    const data = await createCallRecord(
      {
        fullName: body.fullName,
        phone: body.phone,
        city: body.city,
        district: body.district,
        source: body.source,
        status: body.status,
        note: body.note,
        personnelName: body.personnelName,
        nextActionAt: body.nextActionAt,
      },
      auth.profile.id,
    );
    return NextResponse.json({ data });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "invalid_phone") {
      return badRequest("Geçersiz telefon numarası.");
    }
    if (code === "duplicate_phone") {
      return badRequest("Bu kayıt zaten mevcut.");
    }
    return serverError("Kayıt eklenemedi.");
  }
}
