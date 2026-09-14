"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  LogOut,
  Menu,
  Map,
  Settings,
  AlertOctagon,
  Users,
  Inbox,
  History
} from "lucide-react";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/staff",
    icon: LayoutDashboard,
  },
  {
    label: "Reported Issues",
    href: "/staff/report-issues",
    icon: Inbox,
  },
  {
    label: "SOS Alerts",
    href: "/staff/sos-alerts",
    icon: AlertOctagon,
  },
  {
    label: "Ticket Queue",
    href: "/staff/ticket-queue",
    icon: AlertTriangle,
  },
  {
    label: "Case History",
    href: "/staff/case-history",
    icon: History,
  },
  {
    label: "Staff Roster",
    href: "/staff/staff-roster",
    icon: Users,
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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
          <Map className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 leading-none">
            CoPassage
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wider">
            City Staff
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/staff"
              ? pathname === "/staff"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-purple-50 text-purple-700"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-purple-600" : "text-zinc-400"
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
          href="/staff/profile"
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/staff/profile"
              ? "bg-purple-50 text-purple-700"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          )}
        >
          <Settings
            className={cn(
              "h-4 w-4 flex-shrink-0",
              pathname === "/staff/profile"
                ? "text-purple-600"
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

export default function StaffShell({
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
    window.location.href = "/staff/login";
  }

  // If we are on the login page, don't render the shell
  if (pathname === "/staff/login" || pathname.startsWith("/staff/login/")) {
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
            <Map className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-zinc-900">
              CoPassage Staff
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
