"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { actorRepository } from "@/lib/repositories";
import type { Actor } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Field";
import { EmptyState, PageHeader } from "@/components/ui/StatusBadge";
import { ExportDialog } from "@/components/dashboard/ExportDialog";
import { ACTOR_EXPORT_COLUMNS, GENDER_LABELS } from "@/config/constants";
import { fullName } from "@/lib/utils";

export default function ActorsAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<Actor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showOnWebsite, setShowOnWebsite] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportRows, setExportRows] = useState<Actor[]>([]);
  const [creating, setCreating] = useState(false);
  const [, startTransition] = useTransition();

  function load() {
    setLoading(true);
    startTransition(async () => {
      const result = await actorRepository.list({
        search: search || undefined,
        showOnWebsite:
          showOnWebsite === "" ? undefined : showOnWebsite === "1",
        page: 1,
        pageSize: 30,
      });
      setItems(result.data);
      setTotal(result.total);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createActor() {
    setCreating(true);
    const actor = await actorRepository.create({
      firstName: "Yeni",
      lastName: "Oyuncu",
      birthDate: "2000-01-01",
      age: 26,
      city: "İzmir",
      gender: "kadin",
      heightCm: 170,
      weightKg: 55,
      hairColor: "Kahverengi",
      eyeColor: "Kahverengi",
      bodySize: "M",
      bio: "Yeni eklenen oyuncu profili.",
      experiences: "",
      projects: "",
      photos: [],
      coverPhotoUrl: "/placeholders/actor-01.jpg",
      isActive: true,
      showOnWebsite: false,
      isFeatured: false,
    });
    setCreating(false);
    router.push(`/dashboard/oyuncular/${actor.id}`);
  }

  async function openExport(mode: "all" | "filtered" | "selected") {
    if (mode === "selected") {
      setExportRows(items.filter((i) => selected.includes(i.id)));
    } else if (mode === "all") {
      setExportRows(await actorRepository.getAllRaw());
    } else {
      setExportRows(items);
    }
    setExportOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Oyuncular"
        description={`${total} kayıt`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => openExport("filtered")}>
              <Download size={14} /> Export
            </Button>
            <Button size="sm" onClick={createActor} disabled={creating}>
              <Plus size={14} /> Yeni oyuncu
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3 rounded border border-border bg-surface p-4">
        <FormField label="Ara">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} />
        </FormField>
        <FormField label="Web'de göster">
          <Select value={showOnWebsite} onChange={(e) => setShowOnWebsite(e.target.value)}>
            <option value="">Tümü</option>
            <option value="1">Evet</option>
            <option value="0">Hayır</option>
          </Select>
        </FormField>
        <div className="flex items-end">
          <Button onClick={load}>Filtrele</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-surface">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded" />
            ))}
          </div>
        ) : !items.length ? (
          <div className="p-4">
            <EmptyState title="Oyuncu bulunamadı" />
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-bg-warm/50 text-xs text-ink-muted">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && items.every((i) => selected.includes(i.id))}
                    onChange={(e) =>
                      setSelected(e.target.checked ? items.map((i) => i.id) : [])
                    }
                  />
                </th>
                <th className="px-3 py-3">Foto</th>
                <th className="px-3 py-3">Ad Soyad</th>
                <th className="px-3 py-3">Yaş</th>
                <th className="px-3 py-3">Şehir</th>
                <th className="px-3 py-3">Cinsiyet</th>
                <th className="px-3 py-3">Web</th>
                <th className="px-3 py-3">Öne çıkan</th>
                <th className="px-3 py-3">Aktif</th>
                <th className="px-3 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((actor) => (
                <tr key={actor.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(actor.id)}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked
                            ? [...prev, actor.id]
                            : prev.filter((id) => id !== actor.id),
                        )
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded bg-bg-warm">
                      <Image src={actor.coverPhotoUrl} alt="" fill className="object-cover" sizes="40px" />
                    </div>
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {fullName(actor.firstName, actor.lastName)}
                  </td>
                  <td className="px-3 py-2">{actor.age}</td>
                  <td className="px-3 py-2">{actor.city}</td>
                  <td className="px-3 py-2">{GENDER_LABELS[actor.gender]}</td>
                  <td className="px-3 py-2">{actor.showOnWebsite ? "Evet" : "Hayır"}</td>
                  <td className="px-3 py-2">{actor.isFeatured ? "Evet" : "Hayır"}</td>
                  <td className="px-3 py-2">{actor.isActive ? "Evet" : "Hayır"}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/dashboard/oyuncular/${actor.id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      Düzenle
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
        title="Oyuncu dışa aktar"
        columns={[...ACTOR_EXPORT_COLUMNS]}
        rows={exportRows as unknown as Record<string, unknown>[]}
        filename="oyuncular"
      />
    </div>
  );
}
