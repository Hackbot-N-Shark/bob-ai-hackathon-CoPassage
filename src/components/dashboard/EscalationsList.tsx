"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { EscalationStatus, EscalationPriority } from "@/types/supabase";
import { updateEscalationStatus } from "@/actions/dashboard";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Escalation {
  id: string;
  ticket_ref: string;
  city: string;
  subject: string;
  description: string | null;
  priority: EscalationPriority;
  status: EscalationStatus;
  resolution_note: string | null;
  created_at: string;
}

const PRIORITY_COLORS: Record<EscalationPriority, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_COLORS: Record<EscalationStatus, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-zinc-100 text-zinc-600",
};

const STATUS_OPTIONS: { value: EscalationStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function EscalationRow({ esc }: { esc: Escalation }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EscalationStatus>(
    esc.status
  );
  const [isPending, startTransition] = useTransition();
  function handleStatusUpdate() {
    if (selectedStatus === esc.status) return;
    startTransition(async () => {
      const result = await updateEscalationStatus(esc.id, selectedStatus);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
      }
    });
  }

  return (
    <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden">
      {/* Summary row */}
      <button
        className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-zinc-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-shrink-0 mt-0.5">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${PRIORITY_COLORS[esc.priority]}`}
          >
            {esc.priority}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-zinc-400">
              {esc.ticket_ref}
            </span>
            <span className="text-zinc-300">·</span>
            <span className="text-sm font-semibold text-zinc-800">
              {esc.subject}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {esc.city} ·{" "}
            {new Date(esc.created_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`flex-shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[esc.status]}`}
        >
          {esc.status.replace("_", " ")}
        </span>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform mt-0.5 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-4 space-y-4">
          {esc.description && (
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-1">
                Description
              </p>
              <p className="text-sm text-zinc-700 leading-relaxed">
                {esc.description}
              </p>
            </div>
          )}

          {esc.resolution_note && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-medium text-emerald-600 mb-1">
                Resolution Note
              </p>
              <p className="text-sm text-emerald-800">{esc.resolution_note}</p>
            </div>
          )}

          {/* Status update control */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs font-medium text-zinc-500">
              Update Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as EscalationStatus)
              }
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-800 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={isPending || selectedStatus === esc.status}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function EscalationsList({
  escalations,
  totalCount,
  currentPage,
  itemsPerPage,
  initialStatus,
}: {
  escalations: Escalation[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  initialStatus: EscalationStatus | "all";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<EscalationStatus | "all">(initialStatus);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  function handleFilterChange(status: EscalationStatus | "all") {
    setFilter(status);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (status !== "all") {
        params.set("status", status);
      } else {
        params.delete("status");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "open", "in_progress", "resolved", "closed"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => handleFilterChange(tab)}
              disabled={isPending}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              } disabled:opacity-50`}
            >
              {tab.replace("_", " ")}
            </button>
          )
        )}
      </div>

      {/* Escalation cards */}
      {escalations.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-400">
          No escalations in this category.
        </div>
      ) : (
        <div className={`space-y-3 ${isPending ? "opacity-50" : ""}`}>
          {escalations.map((esc) => (
            <EscalationRow key={esc.id} esc={esc} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="text-sm text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
