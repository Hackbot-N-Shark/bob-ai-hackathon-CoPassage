import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ListTodo, CheckCircle2, Clock } from "lucide-react";

export default async function TicketQueuePage() {
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
  
  // Ticket Queue = actively worked on by this city
  const { data: issues, error } = await supabase
    .from("escalations")
    .select("*, reported_by:profiles!reported_by(full_name, email), assigned_to:profiles!assigned_to(id, full_name)")
    .eq("status", "in_progress")
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <ListTodo className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Active Ticket Queue</h1>
            <p className="text-sm text-zinc-500">
              Issues currently in progress for <span className="font-semibold text-zinc-700">{profile.assigned_city}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {error ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-red-200">
            <p className="text-red-500">Failed to load tickets: {error.message}</p>
          </div>
        ) : issues?.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-zinc-200 border-dashed">
            <div className="mx-auto h-12 w-12 rounded-full bg-zinc-50 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6 text-zinc-300" />
            </div>
            <h3 className="text-sm font-medium text-zinc-900">All caught up!</h3>
            <p className="mt-1 text-sm text-zinc-500">There are no active tickets right now.</p>
          </div>
        ) : (
          issues?.map((issue) => {
            const isMine = issue.assigned_to?.id === user.id;

            return (
              <div key={issue.id} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                      {issue.ticket_ref}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${isMine ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-600'}`}>
                      {isMine ? "Assigned to You" : `Assigned to ${(issue.assigned_to as any)?.full_name || 'Staff'}`}
                    </span>
                  </div>
                  <h3 className="font-semibold text-zinc-900 line-clamp-1">{issue.subject}</h3>
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                    {issue.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                    <Clock className="h-3.5 w-3.5" />
                    Last updated {new Date(issue.updated_at).toLocaleString()}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-5 pt-4 border-t border-zinc-100 flex gap-2">
                  <form className="flex-1" action={async () => {
                    "use server";
                    const sb = await createClient();
                    await sb.from("escalations").update({ status: "resolved" }).eq("id", issue.id);
                    const { revalidatePath } = await import("next/cache");
                    revalidatePath("/staff/ticket-queue");
                  }}>
                    <button type="submit" className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Resolved
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
