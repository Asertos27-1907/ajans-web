"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Star } from "lucide-react";
import { applicationRepository } from "@/lib/repositories";
import type { Application, ApplicationStatus, Gender } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Field";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui/StatusBadge";
import { ExportDialog } from "@/components/dashboard/ExportDialog";
import { APPLICATION_EXPORT_COLUMNS, GENDER_LABELS, STATUS_LABELS } from "@/config/constants";
import { formatDateShort, fullName } from "@/lib/utils";

export default function ApplicationsAdminPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [hairColor, setHairColor] = useState("");
  const [eyeColor, setEyeColor] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [heightMin, setHeightMin] = useState("");
  const [heightMax, setHeightMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
        hairColor: hairColor || undefined,
        eyeColor: eyeColor || undefined,
        ageMin: ageMin ? Number(ageMin) : undefined,
        ageMax: ageMax ? Number(ageMax) : undefined,
        heightMin: heightMin ? Number(heightMin) : undefined,
        heightMax: heightMax ? Number(heightMax) : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: p,
        pageSize: 20,
      });
      setItems(result.data);
      setTotal(result.total);
      setPage(result.page);
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
        hairColor: hairColor || undefined,
        eyeColor: eyeColor || undefined,
        ageMin: ageMin ? Number(ageMin) : undefined,
        ageMax: ageMax ? Number(ageMax) : undefined,
        heightMin: heightMin ? Number(heightMin) : undefined,
        heightMax: heightMax ? Number(heightMax) : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: 1,
        pageSize: 1000,
      });
      setExportRows(result.data);
    }
    setExportOpen(true);
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
            <Button variant="outline" size="sm" onClick={() => openExport("selected")} disabled={!selected.length}>
              Seçili
            </Button>
            <Button variant="outline" size="sm" onClick={() => openExport("all")}>
              Tümü
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 rounded border border-border bg-surface p-4 md:grid-cols-3 xl:grid-cols-4">
        <FormField label="Ara (ad/soyad/telefon)">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ara..." />
        </FormField>
        <FormField label="Şehir">
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Tümü</option>
            {["İzmir", "İstanbul", "Ankara", "Antalya", "Bursa", "Muğla", "Eskişehir"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Cinsiyet">
          <Select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Tümü</option>
            {Object.entries(GENDER_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Durum">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tümü</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Yaş min">
          <Input type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
        </FormField>
        <FormField label="Yaş max">
          <Input type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
        </FormField>
        <FormField label="Boy min">
          <Input type="number" value={heightMin} onChange={(e) => setHeightMin(e.target.value)} />
        </FormField>
        <FormField label="Boy max">
          <Input type="number" value={heightMax} onChange={(e) => setHeightMax(e.target.value)} />
        </FormField>
        <FormField label="Saç">
          <Input value={hairColor} onChange={(e) => setHairColor(e.target.value)} />
        </FormField>
        <FormField label="Göz">
          <Input value={eyeColor} onChange={(e) => setEyeColor(e.target.value)} />
        </FormField>
        <FormField label="Tarih başlangıç">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </FormField>
        <FormField label="Tarih bitiş">
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </FormField>
        <div className="flex items-end gap-2 md:col-span-3 xl:col-span-4">
          <Button onClick={() => load(1)}>Filtrele</Button>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setCity("");
              setGender("");
              setStatus("");
              setHairColor("");
              setEyeColor("");
              setAgeMin("");
              setAgeMax("");
              setHeightMin("");
              setHeightMax("");
              setDateFrom("");
              setDateTo("");
              setTimeout(() => load(1), 0);
            }}
          >
            Temizle
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-surface">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded" />
            ))}
          </div>
        ) : !items.length ? (
          <div className="p-4">
            <EmptyState title="Başvuru bulunamadı" description="Filtreleri değiştirmeyi deneyin." />
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-bg-warm/50 text-xs text-ink-muted">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked ? items.map((i) => i.id) : [],
                      )
                    }
                  />
                </th>
                <th className="px-3 py-3">Foto</th>
                <th className="px-3 py-3">Ad Soyad</th>
                <th className="px-3 py-3">Yaş</th>
                <th className="px-3 py-3">Şehir</th>
                <th className="px-3 py-3">Boy</th>
                <th className="px-3 py-3">Telefon</th>
                <th className="px-3 py-3">Tarih</th>
                <th className="px-3 py-3">Durum</th>
                <th className="px-3 py-3">Etiket</th>
                <th className="px-3 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((app) => (
                <tr key={app.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(app.id)}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked
                            ? [...prev, app.id]
                            : prev.filter((id) => id !== app.id),
                        )
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded bg-bg-warm">
                      <Image
                        src={app.photos[0]?.thumbnailUrl ?? "/placeholders/actor-01.jpg"}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 font-medium">
                    <span className="inline-flex items-center gap-1">
                      {fullName(app.firstName, app.lastName)}
                      {app.isFavorite ? <Star size={12} className="fill-primary text-primary" /> : null}
                    </span>
                  </td>
                  <td className="px-3 py-2">{app.age}</td>
                  <td className="px-3 py-2">{app.city}</td>
                  <td className="px-3 py-2">{app.heightCm}</td>
                  <td className="px-3 py-2">{app.phone}</td>
                  <td className="px-3 py-2">{formatDateShort(app.createdAt)}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {app.tags.slice(0, 2).map((t) => (
                        <span key={t} className="rounded bg-bg-warm px-1.5 py-0.5 text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/dashboard/basvurular/${app.id}`}
                      className="text-sm font-medium underline-offset-2 hover:underline"
                    >
                      Detay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
