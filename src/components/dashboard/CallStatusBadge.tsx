"use client";

import { cn } from "@/lib/utils";
import { CALL_STATUS_LABELS } from "@/config/constants";
import type { CallStatus } from "@/types";

const colors: Record<CallStatus, string> = {
  not_called: "bg-[#f5f5f4] text-[#57534e]",
  unreachable: "bg-[#fff7ed] text-[#9a3412]",
  call_again: "bg-[#fffbeb] text-[#92400e]",
  interested: "bg-[#ecfeff] text-[#0e7490]",
  meeting_done: "bg-[#eef2ff] text-[#3730a3]",
  face_to_face_planned: "bg-[#f5f3ff] text-[#5b21b6]",
  positive: "bg-[#ecfdf3] text-[#027a48]",
  negative: "bg-[#fef3f2] text-[#b42318]",
  archived: "bg-[#f5f5f4] text-[#78716c]",
};

export function CallStatusBadge({ status }: { status: CallStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        colors[status],
      )}
    >
      {CALL_STATUS_LABELS[status] || status}
    </span>
  );
}
