import * as XLSX from "xlsx";
import { escapeCsv, downloadBlob } from "@/lib/utils";

export type ExportColumn = { key: string; label: string };

function getValue(row: Record<string, unknown>, key: string) {
  const v = row[key];
  if (typeof v === "boolean") return v ? "Evet" : "Hayır";
  if (v == null) return "";
  return String(v);
}

export function exportToCsv(
  rows: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
) {
  const header = columns.map((c) => escapeCsv(c.label)).join(",");
  const body = rows
    .map((row) =>
      columns.map((c) => escapeCsv(getValue(row, c.key))).join(","),
    )
    .join("\n");
  const bom = "\uFEFF";
  const blob = new Blob([bom + header + "\n" + body], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(filename.endsWith(".csv") ? filename : `${filename}.csv`, blob);
}

export function exportToXlsx(
  rows: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
) {
  const data = rows.map((row) => {
    const obj: Record<string, string> = {};
    columns.forEach((c) => {
      obj[c.label] = getValue(row, c.key);
    });
    return obj;
  });
  const sheet = XLSX.utils.json_to_sheet(data);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Veri");
  const out = XLSX.write(book, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(
    filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`,
    blob,
  );
}
