"use client";

import { useEffect, useState, useTransition } from "react";
import { adminRepository } from "@/lib/repositories";
import type { AdminUser } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";
import { EmptyState, PageHeader } from "@/components/ui/StatusBadge";
import { ROLE_LABELS } from "@/config/constants";
import { formatDateShort } from "@/lib/utils";

export default function AdminsPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [, startTransition] = useTransition();

  function load() {
    setLoading(true);
    startTransition(async () => {
      try {
        setItems(await adminRepository.list());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Liste yüklenemedi.");
      } finally {
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function inviteAdmin() {
    if (!name.trim() || !email.trim()) {
      setError("Ad ve e-posta gerekli.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await adminRepository.invite({
        name: name.trim(),
        email: email.trim(),
      });
      setName("");
      setEmail("");
      setSuccess("Davet gönderildi.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Davet gönderilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(admin: AdminUser) {
    if (admin.role === "owner") {
      setError("Owner hesabı pasifleştirilemez.");
      return;
    }
    setError("");
    try {
      await adminRepository.setActive(admin.id, !admin.isActive);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Güncelleme başarısız.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Adminler"
        description="Yalnızca owner yöneticileri davet edebilir ve yönetebilir"
      />

      <div className="mb-6 grid gap-3 rounded border border-border bg-surface p-4 sm:grid-cols-3">
        <FormField label="Ad Soyad">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="E-posta">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <div className="flex items-end">
          <Button onClick={inviteAdmin} disabled={saving}>
            {saving ? "Gönderiliyor..." : "Yeni Yönetici Davet Et"}
          </Button>
        </div>
      </div>

      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      {success ? <p className="mb-3 text-sm text-success">{success}</p> : null}

      <div className="overflow-x-auto rounded border border-border bg-surface">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded" />
            ))}
          </div>
        ) : !items.length ? (
          <div className="p-4">
            <EmptyState title="Admin yok" />
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-bg-muted/50 text-xs text-ink-muted">
              <tr>
                <th className="px-3 py-3">Ad</th>
                <th className="px-3 py-3">E-posta</th>
                <th className="px-3 py-3">Rol</th>
                <th className="px-3 py-3">Durum</th>
                <th className="px-3 py-3">Oluşturulma</th>
                <th className="px-3 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((admin) => (
                <tr key={admin.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-3 font-medium">{admin.name}</td>
                  <td className="px-3 py-3">{admin.email}</td>
                  <td className="px-3 py-3">
                    {ROLE_LABELS[admin.role] || admin.role}
                  </td>
                  <td className="px-3 py-3">
                    {admin.isActive ? "Aktif" : "Pasif"}
                  </td>
                  <td className="px-3 py-3">{formatDateShort(admin.createdAt)}</td>
                  <td className="px-3 py-3">
                    {admin.role === "owner" ? (
                      <span className="text-ink-soft">—</span>
                    ) : (
                      <button
                        type="button"
                        className="underline"
                        onClick={() => toggleActive(admin)}
                      >
                        {admin.isActive ? "Pasifleştir" : "Aktifleştir"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 rounded border border-border bg-bg-muted/40 p-4 text-sm text-ink-muted">
        <p className="font-medium text-ink">Rol özeti</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>owner: tüm dashboard + admin yönetimi</li>
          <li>admin: normal dashboard erişimi (admin yönetimi yok)</li>
        </ul>
      </div>
    </div>
  );
}
