import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MatchesList } from "@/components/dashboard/MatchesList";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // Await search params
  const params = await searchParams;

  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const statusFilter =
    typeof params.status === "string" ? params.status : "all";
  const search = typeof params.search === "string" ? params.search : "";
  const itemsPerPage = 10;

  let query = supabase
    .from("matches")
    .select("id, match_ref, city, status, created_at, driver_id(full_name), rider_id(full_name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter as import("@/types/supabase").MatchStatus);
  }

  if (search) {
    query = query.or(`match_ref.ilike.%${search}%,city.ilike.%${search}%`);
  }

  const { data: matches, error, count } = await query.range(
    (page - 1) * itemsPerPage,
    page * itemsPerPage - 1
  );

  if (error) {
    throw new Error(`Failed to load matches: ${error.message}`);
  }

  // Global counts for metrics
  const [
    { count: totalCount },
    { count: activeCount },
    { count: pendingCount },
  ] = await Promise.all([
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Matches</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Monitor and manage carpool matches across cities
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Total Matches
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{totalCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Active Matches
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{activeCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Pending Matches
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{pendingCount ?? 0}</p>
        </div>
      </div>

      <MatchesList
        matches={(matches || []).map((m: any) => ({
          ...m,
          driver_name: m.driver_id?.full_name ?? "Unknown",
          rider_name: m.rider_id?.full_name ?? "Unknown",
        }))}
        totalCount={count ?? 0}
        currentPage={page}
        itemsPerPage={itemsPerPage}
        initialStatus={statusFilter as any}
        initialSearch={search}
      />
    </div>
  );
}
