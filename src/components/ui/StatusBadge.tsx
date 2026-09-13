import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/config/constants";
import type { ApplicationStatus } from "@/types";

const colors: Record<ApplicationStatus, string> = {
  yeni: "bg-[#eef2ff] text-[#3730a3]",
  inceleniyor: "bg-[#fff7ed] text-[#9a3412]",
  gorusme: "bg-[#ecfeff] text-[#0e7490]",
  kabul: "bg-[#ecfdf3] text-[#027a48]",
  red: "bg-[#fef3f2] text-[#b42318]",
  arsiv: "bg-[#f5f5f4] text-[#57534e]",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        colors[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-dashed border-border-strong bg-bg-warm/50 px-6 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-ink-muted">{description}</p>
      ) : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
