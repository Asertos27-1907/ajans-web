import { NextResponse } from "next/server";
import {
  badRequest,
  requireDashboardApi,
  serverError,
  unauthorized,
} from "@/lib/api/auth";
import {
  IMPORT_MAX_ROWS,
  normalizeImportRows,
  type ImportRowInput,
} from "@/lib/calls/import";
import {
  importCallRecords,
  previewImportDuplicates,
} from "@/lib/calls/service";

export async function POST(request: Request) {
  const auth = await requireDashboardApi();
  if (!auth) return unauthorized();

  try {
    const body = (await request.json()) as {
      mode?: "preview" | "execute";
      rows?: ImportRowInput[];
      strategy?: "skip" | "update";
    };

    const rows = Array.isArray(body.rows) ? body.rows : [];
    if (!rows.length) {
      return badRequest("İçe aktarılacak satır bulunamadı.");
    }
    if (rows.length > IMPORT_MAX_ROWS) {
      return badRequest(
        `En fazla ${IMPORT_MAX_ROWS} satır içe aktarılabilir.`,
      );
    }

    const mode = body.mode ?? "execute";

    if (mode === "preview") {
      const { valid, errors, fileDuplicates } = normalizeImportRows(rows);
      const { newCount, existingCount } = await previewImportDuplicates(valid);
      return NextResponse.json({
        total: rows.length,
        valid: valid.length,
        newCount,
        existingCount,
        fileDuplicates,
        errors,
        preview: valid.slice(0, 20).map((r) => ({
          _row: r.row,
          full_name: r.fullName,
          phone: r.phone,
          city: r.city,
          district: r.district,
          source: r.source,
          note: r.note,
          status: r.status,
          personnel_name: r.personnelName,
        })),
      });
    }

    const strategy = body.strategy === "update" ? "update" : "skip";
    const result = await importCallRecords(rows, strategy);
    return NextResponse.json(result);
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "too_many_rows") {
      return badRequest(`En fazla ${IMPORT_MAX_ROWS} satır içe aktarılabilir.`);
    }
    return serverError("İçe aktarma tamamlanamadı.");
  }
}
