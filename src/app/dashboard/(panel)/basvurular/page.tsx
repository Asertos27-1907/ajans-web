"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Eye, Star } from "lucide-react";
import { applicationRepository } from "@/lib/repositories";
import type { Application, ApplicationStatus, Gender } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Field";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui/StatusBadge";
import { ExportDialog } from "@/components/dashboard/ExportDialog";
import { APPLICATION_EXPORT_COLUMNS, GENDER_LABELS, STATUS_LABELS } from "@/config/constants";
import { formatDateShort, fullName, cn } from "@/lib/utils";

export default function ApplicationsAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportRows, setExportRows] = useState<Application[]>([]);
  const [, startTransition] = useTransition();

  function load(p = page) {
    setLoading(true);
    startTransition(async () => {
      const result = await applicationRepository.list({
        search: search || undefined,
        city: city || undefined,
        gender: (gender as Gender) || undefined,
        status: (status as ApplicationStatus) || undefined,
        ageMin: ageMin ? Number(ageMin) : undefined,
        ageMax: ageMax ? Number(ageMax) : undefined,
        page: p,
        pageSize: 20,
      });
      setItems(result.data);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setLoading(false);
    });
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allChecked = items.length > 0 && items.every((i) => selected.includes(i.id));

  async function openExport(mode: "all" | "filtered" | "selected") {
    if (mode === "selected") {
      setExportRows(items.filter((i) => selected.includes(i.id)));
    } else if (mode === "all") {
      setExportRows(await applicationRepository.getAllRaw());
    } else {
      const result = await applicationRepository.list({
        search: search || undefined,
        city: city || undefined,
        gender: (gender as Gender) || undefined,
        status: (status as ApplicationStatus) || undefined,
        ageMin: ageMin ? Number(ageMin) : undefined,
        ageMax: ageMax ? Number(ageMax) : undefined,
        page: 1,
        pageSize: 1000,
      });
      setExportRows(result.data);
    }
    setExportOpen(true);
  }

  function clearFilters() {
    setSearch("");
    setCity("");
    setGender("");
    setStatus("");
    setAgeMin("");
    setAgeMax("");
    setTimeout(() => load(1), 0);
  }

  function goToDetail(id: string) {
    router.push(`/dashboard/basvurular/${id}`);
  }

  return (
    <div>
      <PageHeader
        title="Başvurular"
        description={`${total} kayıt`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => openExport("filtered")}>
              <Download size={14} /> Filtrelenmiş
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openExport("selected")}
              disabled={!selected.length}
            >
              Seçili
            </Button>
            <Button variant="outline" size="sm" onClick={() => openExport("all")}>
              Tümü
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 rounded border border-border bg-surface p-4 md:grid-cols-3 xl:grid-cols-6">
        <FormField label="Ara (ad / telefon)" className="xl:col-span-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim veya telefon"
          />
        </FormField>
        <FormField label="Şehir">
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Tümü</option>
            {["İzmir", "İstanbul", "Ankara", "Antalya", "Bursa", "Muğla", "Eskişehir"].map(
              (c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ),
            )}
          </Select>
        </FormField>
        <FormField label="Cinsiyet">
          <Select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Tümü</option>
            {Object.entries(GENDER_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Durum">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tümü</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Yaş min">
          <Input type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
        </FormField>
        <FormField label="Yaş max">
          <Input type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
        </FormField>
        <div className="flex items-end gap-2 md:col-span-3 xl:col-span-6">
          <Button onClick={() => load(1)}>Filtrele</Button>
          <Button variant="outline" onClick={clearFilters}>
            Temizle
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-surface">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded" />
            ))}
          </div>
        ) : !items.length ? (
          <div className="p-4">
            <EmptyState title="Başvuru bulunamadı" description="Filtreleri değiştirmeyi deneyin." />
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-bg-muted text-xs text-ink-muted">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer"
                    checked={allChecked}
                    onChange={(e) =>
                      setSelected(e.target.checked ? items.map((i) => i.id) : [])
                    }
                    aria-label="Tümünü seç"
                  />
                </th>
                <th className="px-3 py-3">Fotoğraf</th>
                <th className="px-3 py-3">Ad Soyad</th>
                <th className="px-3 py-3">Telefon</th>
                <th className="px-3 py-3">Yaş</th>
                <th className="px-3 py-3">Şehir</th>
                <th className="px-3 py-3">Cinsiyet</th>
                <th className="px-3 py-3">Boy</th>
                <th className="px-3 py-3">Başvuru tarihi</th>
                <th className="px-3 py-3">Durum</th>
                <th className="px-3 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((app) => (
                <tr
                  key={app.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => goToDetail(app.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToDetail(app.id);
                    }
                  }}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-primary-soft/40"
                >
                  <td
                    className="px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer"
                      checked={selected.includes(app.id)}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked
                            ? [...prev, app.id]
                            : prev.filter((id) => id !== app.id),
                        )
                      }
                      aria-label={`${fullName(app.firstName, app.lastName)} seç`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="relative h-12 w-12 overflow-hidden bg-bg-muted">
                      <Image
                        src={app.photos[0]?.thumbnailUrl ?? "/placeholders/actor-01.jpg"}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      {fullName(app.firstName, app.lastName)}
                      {app.isFavorite ? (
                        <Star size={12} className="fill-primary text-primary" />
                      ) : null}
                    </span>
                  </td>
                  <td className="px-3 py-3">{app.phone}</td>
                  <td className="px-3 py-3">{app.age}</td>
                  <td className="px-3 py-3">{app.city}</td>
                  <td className="px-3 py-3">{GENDER_LABELS[app.gender]}</td>
                  <td className="px-3 py-3">{app.heightCm || "—"}</td>
                  <td className="px-3 py-3">{formatDateShort(app.createdAt)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td
                    className="px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/dashboard/basvurular/${app.id}`}
                      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded border border-border px-3 text-sm font-medium hover:border-primary/40 hover:text-primary"
                    >
                      <Eye size={14} /> Görüntüle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => load(page - 1)}
          >
            Önceki
          </Button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                type="button"
                onClick={() => load(p)}
                className={cn(
                  "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded border px-3 text-sm",
                  p === page
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-ink hover:border-primary/40",
                )}
              >
                {p}
              </button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
          >
            Sonraki
          </Button>
        </div>
      ) : null}

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Başvuru dışa aktar"
        columns={[...APPLICATION_EXPORT_COLUMNS]}
        rows={exportRows as unknown as Record<string, unknown>[]}
        filename="basvurular"
      />
    </div>
  );
}
