"use client";

import { useEffect, useState, useTransition } from "react";
import { Download, Phone, Plus, Trash2, Upload, X } from "lucide-react";
import { callRepository } from "@/lib/repositories";
import type { CallFilters, CallHistoryEntry, CallRecord, CallStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { EmptyState, PageHeader } from "@/components/ui/StatusBadge";
import { CallStatusBadge } from "@/components/dashboard/CallStatusBadge";
import { CallImportModal } from "@/components/dashboard/CallImportModal";
import { ExportDialog } from "@/components/dashboard/ExportDialog";
import { CALL_EXPORT_COLUMNS, CALL_STATUS_LABELS } from "@/config/constants";
import { phoneTelHref } from "@/lib/calls/phone";
import {
  cn,
  formatDateShort,
  formatDateTimeTR,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/lib/utils";

const QUICK_FILTERS: { key: NonNullable<CallFilters["quickFilter"]>; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "today", label: "Bugün Aranacaklar" },
  { key: "follow_up", label: "Takip Bekleyenler" },
  { key: "not_called", label: "Aranmadı" },
  { key: "interested", label: "İlgileniyor" },
  { key: "face_to_face_planned", label: "Görüşme Planlandı" },
  { key: "positive", label: "Olumlu" },
  { key: "negative", label: "Olumsuz" },
];

const QUICK_ACTIONS: { status: CallStatus; label: string }[] = [
  { status: "call_again", label: "Arandı" },
  { status: "unreachable", label: "Ulaşılamadı" },
  { status: "call_again", label: "Tekrar Aranacak" },
  { status: "interested", label: "İlgileniyor" },
  { status: "meeting_done", label: "Görüşme Yapıldı" },
  { status: "face_to_face_planned", label: "Yüz Yüze Görüşme Planlandı" },
  { status: "positive", label: "Olumlu" },
  { status: "negative", label: "Olumsuz" },
];

const emptyForm = {
  fullName: "",
  phone: "",
  city: "",
  district: "",
  source: "",
  status: "not_called" as CallStatus,
  note: "",
  personnelName: "",
  nextActionAt: "",
};

export default function CallsAdminPage() {
  const [items, setItems] = useState<CallRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [personnelOptions, setPersonnelOptions] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [personnelFilter, setPersonnelFilter] = useState("");
  const [city, setCity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [quickFilter, setQuickFilter] =
    useState<NonNullable<CallFilters["quickFilter"]>>("all");

  const [selected, setSelected] = useState<CallRecord | null>(null);
  const [history, setHistory] = useState<CallHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [edit, setEdit] = useState(emptyForm);
  const [actionNote, setActionNote] = useState("");
  const [actionNext, setActionNext] = useState("");
  const [saving, setSaving] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportRows, setExportRows] = useState<Record<string, unknown>[]>([]);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    mode: "single" | "bulk";
    ids: string[];
  } | null>(null);

  const [, startTransition] = useTransition();

  const allChecked =
    items.length > 0 && items.every((i) => checkedIds.includes(i.id));
  const someChecked = checkedIds.length > 0;

  function buildFilters(
    overrides: Partial<CallFilters> = {},
  ): CallFilters {
    return {
      search: search || undefined,
      status: (status as CallStatus) || undefined,
      personnelName: personnelFilter || undefined,
      city: city || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      quickFilter,
      page,
      pageSize: 50,
      ...overrides,
    };
  }

  function load(overrides: Partial<CallFilters> = {}) {
    const filters = buildFilters(overrides);
    setLoading(true);
    setError("");
    startTransition(async () => {
      try {
        const result = await callRepository.list(filters);
        setItems(result.data);
        setTotal(result.total);
        setPage(result.page);
        setTotalPages(result.totalPages);
        setCheckedIds((prev) =>
          prev.filter((id) => result.data.some((r) => r.id === id)),
        );
        if (selected) {
          const fresh = result.data.find((r) => r.id === selected.id);
          if (fresh) {
            setSelected(fresh);
            syncEdit(fresh);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Arama kayıtları yüklenemedi.",
        );
        setItems([]);
      } finally {
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    callRepository
      .listPersonnelNames()
      .then(setPersonnelOptions)
      .catch(() => setPersonnelOptions([]));
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function syncEdit(record: CallRecord) {
    setEdit({
      fullName: record.fullName,
      phone: record.phone,
      city: record.city,
      district: record.district,
      source: record.source,
      status: record.status,
      note: record.note,
      personnelName: record.personnelName || "",
      nextActionAt: toDatetimeLocalValue(record.nextActionAt),
    });
  }

  async function openRecord(record: CallRecord) {
    setSelected(record);
    syncEdit(record);
    setActionNote("");
    setActionNext(toDatetimeLocalValue(record.nextActionAt));
    setHistoryLoading(true);
    try {
      setHistory(await callRepository.history(record.id));
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  function closeDrawer() {
    setSelected(null);
    setHistory([]);
  }

  function toggleCheck(id: string) {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleCheckAll() {
    if (allChecked) setCheckedIds([]);
    else setCheckedIds(items.map((i) => i.id));
  }

  function askDeleteSingle(id: string) {
    setDeleteConfirm({ mode: "single", ids: [id] });
  }

  function askDeleteBulk() {
    if (!checkedIds.length) return;
    setDeleteConfirm({ mode: "bulk", ids: [...checkedIds] });
  }

  async function confirmDelete() {
    if (!deleteConfirm?.ids.length) return;
    setDeleting(true);
    setError("");
    setSuccessMsg("");
    try {
      if (deleteConfirm.mode === "single") {
        await callRepository.remove(deleteConfirm.ids[0]);
        setSuccessMsg("Kayıt silindi.");
      } else {
        await callRepository.bulkRemove(deleteConfirm.ids);
        setSuccessMsg(
          deleteConfirm.ids.length === 1
            ? "Kayıt silindi."
            : `${deleteConfirm.ids.length} kayıt silindi.`,
        );
      }
      const removed = new Set(deleteConfirm.ids);
      setItems((prev) => prev.filter((r) => !removed.has(r.id)));
      setTotal((t) => Math.max(0, t - deleteConfirm.ids.length));
      setCheckedIds((prev) => prev.filter((id) => !removed.has(id)));
      if (selected && removed.has(selected.id)) {
        closeDrawer();
      }
      setDeleteConfirm(null);
      refreshPersonnelOptions();
      load({ page });
    } catch {
      setError("Kayıt silinemedi.");
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  }

  async function saveRecord() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const updated = await callRepository.update(selected.id, {
        fullName: edit.fullName,
        phone: edit.phone,
        city: edit.city,
        district: edit.district,
        source: edit.source,
        status: edit.status,
        note: edit.note,
        personnelName: edit.personnelName,
        nextActionAt: fromDatetimeLocalValue(edit.nextActionAt),
      });
      setSelected(updated);
      syncEdit(updated);
      load({ page });
      refreshPersonnelOptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function refreshPersonnelOptions() {
    try {
      setPersonnelOptions(await callRepository.listPersonnelNames());
    } catch {
      /* keep existing */
    }
  }

  async function runQuickAction(statusValue: CallStatus) {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const result = await callRepository.addHistory(selected.id, {
        status: statusValue,
        note: actionNote || undefined,
        nextActionAt: fromDatetimeLocalValue(actionNext),
        updateLastCalled: true,
      });
      setSelected(result.data);
      syncEdit(result.data);
      setHistory((prev) => [result.history, ...prev]);
      setActionNote("");
      load({ page });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Arama sonucu kaydedilemedi.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function createRecord() {
    setSaving(true);
    setError("");
    try {
      const created = await callRepository.create({
        fullName: createForm.fullName,
        phone: createForm.phone,
        city: createForm.city,
        district: createForm.district,
        source: createForm.source,
        status: createForm.status,
        note: createForm.note,
        personnelName: createForm.personnelName,
        nextActionAt: fromDatetimeLocalValue(createForm.nextActionAt),
      });
      setCreateOpen(false);
      setCreateForm(emptyForm);
      load({ page: 1 });
      refreshPersonnelOptions();
      openRecord(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt eklenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    setError("");
    try {
      const base = buildFilters({ page: 1, pageSize: 100 });
      const result = await callRepository.list(base);
      let rows = result.data;
      if (result.total > rows.length) {
        const all: CallRecord[] = [...rows];
        for (let p = 2; p <= result.totalPages; p += 1) {
          const next = await callRepository.list({
            ...base,
            page: p,
          });
          all.push(...next.data);
        }
        rows = all;
      }

      const mapped = rows.map((r) => ({
        fullName: r.fullName,
        phone: r.phone,
        city: r.city,
        district: r.district,
        source: r.source,
        status: CALL_STATUS_LABELS[r.status] || r.status,
        lastCalledAt: r.lastCalledAt ? formatDateTimeTR(r.lastCalledAt) : "",
        nextActionAt: r.nextActionAt ? formatDateTimeTR(r.nextActionAt) : "",
        personnelName: r.personnelName || "",
        note: r.note,
      }));

      setExportRows(mapped);
      setExportOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dışa aktarma başarısız.");
    }
  }

  function applyFilters() {
    setPage(1);
    load({ page: 1 });
  }

  return (
    <div>
      <PageHeader
        title="Aramalar"
        description={`${total} kayıt`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download size={14} /> Excel Dışa Aktar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(true)}
            >
              <Upload size={14} /> Excel İçe Aktar
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus size={14} /> Yeni Kayıt
            </Button>
          </>
        }
      />

      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      {successMsg ? (
        <p className="mb-3 text-sm text-[#027a48]">{successMsg}</p>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              setQuickFilter(f.key);
              setPage(1);
              load({ page: 1, quickFilter: f.key });
            }}
            className={cn(
              "rounded border px-3 py-1.5 text-xs font-medium",
              quickFilter === f.key
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-ink-muted hover:bg-bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-3 rounded border border-border bg-surface p-4 md:grid-cols-2 xl:grid-cols-6">
        <FormField label="Arama">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, telefon, şehir..."
          />
        </FormField>
        <FormField label="Durum">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tümü</option>
            {Object.entries(CALL_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Personel">
          <Select
            value={personnelFilter}
            onChange={(e) => setPersonnelFilter(e.target.value)}
          >
            <option value="">Tümü</option>
            {personnelOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Şehir">
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Şehir"
          />
        </FormField>
        <FormField label="Takip başlangıç">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </FormField>
        <FormField label="Takip bitiş">
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </FormField>
        <div className="flex items-end gap-2 xl:col-span-6">
          <Button size="sm" onClick={applyFilters}>
            Filtrele
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearch("");
              setStatus("");
              setPersonnelFilter("");
              setCity("");
              setDateFrom("");
              setDateTo("");
              setQuickFilter("all");
              setPage(1);
              load({
                page: 1,
                search: undefined,
                status: undefined,
                personnelName: undefined,
                city: undefined,
                dateFrom: undefined,
                dateTo: undefined,
                quickFilter: "all",
              });
            }}
          >
            Temizle
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded" />
          ))}
        </div>
      ) : !items.length ? (
        <EmptyState
          title="Henüz arama kaydı bulunmuyor."
          description="Excel içe aktarın veya yeni kayıt ekleyin."
        />
      ) : (
        <>
          {items.length ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {someChecked ? (
                <p className="text-sm text-ink-muted">
                  {checkedIds.length} kayıt seçildi
                </p>
              ) : null}
              <Button
                size="sm"
                variant="danger"
                onClick={askDeleteBulk}
                disabled={!someChecked || deleting}
              >
                <Trash2 size={14} /> Seçilenleri Sil
              </Button>
            </div>
          ) : null}

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded border border-border bg-surface md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border bg-bg-muted/50 text-xs text-ink-muted">
                  <tr>
                    <th className="w-10 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleCheckAll}
                        aria-label="Tümünü seç"
                      />
                    </th>
                    <th className="px-3 py-2 font-medium">Ad Soyad</th>
                    <th className="px-3 py-2 font-medium">Telefon</th>
                    <th className="px-3 py-2 font-medium">Şehir</th>
                    <th className="px-3 py-2 font-medium">Kaynak</th>
                    <th className="px-3 py-2 font-medium">Durum</th>
                    <th className="px-3 py-2 font-medium">Son Arama</th>
                    <th className="px-3 py-2 font-medium">Sonraki Aksiyon</th>
                    <th className="px-3 py-2 font-medium">Personel</th>
                    <th className="px-3 py-2 font-medium">Güncellendi</th>
                    <th className="px-3 py-2 font-medium">Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => openRecord(row)}
                      className="cursor-pointer border-b border-border/70 hover:bg-bg-muted/40"
                    >
                      <td
                        className="px-3 py-2.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={checkedIds.includes(row.id)}
                          onChange={() => toggleCheck(row.id)}
                          aria-label="Seç"
                        />
                      </td>
                      <td className="px-3 py-2.5 font-medium">
                        {row.fullName || "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <a
                          href={phoneTelHref(row.phoneNormalized || row.phone)}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary hover:underline"
                        >
                          {row.phone}
                        </a>
                      </td>
                      <td className="px-3 py-2.5">{row.city || "—"}</td>
                      <td className="px-3 py-2.5">{row.source || "—"}</td>
                      <td className="px-3 py-2.5">
                        <CallStatusBadge status={row.status} />
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted">
                        {row.lastCalledAt
                          ? formatDateShort(row.lastCalledAt)
                          : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted">
                        {row.nextActionAt
                          ? formatDateShort(row.nextActionAt)
                          : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        {row.personnelName || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted">
                        {formatDateShort(row.updatedAt)}
                      </td>
                      <td
                        className="px-3 py-2.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => askDeleteSingle(row.id)}
                        >
                          Sil
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {items.map((row) => (
              <div
                key={row.id}
                className="rounded border border-border bg-surface p-4"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checkedIds.includes(row.id)}
                    onChange={() => toggleCheck(row.id)}
                    aria-label="Seç"
                  />
                  <button
                    type="button"
                    onClick={() => openRecord(row)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{row.fullName || "—"}</p>
                        <p className="mt-0.5 text-sm text-primary">{row.phone}</p>
                      </div>
                      <CallStatusBadge status={row.status} />
                    </div>
                    <p className="mt-2 text-xs text-ink-muted">
                      {row.city || "—"}
                      {row.source ? ` · ${row.source}` : ""}
                      {row.personnelName ? ` · ${row.personnelName}` : ""}
                    </p>
                    {row.nextActionAt ? (
                      <p className="mt-1 text-xs text-ink-soft">
                        Takip: {formatDateShort(row.nextActionAt)}
                      </p>
                    ) : null}
                  </button>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => askDeleteSingle(row.id)}
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-ink-muted">
                Sayfa {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => {
                    const p = page - 1;
                    setPage(p);
                    load({ page: p });
                  }}
                >
                  Önceki
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => {
                    const p = page + 1;
                    setPage(p);
                    load({ page: p });
                  }}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {!items.length && !loading ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setImportOpen(true)}>
            <Upload size={14} /> Excel İçe Aktar
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> Yeni Kayıt Ekle
          </Button>
        </div>
      ) : null}

      {/* Detail drawer */}
      {selected ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Kapat"
            onClick={closeDrawer}
          />
          <aside className="relative z-10 flex h-full w-full max-w-lg flex-col bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="font-semibold">
                  {selected.fullName || "Kayıt Detayı"}
                </h2>
                <a
                  href={phoneTelHref(selected.phoneNormalized || selected.phone)}
                  className="mt-0.5 inline-flex items-center gap-1 text-sm text-primary"
                >
                  <Phone size={14} /> {selected.phone}
                </a>
              </div>
              <button type="button" onClick={closeDrawer} aria-label="Kapat">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-auto p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Ad Soyad">
                  <Input
                    value={edit.fullName}
                    onChange={(e) =>
                      setEdit((f) => ({ ...f, fullName: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Telefon" required>
                  <Input
                    value={edit.phone}
                    onChange={(e) =>
                      setEdit((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Şehir">
                  <Input
                    value={edit.city}
                    onChange={(e) =>
                      setEdit((f) => ({ ...f, city: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="İlçe">
                  <Input
                    value={edit.district}
                    onChange={(e) =>
                      setEdit((f) => ({ ...f, district: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Kaynak">
                  <Input
                    value={edit.source}
                    onChange={(e) =>
                      setEdit((f) => ({ ...f, source: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Durum">
                  <Select
                    value={edit.status}
                    onChange={(e) =>
                      setEdit((f) => ({
                        ...f,
                        status: e.target.value as CallStatus,
                      }))
                    }
                  >
                    {Object.entries(CALL_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Personel">
                  <Input
                    value={edit.personnelName}
                    onChange={(e) =>
                      setEdit((f) => ({ ...f, personnelName: e.target.value }))
                    }
                    placeholder="Örn. Mehmet Yılmaz"
                  />
                </FormField>
                <FormField label="Sonraki Aksiyon">
                  <Input
                    type="datetime-local"
                    value={edit.nextActionAt}
                    onChange={(e) =>
                      setEdit((f) => ({ ...f, nextActionAt: e.target.value }))
                    }
                  />
                </FormField>
              </div>

              <FormField label="Ana Not">
                <Textarea
                  value={edit.note}
                  onChange={(e) =>
                    setEdit((f) => ({ ...f, note: e.target.value }))
                  }
                />
              </FormField>

              <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
                <span>
                  Son arama:{" "}
                  {selected.lastCalledAt
                    ? formatDateTimeTR(selected.lastCalledAt)
                    : "—"}
                </span>
                <span>·</span>
                <span>
                  Güncellendi: {formatDateTimeTR(selected.updatedAt)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={saveRecord} disabled={saving || deleting}>
                  Kaydet
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={saving || deleting}
                  onClick={() => askDeleteSingle(selected.id)}
                >
                  <Trash2 size={14} /> Kaydı Sil
                </Button>
              </div>

              <div className="rounded border border-border p-3">
                <p className="mb-2 text-sm font-medium">Hızlı Aksiyon</p>
                <FormField label="Not">
                  <Textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    className="min-h-20"
                    placeholder="Görüşme notu..."
                  />
                </FormField>
                <FormField label="Sonraki aksiyon" className="mt-2">
                  <Input
                    type="datetime-local"
                    value={actionNext}
                    onChange={(e) => setActionNext(e.target.value)}
                  />
                </FormField>
                <div className="mt-3 flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <Button
                      key={`${action.label}-${action.status}`}
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={saving}
                      onClick={() => runQuickAction(action.status)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Görüşme Geçmişi</p>
                {historyLoading ? (
                  <div className="skeleton h-20 rounded" />
                ) : !history.length ? (
                  <p className="text-sm text-ink-muted">Henüz geçmiş yok.</p>
                ) : (
                  <ul className="space-y-3">
                    {history.map((h) => (
                      <li
                        key={h.id}
                        className="rounded border border-border bg-bg-muted/30 px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-ink-muted">
                            {formatDateTimeTR(h.calledAt)}
                          </span>
                          <CallStatusBadge status={h.status} />
                          {h.adminName ? (
                            <span className="text-xs text-ink-soft">
                              {h.adminName}
                            </span>
                          ) : null}
                        </div>
                        {h.note ? (
                          <p className="mt-1 text-sm whitespace-pre-wrap">
                            “{h.note}”
                          </p>
                        ) : null}
                        {h.nextActionAt ? (
                          <p className="mt-1 text-xs text-ink-muted">
                            Sonraki: {formatDateTimeTR(h.nextActionAt)}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Create modal */}
      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded border border-border bg-surface p-5 shadow-xl">
            <h2 className="text-lg font-semibold">Yeni Kayıt</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FormField label="Ad Soyad">
                <Input
                  value={createForm.fullName}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, fullName: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Telefon" required>
                <Input
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Şehir">
                <Input
                  value={createForm.city}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, city: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="İlçe">
                <Input
                  value={createForm.district}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, district: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Kaynak">
                <Input
                  value={createForm.source}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, source: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Durum">
                <Select
                  value={createForm.status}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      status: e.target.value as CallStatus,
                    }))
                  }
                >
                  {Object.entries(CALL_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Personel">
                <Input
                  value={createForm.personnelName}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      personnelName: e.target.value,
                    }))
                  }
                  placeholder="Örn. Mehmet Yılmaz"
                />
              </FormField>
              <FormField label="Sonraki Aksiyon">
                <Input
                  type="datetime-local"
                  value={createForm.nextActionAt}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      nextActionAt: e.target.value,
                    }))
                  }
                />
              </FormField>
            </div>
            <FormField label="Not" className="mt-3">
              <Textarea
                value={createForm.note}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, note: e.target.value }))
                }
              />
            </FormField>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateOpen(false);
                  setCreateForm(emptyForm);
                }}
              >
                İptal
              </Button>
              <Button
                onClick={createRecord}
                disabled={saving || !createForm.phone.trim()}
              >
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <CallImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onDone={() => {
          load({ page: 1 });
          refreshPersonnelOptions();
        }}
      />

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Aramaları Dışa Aktar"
        columns={CALL_EXPORT_COLUMNS}
        rows={exportRows}
        filename="aramalar"
      />

      {deleteConfirm ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded border border-border bg-surface p-5 shadow-xl">
            <h2 className="text-lg font-semibold">
              {deleteConfirm.mode === "bulk" && deleteConfirm.ids.length > 1
                ? "Seçili kayıtları silmek istediğinize emin misiniz?"
                : "Kaydı silmek istediğinize emin misiniz?"}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              {deleteConfirm.mode === "bulk" && deleteConfirm.ids.length > 1
                ? `Seçili ${deleteConfirm.ids.length} kayıt kalıcı olarak silinecek.`
                : "Bu kayıt ve bağlı görüşme geçmişi kalıcı olarak silinecek. Bu işlem geri alınamaz."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={deleting}
                onClick={() => setDeleteConfirm(null)}
              >
                Vazgeç
              </Button>
              <Button
                variant="danger"
                disabled={deleting}
                onClick={confirmDelete}
              >
                {deleting ? "Siliniyor..." : "Kalıcı Olarak Sil"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
