import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PaymentsList } from "./_components/PaymentsList";

export default async function PaymentsPage({
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
    .from("payments")
    .select("id, transaction_ref, amount, currency, status, created_at, match_id(match_ref)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter as import("@/types/supabase").PaymentStatus);
  }

  if (search) {
    query = query.or(`transaction_ref.ilike.%${search}%`);
  }

  const { data: payments, error, count } = await query.range(
    (page - 1) * itemsPerPage,
    page * itemsPerPage - 1
  );

  if (error) {
    throw new Error(`Failed to load payments: ${error.message}`);
  }

  // Global counts for metrics
  const [
    { count: totalCount },
    { count: successCount },
    { count: pendingCount },
  ] = await Promise.all([
    supabase.from("payments").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "success"),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Payments Ledger</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Monitor transactions and payment statuses
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Total Transactions
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{totalCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Successful Payments
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{successCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Pending / Processing
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{pendingCount ?? 0}</p>
        </div>
      </div>

      <PaymentsList
        payments={(payments || []).map((p: any) => ({
          ...p,
          match_ref: p.match_id?.match_ref ?? "Unknown",
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
