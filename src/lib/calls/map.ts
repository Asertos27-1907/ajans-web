import type {
  CallHistoryEntry,
  CallRecord,
  CallStatus,
} from "@/types";

export const CALL_STATUSES = [
  "not_called",
  "unreachable",
  "call_again",
  "interested",
  "meeting_done",
  "face_to_face_planned",
  "positive",
  "negative",
  "archived",
] as const;

export function isCallStatus(value: string): value is CallStatus {
  return (CALL_STATUSES as readonly string[]).includes(value);
}

export interface DbCallRecordRow {
  id: string;
  full_name: string | null;
  phone: string;
  phone_normalized: string;
  city: string | null;
  district: string | null;
  source: string | null;
  status: string;
  note: string | null;
  assigned_to?: string | null;
  personnel_name: string | null;
  last_called_at: string | null;
  next_action_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCallHistoryRow {
  id: string;
  call_record_id: string;
  admin_id: string | null;
  status: string;
  note: string | null;
  called_at: string;
  next_action_at: string | null;
  created_at: string;
  admin?: { id: string; full_name: string | null } | null;
}

export function mapCallRecord(row: DbCallRecordRow): CallRecord {
  return {
    id: row.id,
    fullName: row.full_name ?? "",
    phone: row.phone,
    phoneNormalized: row.phone_normalized,
    city: row.city ?? "",
    district: row.district ?? "",
    source: row.source ?? "",
    status: isCallStatus(row.status) ? row.status : "not_called",
    note: row.note ?? "",
    personnelName: row.personnel_name ?? "",
    lastCalledAt: row.last_called_at,
    nextActionAt: row.next_action_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCallHistory(row: DbCallHistoryRow): CallHistoryEntry {
  return {
    id: row.id,
    callRecordId: row.call_record_id,
    adminId: row.admin_id,
    adminName: row.admin?.full_name ?? null,
    status: isCallStatus(row.status) ? row.status : "not_called",
    note: row.note ?? "",
    calledAt: row.called_at,
    nextActionAt: row.next_action_at,
    createdAt: row.created_at,
  };
}
