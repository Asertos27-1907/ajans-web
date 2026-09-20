import {
  formatPhoneDisplay,
  isValidTRMobile,
  normalizePhoneTR,
} from "@/lib/calls/phone";
import { isCallStatus } from "@/lib/calls/map";
import type { CallStatus } from "@/types";

export const IMPORT_MAX_BYTES = 10 * 1024 * 1024;
export const IMPORT_MAX_ROWS = 5000;

export type ImportField =
  | "full_name"
  | "phone"
  | "city"
  | "district"
  | "source"
  | "note"
  | "status"
  | "personnel_name"
  | "skip";

export const IMPORT_FIELD_LABELS: Record<ImportField, string> = {
  skip: "Kullanma",
  full_name: "Ad Soyad",
  phone: "Telefon",
  city: "Şehir",
  district: "İlçe",
  source: "Kaynak",
  note: "Not",
  status: "Durum",
  personnel_name: "Personel",
};

const HEADER_ALIASES: Record<ImportField, string[]> = {
  skip: [],
  full_name: [
    "ad soyad",
    "ad",
    "isim",
    "isim soyisim",
    "name",
    "full name",
    "fullname",
    "adsoyad",
  ],
  phone: [
    "telefon",
    "telefon no",
    "telefon numarası",
    "telefon numarasi",
    "gsm",
    "cep",
    "phone",
    "mobile",
    "tel",
  ],
  city: ["şehir", "sehir", "il", "city"],
  district: ["ilçe", "ilce", "district"],
  source: ["kaynak", "source", "liste", "liste adı", "liste adi"],
  note: ["not", "açıklama", "aciklama", "notes", "note"],
  status: ["durum", "status"],
  personnel_name: [
    "personel",
    "personel adı",
    "personel adi",
    "görevli",
    "gorevli",
    "sorumlu",
    "yetkili",
    "staff",
    "personnel",
  ],
};

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ");
}

export function guessField(header: string): ImportField {
  const key = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [
    ImportField,
    string[],
  ][]) {
    if (field === "skip") continue;
    if (aliases.includes(key)) return field;
  }
  return "skip";
}

export function autoMapHeaders(headers: string[]): Record<string, ImportField> {
  const mapping: Record<string, ImportField> = {};
  const used = new Set<ImportField>();

  for (const header of headers) {
    const guessed = guessField(header);
    if (guessed !== "skip" && !used.has(guessed)) {
      mapping[header] = guessed;
      used.add(guessed);
    } else {
      mapping[header] = "skip";
    }
  }
  return mapping;
}

export interface ImportRowInput {
  full_name?: string;
  phone?: string;
  city?: string;
  district?: string;
  source?: string;
  note?: string;
  status?: string;
  personnel_name?: string;
  _row?: number;
}

export interface NormalizedImportRow {
  row: number;
  fullName: string;
  phone: string;
  phoneNormalized: string;
  city: string;
  district: string;
  source: string;
  note: string;
  status: CallStatus;
  personnelName: string;
}

export interface ImportRowError {
  row: number;
  message: string;
}

export function mapRowsWithMapping(
  rawRows: Record<string, unknown>[],
  mapping: Record<string, ImportField>,
): ImportRowInput[] {
  return rawRows.map((raw, index) => {
    const out: ImportRowInput = { _row: index + 2 }; // 1-based + header
    for (const [header, field] of Object.entries(mapping)) {
      if (field === "skip") continue;
      const value = raw[header];
      const text =
        value == null || value === ""
          ? ""
          : typeof value === "string"
            ? value.trim()
            : String(value).trim();
      out[field] = text;
    }
    return out;
  });
}

const STATUS_TR_TO_EN: Record<string, CallStatus> = {
  aranmadı: "not_called",
  aranmadi: "not_called",
  ulaşılamadı: "unreachable",
  ulasilamadi: "unreachable",
  "tekrar aranacak": "call_again",
  ilgileniyor: "interested",
  "görüşme yapıldı": "meeting_done",
  "gorusme yapildi": "meeting_done",
  "yüz yüze görüşme planlandı": "face_to_face_planned",
  "yuz yuze gorusme planlandi": "face_to_face_planned",
  olumlu: "positive",
  olumsuz: "negative",
  arşiv: "archived",
  arsiv: "archived",
};

export function parseImportStatus(raw?: string): CallStatus {
  if (!raw?.trim()) return "not_called";
  const trimmed = raw.trim();
  if (isCallStatus(trimmed)) return trimmed;
  const key = trimmed.toLocaleLowerCase("tr-TR");
  return STATUS_TR_TO_EN[key] ?? "not_called";
}

export function normalizeImportRows(rows: ImportRowInput[]): {
  valid: NormalizedImportRow[];
  errors: ImportRowError[];
  fileDuplicates: number;
} {
  const valid: NormalizedImportRow[] = [];
  const errors: ImportRowError[] = [];
  const seen = new Set<string>();
  let fileDuplicates = 0;

  for (const row of rows) {
    const rowNum = row._row ?? 0;
    const phoneRaw = row.phone?.trim() || "";
    if (!phoneRaw) {
      errors.push({ row: rowNum, message: "Telefon zorunludur." });
      continue;
    }

    const phoneNormalized = normalizePhoneTR(phoneRaw);
    if (!isValidTRMobile(phoneNormalized)) {
      errors.push({
        row: rowNum,
        message: "Geçersiz telefon numarası.",
      });
      continue;
    }

    if (seen.has(phoneNormalized!)) {
      fileDuplicates += 1;
      continue;
    }
    seen.add(phoneNormalized!);

    valid.push({
      row: rowNum,
      fullName: (row.full_name || "").trim(),
      phone: formatPhoneDisplay(phoneNormalized),
      phoneNormalized: phoneNormalized!,
      city: (row.city || "").trim(),
      district: (row.district || "").trim(),
      source: (row.source || "").trim(),
      note: (row.note || "").trim(),
      status: parseImportStatus(row.status),
      personnelName: (row.personnel_name || "").trim(),
    });
  }

  return { valid, errors, fileDuplicates };
}
