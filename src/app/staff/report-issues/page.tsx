import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Inbox, AlertTriangle, ArrowRight, Clock, MapPin } from "lucide-react";

export default async function ReportIssuesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/staff/login");

  // Fetch current user's profile for city scoping
  const { data: profile } = await supabase
    .from("profiles")
    .select("assigned_city, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "city_staff") redirect("/staff/login");
  
  // Note: RLS automatically handles city scoping for staff_or_admin
  const { data: issues, error } = await supabase
    .from("escalations")
    .select("*, reported_by:profiles!reported_by(full_name, email)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Inbox className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Report Issues Inbox</h1>
            <p className="text-sm text-zinc-500">
              Incoming user reports for <span className="font-semibold text-zinc-700">{profile.assigned_city}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1.5 border border-orange-200 text-orange-700">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">{issues?.length || 0} Open Reports</span>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {error ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
            <p className="text-red-500">Failed to load issues: {error.message}</p>
          </div>
        ) : issues?.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 border-dashed">
            <div className="mx-auto h-12 w-12 rounded-full bg-zinc-50 flex items-center justify-center mb-3">
              <Inbox className="h-6 w-6 text-zinc-300" />
            </div>
            <h3 className="text-sm font-medium text-zinc-900">Inbox Zero</h3>
            <p className="mt-1 text-sm text-zinc-500">No new user reports in {profile.assigned_city}.</p>
          </div>
        ) : (
          issues?.map((issue) => (
            <div key={issue.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:border-orange-200 transition-colors group flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                        {issue.ticket_ref}
                      </span>
                      {issue.priority === "critical" && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase tracking-wider">
                          Critical
                        </span>
                      )}
                      {issue.priority === "high" && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-700 uppercase tracking-wider">
                          High Priority
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">{issue.subject}</h3>
                  </div>
                </div>
                
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {issue.description || "No description provided."}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(issue.created_at).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                      {(issue.reported_by as any)?.full_name?.charAt(0) || "U"}
                    </div>
                    Reported by {(issue.reported_by as any)?.full_name || "Unknown User"}
                  </div>
                </div>
              </div>

              {/* Actions Column */}
              <div className="sm:border-l sm:border-zinc-100 sm:pl-6 flex flex-col justify-center gap-3 min-w-[140px]">
                <form action={async () => {
                  "use server";
                  const sb = await createClient();
                  await sb.from("escalations").update({ status: "in_progress", assigned_to: user.id }).eq("id", issue.id);
                  // Refresh via standard redirect or revalidatePath would be better here, 
                  // but we'll use a Client Component in the future for this.
                  // For now, this inline server action works!
                  const { revalidatePath } = await import("next/cache");
                  revalidatePath("/staff/report-issues");
                }}>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-700 transition-colors">
                    Accept Issue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
