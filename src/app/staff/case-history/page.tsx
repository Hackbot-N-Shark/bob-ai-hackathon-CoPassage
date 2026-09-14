import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Archive, Search, FileText } from "lucide-react";

export default async function CaseHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/staff/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("assigned_city, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "city_staff") redirect("/staff/login");
  
  // Case history = resolved or closed issues
  const { data: issues, error } = await supabase
    .from("escalations")
    .select("*, reported_by:profiles!reported_by(full_name), assigned_to:profiles!assigned_to(full_name)")
    .in("status", ["resolved", "closed"])
    .order("updated_at", { ascending: false })
    .limit(50); // limit for now

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
            <Archive className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Case History</h1>
            <p className="text-sm text-zinc-500">
              Resolved and closed tickets for <span className="font-semibold text-zinc-700">{profile.assigned_city}</span>
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type="search" 
            placeholder="Search tickets..." 
            className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent w-full sm:w-64"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500">Failed to load history: {error.message}</div>
        ) : issues?.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500">No resolved cases found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Ref</th>
                  <th className="px-6 py-4 font-medium">Subject</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Resolved By</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {issues?.map((issue) => (
                  <tr key={issue.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-zinc-600 bg-zinc-100 px-2 py-1 rounded">{issue.ticket_ref}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 line-clamp-1">{issue.subject}</p>
                      <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{issue.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        issue.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-600">
                      {(issue.assigned_to as any)?.full_name || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                      {new Date(issue.updated_at).toLocaleDateString()}
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
