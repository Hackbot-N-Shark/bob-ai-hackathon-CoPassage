"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAdminProfile(fullName: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await (supabase.from("profiles") as any)
    .update({ full_name: fullName.trim() })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/profile");

  return { success: true };
}
