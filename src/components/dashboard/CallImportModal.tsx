"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/Button";
import { FormField, Select } from "@/components/ui/Field";
import { callRepository } from "@/lib/repositories";
import {
  IMPORT_FIELD_LABELS,
  IMPORT_MAX_BYTES,
  IMPORT_MAX_ROWS,
  autoMapHeaders,
  mapRowsWithMapping,
  type ImportField,
  type ImportRowInput,
} from "@/lib/calls/import";

type Step = "pick" | "map" | "result";

export function CallImportModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState<Step>("pick");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<Record<string, ImportField>>({});
  const [strategy, setStrategy] = useState<"skip" | "update">("skip");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewMeta, setPreviewMeta] = useState<{
    total: number;
    valid: number;
    newCount: number;
    existingCount: number;
    fileDuplicates: number;
    errors: { row: number; message: string }[];
    preview: ImportRowInput[];
  } | null>(null);
  const [result, setResult] = useState<{
    processed: number;
    inserted: number;
    skipped: number;
    updated: number;
    errors: { row: number; message: string }[];
  } | null>(null);

  const mappedFields = useMemo(() => Object.values(mapping), [mapping]);
  const hasPhone = mappedFields.includes("phone");
  const unmatched = headers.filter((h) => mapping[h] === "skip");

  if (!open) return null;

  function reset() {
    setStep("pick");
    setFileName("");
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setStrategy("skip");
    setError("");
    setBusy(false);
    setPreviewMeta(null);
    setResult(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function onFile(file: File | null) {
    setError("");
    setPreviewMeta(null);
    setResult(null);
    if (!file) return;

    if (file.size > IMPORT_MAX_BYTES) {
      setError("Dosya boyutu 10MB sınırını aşıyor.");
      return;
    }

    const lower = file.name.toLowerCase();
    if (!/\.(xlsx|xls|csv)$/.test(lower)) {
      setError("Yalnızca .xlsx, .xls veya .csv dosyaları desteklenir.");
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, {
        type: "array",
        cellFormula: false,
        cellHTML: false,
        raw: false,
      });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        setError("Dosya okunamadı.");
        return;
      }
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: false,
      });

      if (!json.length) {
        setError("Dosyada satır bulunamadı.");
        return;
      }
      if (json.length > IMPORT_MAX_ROWS) {
        setError(`En fazla ${IMPORT_MAX_ROWS} satır içe aktarılabilir.`);
        return;
      }

      const cols = Object.keys(json[0] ?? {});
      if (!cols.length) {
        setError("Dosya okunamadı.");
        return;
      }

      const auto = autoMapHeaders(cols);
      setFileName(file.name);
      setHeaders(cols);
      setRawRows(json);
      setMapping(auto);
      setStep("map");

      if (Object.values(auto).includes("phone")) {
        await runPreview(json, auto);
      }
    } catch {
      setError("Dosya okunamadı.");
    }
  }

  async function runPreview(
    rows = rawRows,
    map = mapping,
  ) {
    if (!Object.values(map).includes("phone")) {
      setError("Telefon sütunu bulunamadı.");
      setPreviewMeta(null);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const mapped = mapRowsWithMapping(rows, map);
      const meta = await callRepository.previewImport(mapped);
      setPreviewMeta(meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Önizleme başarısız.");
    } finally {
      setBusy(false);
    }
  }

  async function execute() {
    if (!hasPhone) {
      setError("Telefon sütunu bulunamadı.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const mapped = mapRowsWithMapping(rawRows, mapping);
      const res = await callRepository.executeImport(mapped, strategy);
      setResult(res);
      setStep("result");
      onDone();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "İçe aktarma tamamlanamadı.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded border border-border bg-surface shadow-xl">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">Excel İçe Aktar</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Google E-Tablolar dosyanızı .xlsx veya .csv olarak indirip buradan
            yükleyebilirsiniz.
          </p>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}

          {step === "pick" ? (
            <div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
              <p className="mt-3 text-xs text-ink-soft">
                Maks. 10MB · {IMPORT_MAX_ROWS} satır · .xlsx / .xls / .csv
              </p>
            </div>
          ) : null}

          {step === "map" ? (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-ink-muted">Dosya:</span> {fileName}
                </p>
                <p>
                  <span className="text-ink-muted">Toplam satır:</span>{" "}
                  {rawRows.length}
                </p>
                <p>
                  <span className="text-ink-muted">Tanınan kolonlar:</span>{" "}
                  {mappedFields.filter((f) => f !== "skip").length}
                </p>
                <p>
                  <span className="text-ink-muted">Eşleşmeyen:</span>{" "}
                  {unmatched.length}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Kolon eşleştirme</p>
                {headers.map((header) => (
                  <div
                    key={header}
                    className="grid grid-cols-2 items-center gap-2"
                  >
                    <span className="truncate text-sm text-ink-muted">
                      {header}
                    </span>
                    <Select
                      value={mapping[header] || "skip"}
                      onChange={(e) => {
                        const next = {
                          ...mapping,
                          [header]: e.target.value as ImportField,
                        };
                        setMapping(next);
                      }}
                    >
                      {(
                        Object.keys(IMPORT_FIELD_LABELS) as ImportField[]
                      ).map((key) => (
                        <option key={key} value={key}>
                          {IMPORT_FIELD_LABELS[key]}
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>

              <FormField label="Tekrar eden kayıtlar">
                <Select
                  value={strategy}
                  onChange={(e) =>
                    setStrategy(e.target.value as "skip" | "update")
                  }
                >
                  <option value="skip">Tekrar Edenleri Atla</option>
                  <option value="update">Mevcut Kaydı Güncelle</option>
                </Select>
              </FormField>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => runPreview()}
                >
                  Önizlemeyi Yenile
                </Button>
              </div>

              {previewMeta ? (
                <div className="rounded border border-border bg-bg-muted/40 p-3 text-sm">
                  <p>
                    Geçerli: {previewMeta.valid} · Yeni: {previewMeta.newCount}{" "}
                    · Mevcut: {previewMeta.existingCount} · Dosya içi tekrar:{" "}
                    {previewMeta.fileDuplicates}
                  </p>
                  {previewMeta.errors.length ? (
                    <p className="mt-1 text-danger">
                      {previewMeta.errors.length} satırda hata var.
                    </p>
                  ) : null}
                  {previewMeta.preview.length ? (
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-ink-muted">
                            <th className="py-1 pr-2">Satır</th>
                            <th className="py-1 pr-2">Ad</th>
                            <th className="py-1 pr-2">Telefon</th>
                            <th className="py-1 pr-2">Şehir</th>
                            <th className="py-1 pr-2">Personel</th>
                            <th className="py-1">Kaynak</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewMeta.preview.map((row) => (
                            <tr key={row._row} className="border-b border-border/60">
                              <td className="py-1 pr-2">{row._row}</td>
                              <td className="py-1 pr-2">{row.full_name || "—"}</td>
                              <td className="py-1 pr-2">{row.phone}</td>
                              <td className="py-1 pr-2">{row.city || "—"}</td>
                              <td className="py-1 pr-2">
                                {row.personnel_name || "—"}
                              </td>
                              <td className="py-1">{row.source || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === "result" && result ? (
            <div className="space-y-2 text-sm">
              <p className="font-medium">İçe aktarma tamamlandı</p>
              <p>{result.processed} kayıt işlendi</p>
              <p>{result.inserted} yeni kayıt</p>
              <p>{result.skipped} tekrar eden atlandı</p>
              <p>{result.updated} kayıt güncellendi</p>
              <p>{result.errors.length} hata</p>
              {result.errors.length ? (
                <ul className="mt-2 max-h-40 overflow-auto text-xs text-danger">
                  {result.errors.slice(0, 50).map((e) => (
                    <li key={`${e.row}-${e.message}`}>
                      Satır {e.row}: {e.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <Button variant="outline" onClick={handleClose}>
            {step === "result" ? "Kapat" : "İptal"}
          </Button>
          {step === "map" ? (
            <Button onClick={execute} disabled={busy || !hasPhone}>
              {busy ? "Aktarılıyor..." : "İçe Aktar"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
