"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Field";
import { exportToCsv, exportToXlsx, type ExportColumn } from "@/lib/export";

export function ExportDialog({
  open,
  onClose,
  title,
  columns,
  rows,
  filename,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  columns: readonly ExportColumn[] | ExportColumn[];
  rows: Record<string, unknown>[];
  filename: string;
}) {
  const allKeys = useMemo(() => columns.map((c) => c.key), [columns]);
  const [selected, setSelected] = useState<string[]>([...allKeys]);
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");

  if (!open) return null;

  const activeCols = columns.filter((c) => selected.includes(c.key));

  function toggle(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function run() {
    if (!activeCols.length) return;
    if (format === "csv") exportToCsv(rows, activeCols, filename);
    else exportToXlsx(rows, activeCols, filename);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded border border-border bg-surface p-5 shadow-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {rows.length} kayıt · kolon seçin
        </p>
        <div className="mt-4 grid max-h-56 grid-cols-2 gap-2 overflow-auto">
          {columns.map((col) => (
            <label key={col.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(col.key)}
                onChange={() => toggle(col.key)}
              />
              {col.label}
            </label>
          ))}
        </div>
        <div className="mt-4">
          <FormField label="Format">
            <Select
              value={format}
              onChange={(e) => setFormat(e.target.value as "csv" | "xlsx")}
            >
              <option value="csv">CSV</option>
              <option value="xlsx">XLSX</option>
            </Select>
          </FormField>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={run} disabled={!activeCols.length}>
            Dışa aktar
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Ara..."}
      className="max-w-xs"
    />
  );
}
