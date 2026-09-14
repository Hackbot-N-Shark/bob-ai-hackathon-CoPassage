"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type UserRegisterFormState = {
  error?: string;
  success?: boolean;
};

export async function userRegister(
  prevState: UserRegisterFormState,
  formData: FormData
): Promise<UserRegisterFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password || !fullName) {
    return { error: "Please enter your name, email, and password." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect to login after successful signup
  redirect("/app/login");
}
