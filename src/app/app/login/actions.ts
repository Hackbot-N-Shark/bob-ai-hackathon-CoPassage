"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface UserLoginFormState {
  error?: string;
}

export async function userLogin(
  _prevState: UserLoginFormState,
  formData: FormData
): Promise<UserLoginFormState> {
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
    
    // No specific role check needed for standard users - any valid account can access the rider/driver app.

  } catch (err: any) {
    return { error: err.message ?? "An unexpected error occurred." };
  }

  // Redirect to user dashboard on success
  redirect("/app/dashboard");
}
