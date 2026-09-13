"use client";

import { useEffect, useState, useTransition } from "react";
import { adminRepository } from "@/lib/repositories";
import type { AdminRole, AdminUser } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Field";
import { EmptyState, PageHeader } from "@/components/ui/StatusBadge";
import { ROLE_LABELS } from "@/config/constants";
import { formatDateShort } from "@/lib/utils";

export default function AdminsPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("VIEWER");
  const [, startTransition] = useTransition();

  function load() {
    setLoading(true);
    startTransition(async () => {
      setItems(await adminRepository.list());
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function createAdmin() {
    if (!name.trim() || !email.trim()) return;
    await adminRepository.create({
      name: name.trim(),
      email: email.trim(),
      role,
      isActive: true,
    });
    setName("");
    setEmail("");
    setRole("VIEWER");
    load();
  }

  async function toggleActive(admin: AdminUser) {
    await adminRepository.update(admin.id, { isActive: !admin.isActive });
    load();
  }

  async function changeRole(admin: AdminUser, next: AdminRole) {
    await adminRepository.update(admin.id, { role: next });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Adminler"
        description="Mock rol yönetimi — gerçek auth sonra bağlanacak"
      />

      <div className="mb-6 grid gap-3 rounded border border-border bg-surface p-4 sm:grid-cols-4">
        <FormField label="Ad">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="E-posta">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label="Rol">
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
          >
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </FormField>
        <div className="flex items-end">
          <Button onClick={createAdmin}>Ekle</Button>
        </div>
      </div>

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
            <thead className="border-b border-border bg-bg-warm/50 text-xs text-ink-muted">
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
                    <Select
                      value={admin.role}
                      onChange={(e) =>
                        changeRole(admin, e.target.value as AdminRole)
                      }
                      className="max-w-[180px]"
                    >
                      {Object.entries(ROLE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-3 py-3">
                    {admin.isActive ? "Aktif" : "Pasif"}
                  </td>
                  <td className="px-3 py-3">{formatDateShort(admin.createdAt)}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      className="underline"
                      onClick={() => toggleActive(admin)}
                    >
                      {admin.isActive ? "Pasifleştir" : "Aktifleştir"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 rounded border border-border bg-bg-warm/40 p-4 text-sm text-ink-muted">
        <p className="font-medium text-ink">Rol özeti (mock)</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>SUPER_ADMIN: her şey</li>
          <li>EDITOR: site içerikleri ve referanslar</li>
          <li>CASTING_MANAGER: başvurular ve oyuncular</li>
          <li>VIEWER: sadece görüntüleme</li>
        </ul>
      </div>
    </div>
  );
}
