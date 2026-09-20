import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  type DbCallHistoryRow,
  type DbCallRecordRow,
  isCallStatus,
  mapCallHistory,
  mapCallRecord,
} from "@/lib/calls/map";
import {
  formatPhoneDisplay,
  isValidTRMobile,
  normalizePhoneTR,
} from "@/lib/calls/phone";
import {
  IMPORT_MAX_ROWS,
  type NormalizedImportRow,
  normalizeImportRows,
  type ImportRowInput,
} from "@/lib/calls/import";
import type {
  CallFilters,
  CallHistoryEntry,
  CallRecord,
  CallStatus,
  PaginatedResult,
} from "@/types";

const RECORD_COLUMNS =
  "id, full_name, phone, phone_normalized, city, district, source, status, note, personnel_name, last_called_at, next_action_at, created_at, updated_at";

const HISTORY_COLUMNS =
  "id, call_record_id, admin_id, status, note, called_at, next_action_at, created_at";

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfTodayISO() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

async function profileNameMap(ids: (string | null | undefined)[]) {
  const unique = [...new Set(ids.filter(Boolean) as string[])];
  if (!unique.length) return new Map<string, string>();

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", unique);

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set(row.id as string, (row.full_name as string | null) || "—");
  }
  return map;
}

function withAdmin(
  row: DbCallHistoryRow,
  names: Map<string, string>,
): DbCallHistoryRow {
  return {
    ...row,
    admin: row.admin_id
      ? { id: row.admin_id, full_name: names.get(row.admin_id) ?? null }
      : null,
  };
}

/** Unique free-text personnel names from call_records (for filter dropdown). */
export async function listPersonnelNames(): Promise<string[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("call_records")
    .select("personnel_name")
    .not("personnel_name", "is", null)
    .neq("personnel_name", "")
    .order("personnel_name", { ascending: true })
    .limit(2000);

  if (error) throw new Error("list_personnel_failed");

  const unique = new Set<string>();
  for (const row of data ?? []) {
    const name = String(row.personnel_name ?? "").trim();
    if (name) unique.add(name);
  }
  return [...unique].sort((a, b) =>
    a.localeCompare(b, "tr", { sensitivity: "base" }),
  );
}

export async function listCallRecords(
  filters: CallFilters = {},
): Promise<PaginatedResult<CallRecord>> {
  const admin = createAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 50));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("call_records")
    .select(RECORD_COLUMNS, { count: "exact" });

  const quick = filters.quickFilter ?? "all";
  if (quick === "today") {
    query = query
      .gte("next_action_at", startOfTodayISO())
      .lte("next_action_at", endOfTodayISO());
  } else if (quick === "follow_up") {
    query = query
      .not("next_action_at", "is", null)
      .lte("next_action_at", endOfTodayISO())
      .neq("status", "archived");
  } else if (
    quick === "not_called" ||
    quick === "interested" ||
    quick === "face_to_face_planned" ||
    quick === "positive" ||
    quick === "negative"
  ) {
    query = query.eq("status", quick);
  }

  if (filters.status && isCallStatus(filters.status)) {
    query = query.eq("status", filters.status);
  }
  if (filters.personnelName?.trim()) {
    query = query.eq("personnel_name", filters.personnelName.trim());
  }
  if (filters.city?.trim()) {
    query = query.ilike("city", `%${filters.city.trim()}%`);
  }
  if (filters.dateFrom) {
    query = query.gte("next_action_at", filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte("next_action_at", filters.dateTo);
  }
  if (filters.search?.trim()) {
    const s = filters.search.trim().replace(/[%_,]/g, "");
    const phoneNorm = normalizePhoneTR(s);
    if (phoneNorm) {
      query = query.or(
        `full_name.ilike.%${s}%,phone.ilike.%${s}%,phone_normalized.eq.${phoneNorm},city.ilike.%${s}%,source.ilike.%${s}%,personnel_name.ilike.%${s}%`,
      );
    } else {
      query = query.or(
        `full_name.ilike.%${s}%,phone.ilike.%${s}%,city.ilike.%${s}%,source.ilike.%${s}%,note.ilike.%${s}%,personnel_name.ilike.%${s}%`,
      );
    }
  }

  const { data, error, count } = await query
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error("list_failed");

  const rows = (data ?? []) as unknown as DbCallRecordRow[];
  const total = count ?? 0;

  return {
    data: rows.map(mapCallRecord),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listAllCallRecordsFiltered(
  filters: Omit<CallFilters, "page" | "pageSize"> = {},
): Promise<CallRecord[]> {
  const result = await listCallRecords({
    ...filters,
    page: 1,
    pageSize: 100,
  });
  if (result.total <= result.data.length) return result.data;

  const all: CallRecord[] = [...result.data];
  for (let p = 2; p <= result.totalPages; p += 1) {
    const next = await listCallRecords({ ...filters, page: p, pageSize: 100 });
    all.push(...next.data);
  }
  return all;
}

export async function getCallRecord(id: string): Promise<CallRecord | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("call_records")
    .select(RECORD_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("get_failed");
  if (!data) return null;
  return mapCallRecord(data as unknown as DbCallRecordRow);
}

export async function createCallRecord(
  input: {
    fullName?: string;
    phone: string;
    city?: string;
    district?: string;
    source?: string;
    status?: CallStatus;
    note?: string;
    personnelName?: string;
    nextActionAt?: string | null;
  },
  adminId: string,
): Promise<CallRecord> {
  const phoneNormalized = normalizePhoneTR(input.phone);
  if (!isValidTRMobile(phoneNormalized)) {
    throw new Error("invalid_phone");
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("call_records")
    .select("id")
    .eq("phone_normalized", phoneNormalized!)
    .maybeSingle();
  if (existing) throw new Error("duplicate_phone");

  const status =
    input.status && isCallStatus(input.status) ? input.status : "not_called";

  const { data, error } = await admin
    .from("call_records")
    .insert({
      full_name: input.fullName?.trim() || null,
      phone: formatPhoneDisplay(phoneNormalized),
      phone_normalized: phoneNormalized,
      city: input.city?.trim() || null,
      district: input.district?.trim() || null,
      source: input.source?.trim() || null,
      status,
      note: input.note?.trim() || null,
      personnel_name: input.personnelName?.trim() || null,
      next_action_at: input.nextActionAt || null,
    })
    .select(RECORD_COLUMNS)
    .single();

  if (error || !data) throw new Error("create_failed");

  if (status !== "not_called" || input.note?.trim()) {
    await admin.from("call_history").insert({
      call_record_id: data.id,
      admin_id: adminId,
      status,
      note: input.note?.trim() || null,
      next_action_at: input.nextActionAt || null,
    });
  }

  return mapCallRecord(data as unknown as DbCallRecordRow);
}

export async function updateCallRecord(
  id: string,
  input: {
    fullName?: string;
    phone?: string;
    city?: string;
    district?: string;
    source?: string;
    status?: CallStatus;
    note?: string;
    personnelName?: string;
    lastCalledAt?: string | null;
    nextActionAt?: string | null;
  },
): Promise<CallRecord> {
  const admin = createAdminClient();
  const patch: Record<string, unknown> = {};

  if (input.fullName !== undefined) {
    patch.full_name = input.fullName.trim() || null;
  }
  if (input.phone !== undefined) {
    const phoneNormalized = normalizePhoneTR(input.phone);
    if (!isValidTRMobile(phoneNormalized)) throw new Error("invalid_phone");
    const { data: existing } = await admin
      .from("call_records")
      .select("id")
      .eq("phone_normalized", phoneNormalized!)
      .neq("id", id)
      .maybeSingle();
    if (existing) throw new Error("duplicate_phone");
    patch.phone = formatPhoneDisplay(phoneNormalized);
    patch.phone_normalized = phoneNormalized;
  }
  if (input.city !== undefined) patch.city = input.city.trim() || null;
  if (input.district !== undefined) {
    patch.district = input.district.trim() || null;
  }
  if (input.source !== undefined) patch.source = input.source.trim() || null;
  if (input.status !== undefined) {
    if (!isCallStatus(input.status)) throw new Error("invalid_status");
    patch.status = input.status;
  }
  if (input.note !== undefined) patch.note = input.note.trim() || null;
  if (input.personnelName !== undefined) {
    patch.personnel_name = input.personnelName.trim() || null;
  }
  if (input.lastCalledAt !== undefined) {
    patch.last_called_at = input.lastCalledAt;
  }
  if (input.nextActionAt !== undefined) {
    patch.next_action_at = input.nextActionAt || null;
  }

  const { data, error } = await admin
    .from("call_records")
    .update(patch)
    .eq("id", id)
    .select(RECORD_COLUMNS)
    .single();

  if (error || !data) throw new Error("update_failed");
  return mapCallRecord(data as unknown as DbCallRecordRow);
}

export async function deleteCallRecord(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("call_records").delete().eq("id", id);
  if (error) throw new Error("delete_failed");
}

export async function listCallHistory(
  callRecordId: string,
): Promise<CallHistoryEntry[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("call_history")
    .select(HISTORY_COLUMNS)
    .eq("call_record_id", callRecordId)
    .order("called_at", { ascending: false });

  if (error) throw new Error("history_failed");
  const rows = (data ?? []) as unknown as DbCallHistoryRow[];
  const names = await profileNameMap(rows.map((r) => r.admin_id));
  return rows.map((r) => mapCallHistory(withAdmin(r, names)));
}

export async function addCallHistory(
  callRecordId: string,
  adminId: string,
  input: {
    status: CallStatus;
    note?: string;
    nextActionAt?: string | null;
    updateLastCalled?: boolean;
  },
): Promise<{ record: CallRecord; history: CallHistoryEntry }> {
  if (!isCallStatus(input.status)) throw new Error("invalid_status");

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const recordPatch: Record<string, unknown> = {
    status: input.status,
  };
  if (input.note !== undefined && input.note.trim()) {
    recordPatch.note = input.note.trim();
  }
  if (input.nextActionAt !== undefined) {
    recordPatch.next_action_at = input.nextActionAt || null;
  }
  if (input.updateLastCalled !== false) {
    recordPatch.last_called_at = now;
  }

  const { data: record, error: recordError } = await admin
    .from("call_records")
    .update(recordPatch)
    .eq("id", callRecordId)
    .select(RECORD_COLUMNS)
    .single();

  if (recordError || !record) throw new Error("update_failed");

  const { data: history, error: historyError } = await admin
    .from("call_history")
    .insert({
      call_record_id: callRecordId,
      admin_id: adminId,
      status: input.status,
      note: input.note?.trim() || null,
      called_at: now,
      next_action_at: input.nextActionAt || null,
    })
    .select(HISTORY_COLUMNS)
    .single();

  if (historyError || !history) throw new Error("history_failed");

  const historyRow = history as unknown as DbCallHistoryRow;
  const names = await profileNameMap([historyRow.admin_id]);

  return {
    record: mapCallRecord(record as unknown as DbCallRecordRow),
    history: mapCallHistory(withAdmin(historyRow, names)),
  };
}

export async function previewImportDuplicates(
  rows: NormalizedImportRow[],
): Promise<{
  newCount: number;
  existingCount: number;
  existingPhones: Set<string>;
}> {
  if (!rows.length) {
    return { newCount: 0, existingCount: 0, existingPhones: new Set() };
  }

  const admin = createAdminClient();
  const phones = rows.map((r) => r.phoneNormalized);
  const existingPhones = new Set<string>();

  const chunkSize = 200;
  for (let i = 0; i < phones.length; i += chunkSize) {
    const chunk = phones.slice(i, i + chunkSize);
    const { data, error } = await admin
      .from("call_records")
      .select("phone_normalized")
      .in("phone_normalized", chunk);
    if (error) throw new Error("preview_failed");
    for (const row of data ?? []) {
      existingPhones.add(row.phone_normalized as string);
    }
  }

  const existingCount = rows.filter((r) =>
    existingPhones.has(r.phoneNormalized),
  ).length;
  return {
    newCount: rows.length - existingCount,
    existingCount,
    existingPhones,
  };
}

export async function importCallRecords(
  rows: ImportRowInput[],
  strategy: "skip" | "update",
): Promise<{
  processed: number;
  inserted: number;
  skipped: number;
  updated: number;
  errors: { row: number; message: string }[];
}> {
  if (rows.length > IMPORT_MAX_ROWS) {
    throw new Error("too_many_rows");
  }

  const { valid, errors, fileDuplicates } = normalizeImportRows(rows);
  const { existingPhones } = await previewImportDuplicates(valid);

  const admin = createAdminClient();
  let inserted = 0;
  let skipped = fileDuplicates;
  let updated = 0;
  const resultErrors = [...errors];

  for (const row of valid) {
    try {
      const exists = existingPhones.has(row.phoneNormalized);
      if (exists && strategy === "skip") {
        skipped += 1;
        continue;
      }

      if (exists && strategy === "update") {
        const { data: current, error: findError } = await admin
          .from("call_records")
          .select("id")
          .eq("phone_normalized", row.phoneNormalized)
          .maybeSingle();
        if (findError || !current) {
          resultErrors.push({
            row: row.row,
            message: "Mevcut kayıt bulunamadı.",
          });
          continue;
        }

        const { error: updateError } = await admin
          .from("call_records")
          .update({
            full_name: row.fullName || null,
            phone: row.phone,
            city: row.city || null,
            district: row.district || null,
            source: row.source || null,
            note: row.note || null,
            status: row.status,
            personnel_name: row.personnelName || null,
          })
          .eq("id", current.id);

        if (updateError) {
          resultErrors.push({
            row: row.row,
            message: "Kayıt güncellenemedi.",
          });
          continue;
        }
        updated += 1;
        continue;
      }

      const { error: insertError } = await admin.from("call_records").insert({
        full_name: row.fullName || null,
        phone: row.phone,
        phone_normalized: row.phoneNormalized,
        city: row.city || null,
        district: row.district || null,
        source: row.source || null,
        note: row.note || null,
        status: row.status,
        personnel_name: row.personnelName || null,
      });

      if (insertError) {
        resultErrors.push({
          row: row.row,
          message: "Kayıt eklenemedi.",
        });
        continue;
      }
      inserted += 1;
    } catch {
      resultErrors.push({
        row: row.row,
        message: "İçe aktarma tamamlanamadı.",
      });
    }
  }

  return {
    processed: inserted + updated + skipped,
    inserted,
    skipped,
    updated,
    errors: resultErrors,
  };
}

export async function getCallQuickStats() {
  const admin = createAdminClient();
  const todayStart = startOfTodayISO();
  const todayEnd = endOfTodayISO();

  const [todayRes, followRes] = await Promise.all([
    admin
      .from("call_records")
      .select("id", { count: "exact", head: true })
      .gte("next_action_at", todayStart)
      .lte("next_action_at", todayEnd),
    admin
      .from("call_records")
      .select("id", { count: "exact", head: true })
      .not("next_action_at", "is", null)
      .lte("next_action_at", todayEnd)
      .neq("status", "archived"),
  ]);

  return {
    today: todayRes.count ?? 0,
    followUp: followRes.count ?? 0,
  };
}
