"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type StaffSetupFormState = {
  error?: string;
  success?: boolean;
};

export async function completeStaffSetup(
  prevState: StaffSetupFormState,
  formData: FormData
): Promise<StaffSetupFormState> {
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!password || !fullName || password.length < 6) {
    return { error: "Please enter your name and a password (min 6 characters)." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  // 1. Update Password
  const { error: authError } = await supabase.auth.updateUser({
    password: password,
  });

  if (authError) {
    return { error: authError.message };
  }

  // 2. Update Profile & remove force_password_change flag
  const { error: profileError } = await (supabase.from("profiles") as any)
    .update({ 
      full_name: fullName.trim(),
      force_password_change: false 
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/staff", "layout");
  
  redirect("/staff");
}
