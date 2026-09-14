import { createClient } from "@/lib/supabase/server";
import {
  TrendingUp,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MetricCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  accent: string;
}

interface Escalation {
  id: string;
  ticket_ref: string;
  city: string;
  subject: string;
  priority: string;
  status: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Data fetching helpers
// ---------------------------------------------------------------------------
async function getStaffMetrics() {
  const supabase = await createClient();

  const [
    { count: openEscalations },
    { count: resolvedEscalations },
    { count: totalMatches },
    { data: activeCitiesData },
  ] = await Promise.all([
    supabase
      .from("escalations")
      .select("*", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]),
    supabase
      .from("escalations")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved"),
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("matches")
      .select("city"),
  ]);

  const uniqueCities = new Set((activeCitiesData as any[])?.map(m => m.city) || []);

  return {
    openEscalations: openEscalations ?? 0,
    resolvedEscalations: resolvedEscalations ?? 0,
    totalMatches: totalMatches ?? 0,
    activeCities: uniqueCities.size,
  };
}

async function getRecentEscalations() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("escalations")
    .select("id, ticket_ref, city, subject, priority, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
    
  return (data as Escalation[]) ?? [];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function MetricCardUI({ card }: { card: MetricCard }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {card.title}
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{card.value}</p>
          <p className="mt-1 text-sm text-zinc-500">{card.description}</p>
        </div>
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${card.accent}`}
        >
          <card.icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {card.trend && (
        <div className="mt-4 flex items-center gap-1">
          <TrendingUp
            className={`h-3 w-3 ${card.trendUp ? "text-emerald-500" : "text-red-400"}`}
          />
          <span
            className={`text-xs font-medium ${card.trendUp ? "text-emerald-600" : "text-red-500"}`}
          >
            {card.trend}
          </span>
        </div>
      )}
    </div>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-zinc-100 text-zinc-600",
};

// ---------------------------------------------------------------------------
// Page — Server Component
// ---------------------------------------------------------------------------
export default async function StaffDashboardPage() {
  const [metrics, recentEscalations] = await Promise.all([
    getStaffMetrics(),
    getRecentEscalations(),
  ]);

  const METRIC_CARDS: MetricCard[] = [
    {
      title: "Total Matches",
      value: metrics.totalMatches,
      description: "Across all active cities",
      icon: Car,
      trend: "Live from database",
      trendUp: true,
      accent: "bg-purple-500",
    },
    {
      title: "Active Cities",
      value: metrics.activeCities,
      description: "Operational corridors live",
      icon: MapPin,
      trend: "Live from database",
      trendUp: true,
      accent: "bg-emerald-500",
    },
    {
      title: "Pending Escalations",
      value: metrics.openEscalations,
      description: "Require staff review",
      icon: AlertTriangle,
      trend:
        metrics.openEscalations > 0
          ? `${metrics.openEscalations} unresolved`
          : "All clear",
      trendUp: metrics.openEscalations === 0,
      accent:
        metrics.openEscalations > 0 ? "bg-red-500" : "bg-emerald-500",
    },
    {
      title: "Resolved Tickets",
      value: metrics.resolvedEscalations,
      description: "Total tickets closed",
      icon: CheckCircle2,
      trend: "Live from database",
      trendUp: true,
      accent: "bg-sky-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          City Operations Center
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Real-time overview of local CoPassage operations
        </p>
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRIC_CARDS.map((card) => (
          <MetricCardUI key={card.title} card={card} />
        ))}
      </div>

      {/* System health banner */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Local systems operational
          </p>
          <p className="text-xs text-emerald-600">
            Matches · Escalations
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-emerald-500">
          <Clock className="h-3.5 w-3.5" />
          Updated just now
        </div>
      </div>

      {/* Recent escalations table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            Recent Escalations
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400">Latest 5 tickets</p>
        </div>
        {recentEscalations.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-zinc-400">
            No escalations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-3">Ticket</th>
                  <th className="px-6 py-3">City</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentEscalations.map((esc) => (
                  <tr
                    key={esc.id}
                    className="transition-colors hover:bg-zinc-50"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-zinc-500">
                      {esc.ticket_ref}
                    </td>
                    <td className="px-6 py-3 font-medium text-zinc-800">
                      {esc.city}
                    </td>
                    <td className="px-6 py-3 text-zinc-600 max-w-xs truncate">
                      {esc.subject}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_COLORS[esc.priority] ?? "bg-zinc-100 text-zinc-600"}`}
                      >
                        {esc.priority}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[esc.status] ?? "bg-zinc-100 text-zinc-600"}`}
                      >
                        {esc.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
