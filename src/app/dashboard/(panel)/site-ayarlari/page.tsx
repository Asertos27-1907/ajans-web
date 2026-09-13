"use client";

import { useEffect, useState, useTransition } from "react";
import { settingsRepository } from "@/lib/repositories";
import type { SiteSettings } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/StatusBadge";

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setSettings(await settingsRepository.get());
    });
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    const next = await settingsRepository.update(settings);
    setSettings(next);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!settings) return <div className="skeleton h-64 rounded" />;

  return (
    <div>
      <PageHeader
        title="Site Ayarları"
        description="CMS içerikleri (mock repository)"
        actions={
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Kaydediliyor..." : saved ? "Kaydedildi" : "Kaydet"}
          </Button>
        }
      />

      <div className="space-y-6">
        <section className="rounded border border-border bg-surface p-5">
          <h2 className="font-semibold">Genel</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FormField label="Ajans adı">
              <Input
                value={settings.agencyName}
                onChange={(e) =>
                  setSettings({ ...settings, agencyName: e.target.value })
                }
              />
            </FormField>
            <FormField label="Tam ad">
              <Input
                value={settings.fullName}
                onChange={(e) =>
                  setSettings({ ...settings, fullName: e.target.value })
                }
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
            <FormField label="E-mail">
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
            <FormField label="Adres (satır satır)" className="sm:col-span-2">
              <Textarea
                value={settings.addressLines.join("\n")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    addressLines: e.target.value.split("\n").filter(Boolean),
                  })
                }
              />
            </FormField>
            <FormField label="Google Maps URL">
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
            <FormField label="Instagram">
              <Input
                value={settings.instagram || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    instagram: e.target.value || undefined,
                  })
                }
              />
            </FormField>
            <FormField label="Facebook">
              <Input
                value={settings.facebook || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    facebook: e.target.value || undefined,
                  })
                }
              />
            </FormField>
            <FormField label="YouTube">
              <Input
                value={settings.youtube || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    youtube: e.target.value || undefined,
                  })
                }
                placeholder="Boş bırakılabilir"
              />
            </FormField>
            <FormField label="TikTok">
              <Input
                value={settings.tiktok || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tiktok: e.target.value || undefined,
                  })
                }
                placeholder="Boş bırakılabilir"
              />
            </FormField>
            <FormField label="LinkedIn">
              <Input
                value={settings.linkedin || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    linkedin: e.target.value || undefined,
                  })
                }
                placeholder="Boş bırakılabilir"
              />
            </FormField>
          </div>
        </section>

        <section className="rounded border border-border bg-surface p-5">
          <h2 className="font-semibold">Ana sayfa / Hero</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FormField label="Hero başlık" className="sm:col-span-2">
              <Input
                value={settings.heroTitle}
                onChange={(e) =>
                  setSettings({ ...settings, heroTitle: e.target.value })
                }
              />
            </FormField>
            <FormField label="Hero açıklama" className="sm:col-span-2">
              <Textarea
                value={settings.heroDescription}
                onChange={(e) =>
                  setSettings({ ...settings, heroDescription: e.target.value })
                }
              />
            </FormField>
            <FormField label="Hero görsel">
              <Input
                value={settings.heroImageUrl}
                onChange={(e) =>
                  setSettings({ ...settings, heroImageUrl: e.target.value })
                }
              />
            </FormField>
            <FormField label="CTA metni">
              <Input
                value={settings.ctaText}
                onChange={(e) =>
                  setSettings({ ...settings, ctaText: e.target.value })
                }
              />
            </FormField>
            <FormField label="CTA link">
              <Input
                value={settings.ctaLink}
                onChange={(e) =>
                  setSettings({ ...settings, ctaLink: e.target.value })
                }
              />
            </FormField>
          </div>
        </section>

        <section className="rounded border border-border bg-surface p-5">
          <h2 className="font-semibold">Hakkımızda</h2>
          <div className="mt-4 space-y-3">
            <FormField label="Başlık">
              <Input
                value={settings.aboutTitle}
                onChange={(e) =>
                  setSettings({ ...settings, aboutTitle: e.target.value })
                }
              />
            </FormField>
            <FormField label="İçerik">
              <Textarea
                value={settings.aboutContent}
                onChange={(e) =>
                  setSettings({ ...settings, aboutContent: e.target.value })
                }
              />
            </FormField>
            <FormField label="Görsel">
              <Input
                value={settings.aboutImageUrl}
                onChange={(e) =>
                  setSettings({ ...settings, aboutImageUrl: e.target.value })
                }
              />
            </FormField>
          </div>
        </section>

        <section className="rounded border border-border bg-surface p-5">
          <h2 className="font-semibold">İstatistikler</h2>
          <div className="mt-4 space-y-3">
            {settings.stats.map((stat, idx) => (
              <div key={stat.id} className="grid gap-2 rounded border border-border p-3 sm:grid-cols-5">
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
                <label className="flex items-end gap-2 pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={stat.visible}
                    onChange={(e) => {
                      const stats = [...settings.stats];
                      stats[idx] = { ...stat, visible: e.target.checked };
                      setSettings({ ...settings, stats });
                    }}
                  />
                  Göster
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded border border-border bg-surface p-5">
          <h2 className="font-semibold">Hizmetler</h2>
          <div className="mt-4 space-y-3">
            {settings.services.map((service, idx) => (
              <div key={service.id} className="grid gap-2 rounded border border-border p-3 sm:grid-cols-2">
                <FormField label="Başlık">
                  <Input
                    value={service.title}
                    onChange={(e) => {
                      const services = [...settings.services];
                      services[idx] = { ...service, title: e.target.value };
                      setSettings({ ...settings, services });
                    }}
                  />
                </FormField>
                <FormField label="Sıra">
                  <Input
                    type="number"
                    value={service.sortOrder}
                    onChange={(e) => {
                      const services = [...settings.services];
                      services[idx] = {
                        ...service,
                        sortOrder: Number(e.target.value),
                      };
                      setSettings({ ...settings, services });
                    }}
                  />
                </FormField>
                <FormField label="Açıklama" className="sm:col-span-2">
                  <Textarea
                    value={service.description}
                    onChange={(e) => {
                      const services = [...settings.services];
                      services[idx] = {
                        ...service,
                        description: e.target.value,
                      };
                      setSettings({ ...settings, services });
                    }}
                  />
                </FormField>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded border border-border bg-surface p-5">
          <h2 className="font-semibold">Footer</h2>
          <FormField label="Footer metni" className="mt-4">
            <Textarea
              value={settings.footerText}
              onChange={(e) =>
                setSettings({ ...settings, footerText: e.target.value })
              }
            />
          </FormField>
        </section>
      </div>
    </div>
  );
}
