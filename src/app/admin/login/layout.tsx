/**
 * Admin Login Layout — Server Component.
 *
 * This layout is intentionally minimal and performs NO auth checks.
 * It sits at /admin/login and must be reachable by unauthenticated users.
 *
 * Next.js App Router resolves the most-specific layout: because this file
 * exists at app/admin/login/layout.tsx, it takes precedence over
 * app/admin/layout.tsx for all routes under /admin/login/*.
 * The auth-guarded AdminLayout is therefore NOT applied to the login page.
 */
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
