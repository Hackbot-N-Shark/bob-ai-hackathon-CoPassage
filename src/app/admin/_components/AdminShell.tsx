"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Car,
  Map,
  CreditCard,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Access Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Escalations",
    href: "/admin/escalations",
    icon: AlertTriangle,
  },
  {
    label: "Matches",
    href: "/admin/matches",
    icon: Map,
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
];

function Sidebar({
  pathname,
  onSignOut,
}: {
  pathname: string;
  onSignOut: () => void;
}) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-zinc-200">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Car className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 leading-none">
            CoPassage
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wider">
            Super Admin
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-indigo-600" : "text-zinc-400"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out & Profile Settings */}
      <div className="px-3 pb-4 space-y-1">
        <Link
          href="/admin/profile"
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/admin/profile"
              ? "bg-indigo-50 text-indigo-700"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          )}
        >
          <Settings
            className={cn(
              "h-4 w-4 flex-shrink-0",
              pathname === "/admin/profile"
                ? "text-indigo-600"
                : "text-zinc-400"
            )}
          />
          Profile Settings
        </Link>
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 flex-shrink-0 text-zinc-400" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  // If we are on the login page, don't render the shell
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar pathname={pathname} onSignOut={handleSignOut} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 h-full z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar pathname={pathname} onSignOut={handleSignOut} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1 text-zinc-600 hover:bg-zinc-100"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-semibold text-zinc-900">
              CoPassage Admin
            </span>
          </div>
          <div className="w-7" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
