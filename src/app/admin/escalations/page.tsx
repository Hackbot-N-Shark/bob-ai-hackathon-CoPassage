import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EscalationsList } from "@/components/dashboard/EscalationsList";
import { AlertTriangle } from "lucide-react";
import type {
  EscalationStatus,
  EscalationPriority,
} from "@/types/supabase";

const VALID_STATUSES: EscalationStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];
const VALID_PRIORITIES: EscalationPriority[] = [
  "low",
  "medium",
  "high",
  "critical",
];

export default async function EscalationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedSearchParams.status ? "1" : resolvedSearchParams.page || "1", 10));
  const filterStatus = resolvedSearchParams.status || "all";
  const ITEMS_PER_PAGE = 10;
  
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // Global counts for metrics
  const [
    { count: openCountRes },
    { count: criticalCountRes },
    { count: resolvedCountRes },
    { count: totalCountRes },
  ] = await Promise.all([
    supabase
      .from("escalations")
      .select("*", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]),
    supabase
      .from("escalations")
      .select("*", { count: "exact", head: true })
      .eq("priority", "critical")
      .in("status", ["open", "in_progress"]),
    supabase
      .from("escalations")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved"),
    supabase
      .from("escalations")
      .select("*", { count: "exact", head: true }),
  ]);

  let query = supabase
    .from("escalations")
    .select(
      "id, ticket_ref, city, subject, description, priority, status, resolution_note, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (filterStatus !== "all" && VALID_STATUSES.includes(filterStatus as EscalationStatus)) {
    query = query.eq("status", filterStatus as EscalationStatus);
  }

  const { data, error, count } = await query.range(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE - 1
  );

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
        Failed to load escalations: {error.message}
      </div>
    );
  }

  const escalations = (data ?? []).map((e) => ({
    ...e,
    status: VALID_STATUSES.includes(e.status as EscalationStatus)
      ? (e.status as EscalationStatus)
      : "open",
    priority: VALID_PRIORITIES.includes(e.priority as EscalationPriority)
      ? (e.priority as EscalationPriority)
      : "medium",
  }));

  const openCount = openCountRes ?? 0;
  const criticalCount = criticalCountRes ?? 0;
  const resolvedCount = resolvedCountRes ?? 0;
  const totalCount = totalCountRes ?? 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Escalation Inbox
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            High-priority tickets escalated from regional staff
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500">
          <AlertTriangle className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total",
            value: totalCount,
            color: "text-zinc-800",
          },
          {
            label: "Open / In Progress",
            value: openCount,
            color: openCount > 0 ? "text-red-600" : "text-emerald-600",
          },
          {
            label: "Critical",
            value: criticalCount,
            color: criticalCount > 0 ? "text-red-600" : "text-emerald-600",
          },
          {
            label: "Resolved",
            value: resolvedCount,
            color: "text-emerald-600",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              {label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Critical alert banner */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <p className="text-sm font-medium text-red-700">
            {criticalCount} critical escalation
            {criticalCount > 1 ? "s" : ""} require immediate attention.
          </p>
        </div>
      )}

      {/* Escalations list */}
      <EscalationsList 
        escalations={escalations} 
        totalCount={count ?? 0}
        currentPage={page}
        itemsPerPage={ITEMS_PER_PAGE}
        initialStatus={filterStatus as EscalationStatus | "all"}
      />
    </div>
  );
}
