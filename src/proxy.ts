import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware — refreshes the Supabase session cookie on every request and
 * enforces route-level access control for /admin, /staff, and /app routes.
 *
 * Named export `proxy` is referenced by Next.js via the matcher config below.
 */
export default async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── /admin/* — requires authenticated session ─────────────────────────────
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (request.nextUrl.pathname === "/admin/login") return supabaseResponse;

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── /staff/* — requires city_staff or super_admin role ───────────────────
  if (request.nextUrl.pathname.startsWith("/staff")) {
    if (request.nextUrl.pathname === "/staff/login") return supabaseResponse;

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/staff/login";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, force_password_change")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "city_staff" && profile.role !== "super_admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    if (profile.force_password_change && request.nextUrl.pathname !== "/staff/setup") {
      const url = request.nextUrl.clone();
      url.pathname = "/staff/setup";
      return NextResponse.redirect(url);
    }
  }

  // ── /app/* — requires authenticated session ───────────────────────────────
  if (request.nextUrl.pathname.startsWith("/app")) {
    if (
      request.nextUrl.pathname === "/app/login" ||
      request.nextUrl.pathname === "/app/register"
    ) {
      return supabaseResponse;
    }

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/app/login";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
