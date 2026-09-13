"use client";

import { useEffect, useState, useTransition } from "react";
import { contactRepository } from "@/lib/repositories";
import type { ContactMessage } from "@/types";
import { PageHeader, EmptyState } from "@/components/ui/StatusBadge";
import { formatDateTR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function ContactAdminPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  function load() {
    setLoading(true);
    startTransition(async () => {
      const data = await contactRepository.list();
      setItems(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function openMessage(msg: ContactMessage) {
    setSelected(msg);
    if (!msg.isRead) {
      await contactRepository.markRead(msg.id, true);
      load();
    }
  }

  return (
    <div>
      <PageHeader title="İletişim" description="Gelen mesajlar" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded border border-border bg-surface">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-14 rounded" />
              ))}
            </div>
          ) : !items.length ? (
            <div className="p-4">
              <EmptyState title="Mesaj yok" />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((msg) => (
                <li key={msg.id}>
                  <button
                    type="button"
                    onClick={() => openMessage(msg)}
                    className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{msg.name}</p>
                      <p className="text-xs text-ink-muted">{msg.subject}</p>
                    </div>
                    <div className="text-right">
                      {!msg.isRead ? (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          Yeni
                        </span>
                      ) : null}
                      <p className="mt-1 text-[11px] text-ink-soft">
                        {formatDateTR(msg.createdAt)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded border border-border bg-surface p-5">
          {selected ? (
            <div>
              <h2 className="text-lg font-semibold">{selected.subject}</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {selected.name} · {selected.email}
                {selected.phone ? ` · ${selected.phone}` : ""}
              </p>
              <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </p>
              <Button
                className="mt-6"
                variant="outline"
                onClick={() => setSelected(null)}
              >
                Kapat
              </Button>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">Bir mesaj seçin.</p>
          )}
        </div>
      </div>
    </div>
  );
}
