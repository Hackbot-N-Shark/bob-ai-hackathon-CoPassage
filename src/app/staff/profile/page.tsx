import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { Settings } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/staff/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Profile Settings</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <ProfileForm 
          initialName={(profile as any)?.full_name ?? ""} 
          email={(profile as any)?.email ?? user.email ?? ""} 
          role={(profile as any)?.role ?? "user"}
        />
      </div>
    </div>
  );
}
