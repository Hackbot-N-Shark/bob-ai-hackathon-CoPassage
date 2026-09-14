import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, ShieldCheck, MapPin } from "lucide-react";

export default async function StaffRosterPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/staff/login");
  }

  // Get current user's profile to know their assigned city
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("assigned_city, role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || currentProfile.role !== "city_staff") {
    redirect("/staff/login");
  }

  const assignedCity = currentProfile.assigned_city;

  // Fetch all staff members in the same city
  // We use the admin/service role client if we want to bypass RLS, 
  // but RLS allows staff_or_admin to select from profiles... wait, RLS on profiles says:
  // "profiles: owner can read own" and "profiles: super_admin full read"
  // Actually, City Staff cannot read other profiles right now! 
  // Let's use an admin client to fetch the roster, or we need to update RLS.
  // We'll use the server client and let's assume we update RLS, OR we can just fetch it securely here.
  // It's safer to fetch securely on the server side using service role for a read-only list.
  
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: roster, error } = await adminClient
    .from("profiles")
    .select("id, full_name, email, created_at, avatar_url")
    .eq("role", "city_staff")
    .eq("assigned_city", assignedCity)
    .order("full_name", { ascending: true });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Staff Roster</h1>
            <p className="text-sm text-zinc-500">
              City Staff directory for <span className="font-semibold text-zinc-700">{assignedCity || "Unassigned"}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-1.5 border border-zinc-200">
          <MapPin className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-700">{assignedCity || "Unassigned"}</span>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {error ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-red-200">
            <p className="text-red-500">Failed to load roster: {error.message}</p>
          </div>
        ) : roster?.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-zinc-200 border-dashed">
            <Users className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500">No other staff members found in this city.</p>
          </div>
        ) : (
          roster?.map((staff) => (
            <div key={staff.id} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <ShieldCheck className="h-5 w-5 text-purple-300 group-hover:text-purple-500 transition-colors" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg flex-shrink-0">
                  {staff.full_name ? staff.full_name.charAt(0).toUpperCase() : staff.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 truncate pr-6">
                    {staff.full_name || "Unnamed Staff"}
                  </h3>
                  <p className="text-sm text-zinc-500 truncate" title={staff.email}>
                    {staff.email}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
                <span>Joined {new Date(staff.created_at).toLocaleDateString()}</span>
                {staff.id === user.id && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    You
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
