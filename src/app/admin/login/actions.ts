// "use server";

// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";

// export interface LoginFormState {
//   error?: string;
// }

// /**
//  * Server Action — Admin sign-in.
//  *
//  * Authenticates via Supabase email/password, then verifies the user
//  * holds the `super_admin` role before completing the redirect.
//  *
//  * Possible outcomes:
//  *  - Missing fields       → returns { error: "…" }
//  *  - Bad credentials      → returns { error: "…" }
//  *  - Authenticated but not super_admin → signs out + returns { error: "…" }
//  *  - Success              → redirects to /admin (never returns)
//  */
// export async function adminLogin(
//   _prevState: LoginFormState,
//   formData: FormData
// ): Promise<LoginFormState> {
//   const email = formData.get("email");
//   const password = formData.get("password");

//   // ── Input validation ────────────────────────────────────────────────────
//   if (typeof email !== "string" || !email.trim()) {
//     return { error: "Email is required." };
//   }
//   if (typeof password !== "string" || !password) {
//     return { error: "Password is required." };
//   }

//   const supabase = await createClient();

//   // ── Authenticate ────────────────────────────────────────────────────────
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email: email.trim().toLowerCase(),
//     password,
//   });

//   if (error || !data.user) {
//     // Normalise Supabase error messages to user-facing strings
//     if (
//       error?.message?.toLowerCase().includes("invalid login credentials") ||
//       error?.message?.toLowerCase().includes("invalid email or password") ||
//       error?.status === 400
//     ) {
//       return { error: "Invalid email or password. Please try again." };
//     }

//     if (error?.message?.toLowerCase().includes("email not confirmed")) {
//       return {
//         error: "Your email address has not been confirmed. Check your inbox.",
//       };
//     }

//     return { error: error?.message ?? "Authentication failed. Please try again." };
//   }

//   // ── Role check — must be super_admin ────────────────────────────────────
//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("role")
//     .eq("id", data.user.id)
//     .single();

//   if (!profile || profile.role !== "super_admin") {
//     // Sign the user back out — they authenticated but are not authorised
//     await supabase.auth.signOut();
//     return {
//       error:
//         "Access denied. This panel is restricted to Super Admins only.",
//     };
//   }

//   // ── Success ─────────────────────────────────────────────────────────────
//   // redirect() throws internally, so nothing after this line executes.
//   redirect("/admin");
// }


// ----------------- For Testing Purpose -----------------

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LoginFormState {
  error?: string;
}

/**
 * Server Action — Admin sign-in.
 *
 * Authenticates via Supabase email/password.
 * Note: Role verification (super_admin) is handled securely by src/app/admin/layout.tsx.
 */
export async function adminLogin(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  // ── Input validation ────────────────────────────────────────────────────
  if (typeof email !== "string" || !email.trim()) {
    return { error: "Email is required." };
  }
  if (typeof password !== "string" || !password) {
    return { error: "Password is required." };
  }

  const supabase = await createClient();

  // ── Authenticate ────────────────────────────────────────────────────────
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error || !data.user) {
    // Normalise Supabase error messages to user-facing strings
    if (
      error?.message?.toLowerCase().includes("invalid login credentials") ||
      error?.message?.toLowerCase().includes("invalid email or password") ||
      error?.status === 400
    ) {
      return { error: "Invalid email or password. Please try again." };
    }

    if (error?.message?.toLowerCase().includes("email not confirmed")) {
      return {
        error: "Your email address has not been confirmed. Check your inbox.",
      };
    }

    return { error: error?.message ?? "Authentication failed. Please try again." };
  }

  // ── Success ─────────────────────────────────────────────────────────────
  // redirect() throws internally, so nothing after this line executes.
  redirect("/admin");
}