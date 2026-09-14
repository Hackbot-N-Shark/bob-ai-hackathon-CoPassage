"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface StaffLoginFormState {
  error?: string;
}

export async function staffLogin(
  _prevState: StaffLoginFormState,
  formData: FormData
): Promise<StaffLoginFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      if (
        authError?.message?.toLowerCase().includes("invalid login credentials") ||
        authError?.message?.toLowerCase().includes("invalid request")
      ) {
        return { error: "Invalid email or password" };
      }
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Login failed. Please try again." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (!profile || ((profile as any).role !== "city_staff" && (profile as any).role !== "super_admin")) {
      await supabase.auth.signOut();
      return { error: "Access denied. City Staff privileges required." };
    }
  } catch (err: any) {
    return { error: err.message ?? "An unexpected error occurred." };
  }

  // Redirect to staff dashboard on success
  redirect("/staff");
}
