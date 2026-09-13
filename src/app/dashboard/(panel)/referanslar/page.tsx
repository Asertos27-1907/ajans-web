"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { referenceRepository } from "@/lib/repositories";
import type { ReferenceCategory, ReferenceProject } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { EmptyState, PageHeader } from "@/components/ui/StatusBadge";
import { CATEGORY_LABELS } from "@/config/constants";

export default function ReferencesAdminPage() {
  const [items, setItems] = useState<ReferenceProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ReferenceProject | null>(null);
  const [, startTransition] = useTransition();

  function load() {
    setLoading(true);
    startTransition(async () => {
      setItems(await referenceRepository.list());
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function createNew() {
    const item = await referenceRepository.create({
      title: "Yeni Referans",
      category: "diger",
      year: new Date().getFullYear(),
      description: "",
      coverImageUrl: "/placeholders/ref-01.jpg",
      actorIds: [],
      isFeatured: false,
      isActive: true,
      sortOrder: items.length + 1,
    });
    setEditing(item);
    load();
  }

  async function save() {
    if (!editing) return;
    await referenceRepository.update(editing.id, editing);
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Silinsin mi?")) return;
    await referenceRepository.remove(id);
    if (editing?.id === id) setEditing(null);
    load();
  }

  return (
    <div>
      <PageHeader
        title="Referanslar"
        description="Proje referanslarını yönetin"
        actions={
          <Button size="sm" onClick={createNew}>
            Yeni referans
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded" />
            ))
          ) : !items.length ? (
            <EmptyState title="Referans yok" />
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                className="flex gap-3 rounded border border-border bg-surface p-3"
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-bg-warm">
                  <Image src={item.coverImageUrl} alt="" fill className="object-cover" sizes="96px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-xs text-ink-muted">
                    {CATEGORY_LABELS[item.category]} · {item.year} · sıra {item.sortOrder}
                  </p>
                  <div className="mt-2 flex gap-2 text-xs">
                    <button type="button" className="underline" onClick={() => setEditing(item)}>
                      Düzenle
                    </button>
                    <button type="button" className="underline" onClick={() => remove(item.id)}>
                      Sil
                    </button>
                  </div>
                </div>
                <div className="text-right text-[11px] text-ink-soft">
                  <p>{item.isActive ? "Aktif" : "Pasif"}</p>
                  <p>{item.isFeatured ? "Öne çıkan" : ""}</p>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="rounded border border-border bg-surface p-5">
          {editing ? (
            <div className="space-y-3">
              <h2 className="font-semibold">Referans düzenle</h2>
              <FormField label="Proje adı">
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </FormField>
              <FormField label="Kategori">
                <Select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      category: e.target.value as ReferenceCategory,
                    })
                  }
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Yıl">
                <Input
                  type="number"
                  value={editing.year}
                  onChange={(e) =>
                    setEditing({ ...editing, year: Number(e.target.value) })
                  }
                />
              </FormField>
              <FormField label="Açıklama">
                <Textarea
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Kapak görseli">
                <Input
                  value={editing.coverImageUrl}
                  onChange={(e) =>
                    setEditing({ ...editing, coverImageUrl: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Gösterim sırası">
                <Input
                  type="number"
                  value={editing.sortOrder}
                  onChange={(e) =>
                    setEditing({ ...editing, sortOrder: Number(e.target.value) })
                  }
                />
              </FormField>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.isActive}
                  onChange={(e) =>
                    setEditing({ ...editing, isActive: e.target.checked })
                  }
                />
                Aktif
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.isFeatured}
                  onChange={(e) =>
                    setEditing({ ...editing, isFeatured: e.target.checked })
                  }
                />
                Öne çıkar
              </label>
              <Button onClick={save}>Kaydet</Button>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">Düzenlemek için bir referans seçin.</p>
          )}
        </div>
      </div>
    </div>
  );
}
