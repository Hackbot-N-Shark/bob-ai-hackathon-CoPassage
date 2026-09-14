import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "./_components/AdminShell";
import { Toaster } from "sonner";

/**
 * Admin Root Layout — Server Component.
 *
 * Performs a server-side role check as a second layer of defence
 * (the middleware already guards /admin; this catches edge cases like
 * direct server component access without a middleware hit).
 *
 * The login page (/admin/login) bypasses the auth check via the x-pathname
 * request header injected by the middleware on every request. This prevents
 * the redirect loop: unauthenticated user → /admin/login → AdminLayout →
 * redirect /admin/login → loop.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the pathname the middleware stamped onto the request headers.
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Login page must be reachable without authentication.
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return <>{children}</>;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // const { data: profile } = await supabase
  //   .from("profiles")
  //   .select("role, full_name, email")
  //   .eq("id", user.id)
  //   .single();

  // if (!profile || profile.role !== "super_admin") {
  //   redirect("/unauthorized");
  // }

  // const { data } = await supabase
  //   .from("profiles")
  //   .select("role, full_name, email")
  //   .eq("id", user.id)
  //   .single();

  // // Explicitly cast the return data to clear the 'never' error
  // const profile = data as { role: string; full_name?: string; email?: string } | null;

  // For Testing
  const { data, error } = await supabase
    .from("profiles")
    .select("role, full_name")    // Removed 'email' from here
    .eq("id", user.id)
    .single();

  console.log("LAYOUT DEBUG - User ID:", user.id);
  console.log("LAYOUT DEBUG - Profile Data:", data);
  console.log("LAYOUT DEBUG - Database Error:", error);

  const profile = data as { role: string; full_name?: string } | null;

  // In development, bypass the redirect if the profile is missing or not super_admin 
  // so that the UI can be tested without database sync issues.
  if (process.env.NODE_ENV !== "development") {
    if (!profile || profile.role !== "super_admin") {
      redirect("/unauthorized");
    }
  }

  return (
    <>
      <AdminShell>{children}</AdminShell>
      <Toaster richColors position="top-right" />
    </>
  );
}


// ------------------------------------------ FOR Testing ------------------------------------------//

// import AdminShell from "./_components/AdminShell";

// /**
//  * Admin Root Layout — Server Component.
//  *
//  * AUTH BYPASS: Supabase checks are temporarily commented out
//  * to allow local UI development without an active session.
//  */
// export default async function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   // const supabase = await createClient();

//   // const {
//   //   data: { user },
//   // } = await supabase.auth.getUser();

//   // if (!user) {
//   //   redirect("/login");
//   // }

//   // const { data: profile } = await supabase
//   //   .from("profiles")
//   //   .select("role, full_name, email")
//   //   .eq("id", user.id)
//   //   .single();

//   // if (!profile || profile.role !== "super_admin") {
//   //   redirect("/unauthorized");
//   // }

//   return <AdminShell>{children}</AdminShell>;
// }
