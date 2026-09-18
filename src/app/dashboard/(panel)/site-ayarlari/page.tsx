"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
} from "lucide-react";
import { settingsRepository } from "@/lib/repositories";
import type {
  AboutFeature,
  AboutParagraph,
  HeroSlide,
  ServiceItem,
  SiteSettings,
} from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea, Select } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

type TabId =
  | "firma"
  | "slider"
  | "hizmetler"
  | "hakkimizda"
  | "istatistikler"
  | "sosyal";

const TABS: { id: TabId; label: string }[] = [
  { id: "firma", label: "Firma Bilgileri" },
  { id: "slider", label: "Slider / Hero" },
  { id: "hizmetler", label: "Hizmetler" },
  { id: "hakkimizda", label: "Hakkımızda" },
  { id: "istatistikler", label: "İstatistikler" },
  { id: "sosyal", label: "Sosyal Medya" },
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [tab, setTab] = useState<TabId>("firma");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setSettings(await settingsRepository.get());
    });
  }, []);

  async function save(next?: SiteSettings) {
    const payload = next ?? settings;
    if (!payload) return;
    setSaving(true);
    setSaveError("");
    try {
      const updated = await settingsRepository.update(payload);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {
      setSaveError("Ayarlar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return <div className="skeleton h-72 rounded" />;
  }

  function moveService(index: number, dir: -1 | 1) {
    const services = [...settings!.services].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    const target = index + dir;
    if (target < 0 || target >= services.length) return;
    const tmp = services[index].sortOrder;
    services[index] = { ...services[index], sortOrder: services[target].sortOrder };
    services[target] = { ...services[target], sortOrder: tmp };
    setSettings({ ...settings!, services });
  }

  return (
    <div>
      <PageHeader
        title="Site Ayarları"
        description="Kısa sekmelerle site içeriğini yönetin"
        actions={
          <Button size="sm" onClick={() => save()} disabled={saving}>
            <Save size={14} />
            {saving ? "Kaydediliyor..." : saved ? "Kaydedildi" : "Kaydet"}
          </Button>
        }
      />

      {saveError ? <p className="mb-3 text-sm text-danger">{saveError}</p> : null}
      <div className="container-settings mx-auto">
        <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border pb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "cursor-pointer whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-ink-muted hover:text-primary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "firma" ? (
          <section className="rounded border border-border bg-surface p-5 md:p-6">
            <h2 className="title-accent text-base font-semibold">Firma Bilgileri</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormField label="Firma Adı" className="sm:col-span-2">
                <Input
                  value={settings.companyName}
                  onChange={(e) =>
                    setSettings({ ...settings, companyName: e.target.value })
                  }
                />
              </FormField>
              <FormField label="E-posta">
                <Input
                  value={settings.email || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: e.target.value || undefined,
                    })
                  }
                  placeholder="Boş bırakılabilir"
                />
              </FormField>
              <FormField label="Telefon">
                <Input
                  value={settings.phone || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      phone: e.target.value || undefined,
                    })
                  }
                  placeholder="Boş bırakılabilir"
                />
              </FormField>
              <FormField label="WhatsApp">
                <Input
                  value={settings.whatsapp || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp: e.target.value || undefined,
                    })
                  }
                  placeholder="Boş bırakılabilir"
                />
              </FormField>
              <FormField label="Logo URL">
                <Input
                  value={settings.logoUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, logoUrl: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Adres" className="sm:col-span-2">
                <Textarea
                  value={settings.addressLines.join("\n")}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      addressLines: e.target.value
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={3}
                />
              </FormField>
              <FormField label="Google Maps URL" className="sm:col-span-2">
                <Input
                  value={settings.googleMapsUrl || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      googleMapsUrl: e.target.value || undefined,
                    })
                  }
                />
              </FormField>
              <FormField label="Google Maps Embed URL" className="sm:col-span-2">
                <Input
                  value={settings.googleMapsEmbedUrl || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      googleMapsEmbedUrl: e.target.value || undefined,
                    })
                  }
                  placeholder="iframe src adresi"
                />
              </FormField>
            </div>
            <div className="mt-5">
              <Button onClick={() => save()}>Kaydet</Button>
            </div>
          </section>
        ) : null}

        {tab === "slider" ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="title-accent text-base font-semibold">Slider / Hero</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const slide: HeroSlide = {
                    id: uid("slide"),
                    title: "Yeni slide başlığı",
                    description: "Kısa açıklama",
                    imageUrl: "/placeholders/hero.jpg",
                    buttonText: "Oyuncu Başvurusu",
                    buttonLink: "/basvuru",
                    isActive: true,
                    sortOrder: settings.slides.length + 1,
                  };
                  setEditingSlide(slide);
                }}
              >
                <Plus size={14} /> Yeni Slide
              </Button>
            </div>

            <div className="space-y-3">
              {[...settings.slides]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((slide) => (
                  <article
                    key={slide.id}
                    className="flex flex-col gap-3 rounded border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{slide.title}</p>
                      <p className="text-xs text-ink-muted">
                        Sıra {slide.sortOrder} · {slide.isActive ? "Aktif" : "Pasif"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSlide(slide)}
                      >
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          const slides = settings.slides.filter(
                            (s) => s.id !== slide.id,
                          );
                          const next = { ...settings, slides };
                          setSettings(next);
                          void save(next);
                        }}
                      >
                        <Trash2 size={14} /> Sil
                      </Button>
                    </div>
                  </article>
                ))}
            </div>

            {editingSlide ? (
              <div className="rounded border border-primary/20 bg-primary-soft/40 p-5">
                <h3 className="font-semibold">Slide düzenle</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <FormField label="Başlık" className="sm:col-span-2">
                    <Input
                      value={editingSlide.title}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, title: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Açıklama" className="sm:col-span-2">
                    <Textarea
                      value={editingSlide.description}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          description: e.target.value,
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Görsel URL">
                    <Input
                      value={editingSlide.imageUrl}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          imageUrl: e.target.value,
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Sıra">
                    <Input
                      type="number"
                      value={editingSlide.sortOrder}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          sortOrder: Number(e.target.value),
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Buton Metni">
                    <Input
                      value={editingSlide.buttonText}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          buttonText: e.target.value,
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Buton Linki">
                    <Input
                      value={editingSlide.buttonLink}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          buttonLink: e.target.value,
                        })
                      }
                    />
                  </FormField>
                  <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={editingSlide.isActive}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          isActive: e.target.checked,
                        })
                      }
                    />
                    Aktif
                  </label>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => {
                      const exists = settings.slides.some(
                        (s) => s.id === editingSlide.id,
                      );
                      const slides = exists
                        ? settings.slides.map((s) =>
                            s.id === editingSlide.id ? editingSlide : s,
                          )
                        : [...settings.slides, editingSlide];
                      const next = {
                        ...settings,
                        slides,
                        heroTitle: editingSlide.title,
                        heroDescription: editingSlide.description,
                        heroImageUrl: editingSlide.imageUrl,
                        ctaText: editingSlide.buttonText,
                        ctaLink: editingSlide.buttonLink,
                      };
                      setSettings(next);
                      setEditingSlide(null);
                      void save(next);
                    }}
                  >
                    Kaydet
                  </Button>
                  <Button variant="outline" onClick={() => setEditingSlide(null)}>
                    İptal
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {tab === "hizmetler" ? (
          <section className="space-y-4">
            <div className="rounded border border-border bg-surface p-5">
              <FormField label="Bölüm başlığı">
                <Input
                  value={settings.servicesSectionTitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      servicesSectionTitle: e.target.value,
                    })
                  }
                />
              </FormField>
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const item: ServiceItem = {
                    id: uid("svc"),
                    title: "Yeni hizmet",
                    description: "",
                    icon: "Clapperboard",
                    sortOrder: settings.services.length + 1,
                    isActive: true,
                  };
                  setSettings({
                    ...settings,
                    services: [...settings.services, item],
                  });
                }}
              >
                <Plus size={14} /> Yeni Hizmet
              </Button>
            </div>
            <div className="space-y-3">
              {[...settings.services]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((service, index) => (
                  <article
                    key={service.id}
                    className="rounded border border-border bg-surface p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField label="Başlık">
                        <Input
                          value={service.title}
                          onChange={(e) => {
                            const services = settings.services.map((s) =>
                              s.id === service.id
                                ? { ...s, title: e.target.value }
                                : s,
                            );
                            setSettings({ ...settings, services });
                          }}
                        />
                      </FormField>
                      <FormField label="İkon">
                        <Select
                          value={service.icon}
                          onChange={(e) => {
                            const services = settings.services.map((s) =>
                              s.id === service.id
                                ? { ...s, icon: e.target.value }
                                : s,
                            );
                            setSettings({ ...settings, services });
                          }}
                        >
                          {[
                            "GraduationCap",
                            "Drama",
                            "Sparkles",
                            "Film",
                            "Briefcase",
                            "Clapperboard",
                          ].map((icon) => (
                            <option key={icon} value={icon}>
                              {icon}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      <FormField label="Açıklama" className="sm:col-span-2">
                        <Textarea
                          value={service.description}
                          onChange={(e) => {
                            const services = settings.services.map((s) =>
                              s.id === service.id
                                ? { ...s, description: e.target.value }
                                : s,
                            );
                            setSettings({ ...settings, services });
                          }}
                        />
                      </FormField>
                      <FormField label="Görsel URL">
                        <Input
                          value={service.imageUrl || ""}
                          onChange={(e) => {
                            const services = settings.services.map((s) =>
                              s.id === service.id
                                ? {
                                    ...s,
                                    imageUrl: e.target.value || undefined,
                                  }
                                : s,
                            );
                            setSettings({ ...settings, services });
                          }}
                        />
                      </FormField>
                      <label className="flex cursor-pointer items-end gap-2 pb-2 text-sm">
                        <input
                          type="checkbox"
                          checked={service.isActive}
                          onChange={(e) => {
                            const services = settings.services.map((s) =>
                              s.id === service.id
                                ? { ...s, isActive: e.target.checked }
                                : s,
                            );
                            setSettings({ ...settings, services });
                          }}
                        />
                        Aktif
                      </label>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveService(index, -1)}
                      >
                        <ChevronUp size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveService(index, 1)}
                      >
                        <ChevronDown size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          setSettings({
                            ...settings,
                            services: settings.services.filter(
                              (s) => s.id !== service.id,
                            ),
                          })
                        }
                      >
                        <Trash2 size={14} /> Sil
                      </Button>
                    </div>
                  </article>
                ))}
            </div>
            <Button onClick={() => save()}>Kaydet</Button>
          </section>
        ) : null}

        {tab === "hakkimizda" ? (
          <section className="space-y-4">
            <div className="rounded border border-border bg-surface p-5">
              <FormField label="Başlık">
                <Input
                  value={settings.aboutTitle}
                  onChange={(e) =>
                    setSettings({ ...settings, aboutTitle: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Vizyon" className="mt-3">
                <Textarea
                  value={settings.aboutVision}
                  onChange={(e) =>
                    setSettings({ ...settings, aboutVision: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Görsel URL" className="mt-3">
                <Input
                  value={settings.aboutImageUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, aboutImageUrl: e.target.value })
                  }
                />
              </FormField>
            </div>

            <div className="rounded border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Ana açıklamalar</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const item: AboutParagraph = {
                      id: uid("ap"),
                      text: "",
                      sortOrder: settings.aboutParagraphs.length + 1,
                    };
                    setSettings({
                      ...settings,
                      aboutParagraphs: [...settings.aboutParagraphs, item],
                    });
                  }}
                >
                  <Plus size={14} /> Ekle
                </Button>
              </div>
              <div className="mt-3 space-y-3">
                {settings.aboutParagraphs.map((p) => (
                  <div key={p.id} className="flex gap-2">
                    <Textarea
                      value={p.text}
                      onChange={(e) => {
                        const aboutParagraphs = settings.aboutParagraphs.map(
                          (x) =>
                            x.id === p.id ? { ...x, text: e.target.value } : x,
                        );
                        setSettings({ ...settings, aboutParagraphs });
                      }}
                    />
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          aboutParagraphs: settings.aboutParagraphs.filter(
                            (x) => x.id !== p.id,
                          ),
                        })
                      }
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Özellikler</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const item: AboutFeature = {
                      id: uid("af"),
                      title: "Yeni özellik",
                      description: "",
                      icon: "Sparkles",
                    };
                    setSettings({
                      ...settings,
                      aboutFeatures: [...settings.aboutFeatures, item],
                    });
                  }}
                >
                  <Plus size={14} /> Ekle
                </Button>
              </div>
              <div className="mt-3 space-y-3">
                {settings.aboutFeatures.map((f) => (
                  <div
                    key={f.id}
                    className="grid gap-2 rounded border border-border p-3 sm:grid-cols-2"
                  >
                    <FormField label="Başlık">
                      <Input
                        value={f.title}
                        onChange={(e) => {
                          const aboutFeatures = settings.aboutFeatures.map(
                            (x) =>
                              x.id === f.id
                                ? { ...x, title: e.target.value }
                                : x,
                          );
                          setSettings({ ...settings, aboutFeatures });
                        }}
                      />
                    </FormField>
                    <FormField label="İkon">
                      <Input
                        value={f.icon}
                        onChange={(e) => {
                          const aboutFeatures = settings.aboutFeatures.map(
                            (x) =>
                              x.id === f.id
                                ? { ...x, icon: e.target.value }
                                : x,
                          );
                          setSettings({ ...settings, aboutFeatures });
                        }}
                      />
                    </FormField>
                    <FormField label="Açıklama" className="sm:col-span-2">
                      <Textarea
                        value={f.description}
                        onChange={(e) => {
                          const aboutFeatures = settings.aboutFeatures.map(
                            (x) =>
                              x.id === f.id
                                ? { ...x, description: e.target.value }
                                : x,
                          );
                          setSettings({ ...settings, aboutFeatures });
                        }}
                      />
                    </FormField>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          aboutFeatures: settings.aboutFeatures.filter(
                            (x) => x.id !== f.id,
                          ),
                        })
                      }
                    >
                      <Trash2 size={14} /> Sil
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={() => save()}>Kaydet</Button>
          </section>
        ) : null}

        {tab === "istatistikler" ? (
          <section className="space-y-3">
            {settings.stats.map((stat, idx) => (
              <div
                key={stat.id}
                className="grid gap-3 rounded border border-border bg-surface p-4 sm:grid-cols-4"
              >
                <FormField label="Başlık">
                  <Input
                    value={stat.label}
                    onChange={(e) => {
                      const stats = [...settings.stats];
                      stats[idx] = { ...stat, label: e.target.value };
                      setSettings({ ...settings, stats });
                    }}
                  />
                </FormField>
                <FormField label="Sayı">
                  <Input
                    type="number"
                    value={stat.value}
                    onChange={(e) => {
                      const stats = [...settings.stats];
                      stats[idx] = { ...stat, value: Number(e.target.value) };
                      setSettings({ ...settings, stats });
                    }}
                  />
                </FormField>
                <FormField label="Suffix">
                  <Input
                    value={stat.suffix}
                    onChange={(e) => {
                      const stats = [...settings.stats];
                      stats[idx] = { ...stat, suffix: e.target.value };
                      setSettings({ ...settings, stats });
                    }}
                  />
                </FormField>
                <label className="flex cursor-pointer items-end gap-2 pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={stat.isActive}
                    onChange={(e) => {
                      const stats = [...settings.stats];
                      stats[idx] = { ...stat, isActive: e.target.checked };
                      setSettings({ ...settings, stats });
                    }}
                  />
                  Aktif
                </label>
              </div>
            ))}
            <Button onClick={() => save()}>Kaydet</Button>
          </section>
        ) : null}

        {tab === "sosyal" ? (
          <section className="rounded border border-border bg-surface p-5 md:p-6">
            <h2 className="title-accent text-base font-semibold">Sosyal Medya</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Boş alanlar sitede gösterilmez.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["instagram", "Instagram"],
                  ["facebook", "Facebook"],
                  ["tiktok", "TikTok"],
                  ["youtube", "YouTube"],
                  ["linkedin", "LinkedIn"],
                ] as const
              ).map(([key, label]) => (
                <FormField key={key} label={label}>
                  <Input
                    value={settings[key] || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        [key]: e.target.value || undefined,
                      })
                    }
                    placeholder="Boş bırakılabilir"
                  />
                </FormField>
              ))}
            </div>
            <div className="mt-5">
              <Button onClick={() => save()}>Kaydet</Button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
