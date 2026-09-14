import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "./_components/UsersTable";
import { Users } from "lucide-react";
import type { UserRole } from "@/types/supabase";

/**
 * Access Management Page — Server Component.
 * Fetches all profiles and renders the interactive UsersTable client component.
 */
export default async function AccessManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));
  const search = resolvedSearchParams.search || "";
  const ITEMS_PER_PAGE = 10;
  
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, role, assigned_city, created_at", { count: "exact" })
    .in("role", ["city_staff", "super_admin"])
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: profiles, error, count } = await query.range(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE - 1
  );

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
        Failed to load users: {error.message}
      </div>
    );
  }

  const safeProfiles = (profiles ?? []).map((p) => ({
    ...p,
    role: (["user", "city_staff", "super_admin"].includes(p.role)
      ? p.role
      : "user") as UserRole,
  }));

  const roleSummary = safeProfiles.reduce(
    (acc, p) => {
      acc[p.role] = (acc[p.role] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Access Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Provision and revoke roles for City Staff and agents
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
          <Users className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Role summary strip */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "City Staff",
            count: roleSummary["city_staff"] ?? 0,
            color: "bg-indigo-100 text-indigo-700",
          },
          {
            label: "Super Admins",
            count: roleSummary["super_admin"] ?? 0,
            color: "bg-purple-100 text-purple-700",
          },
        ].map(({ label, count, color }) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              {label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${color} rounded-md px-2 py-0.5 w-fit`}>
              {count}
            </p>
          </div>
        ))}
      </div>

      {/* Data table */}
      <UsersTable 
        profiles={safeProfiles} 
        currentAdminId={user.id} 
        totalCount={count ?? 0}
        currentPage={page}
        itemsPerPage={ITEMS_PER_PAGE}
        initialSearch={search}
      />
    </div>
  );
}
