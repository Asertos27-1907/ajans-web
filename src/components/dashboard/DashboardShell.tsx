"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clapperboard,
  FileText,
  LayoutDashboard,
  Mail,
  Menu,
  Settings,
  Shield,
  Users,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { DASHBOARD_NAV } from "@/config/constants";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/public/BrandLogo";

const iconMap = {
  LayoutDashboard,
  FileText,
  Users,
  Clapperboard,
  Mail,
  Settings,
  Shield,
} as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-1 p-3">
      {DASHBOARD_NAV.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard;
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-white"
                : "cursor-pointer text-ink-muted hover:bg-primary-soft hover:text-primary",
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f3f1ec] text-ink">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
          <div className="border-b border-border p-4">
            <div className="rounded bg-white p-1">
              <BrandLogo />
            </div>
            <p className="mt-3 text-xs tracking-wide text-ink-soft uppercase">
              Yönetim Paneli
            </p>
          </div>
          <div className="flex-1">{nav}</div>
          <div className="border-t border-border p-3">
            <Link
              href="/dashboard/login"
              className="flex items-center gap-2 rounded px-3 py-2 text-sm text-ink-muted hover:bg-bg-muted"
            >
              <LogOut size={16} /> Çıkış (mock)
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur lg:px-6">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-border lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Menü"
            >
              <Menu size={18} />
            </button>
            <p className="text-sm font-medium text-ink-muted">
              +Akademi Dashboard
            </p>
            <Link href="/" className="text-sm text-ink-muted hover:text-ink">
              Siteyi gör
            </Link>
          </header>
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Kapat"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute top-0 left-0 flex h-full w-72 flex-col bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <BrandLogo />
              <button type="button" onClick={() => setOpen(false)} aria-label="Kapat">
                <X size={18} />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
