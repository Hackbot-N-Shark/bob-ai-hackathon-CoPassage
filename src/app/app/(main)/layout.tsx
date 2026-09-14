import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Car, Search, MapPin, User, LogOut } from "lucide-react";

export default async function AppMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/app/login");
  }

  // Check if they are actually a user (not an admin on the wrong side)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "user") {
    // Admins and Staff shouldn't use the passenger app with their work accounts
    // They can technically, but it's cleaner to separate them, or we can just allow it.
    // Let's allow it for testing, but typically you'd redirect.
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/app/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-zinc-900 tracking-tight">CoPassage</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/app/find-ride" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Search className="h-4 w-4" /> Find a Ride
            </Link>
            <Link href="/app/offer-ride" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Offer a Ride
            </Link>
            <Link href="/app/my-rides" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">
              My Rides
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/app/profile" className="h-9 w-9 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors">
              <User className="h-5 w-5" />
            </Link>
            
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-zinc-500 hover:text-red-600 transition-colors p-2" title="Sign out">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-zinc-200 flex items-center justify-around z-50">
        <Link href="/app/dashboard" className="flex flex-col items-center gap-1 text-zinc-500 hover:text-indigo-600">
          <Car className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/app/find-ride" className="flex flex-col items-center gap-1 text-zinc-500 hover:text-indigo-600">
          <Search className="h-5 w-5" />
          <span className="text-[10px] font-medium">Find</span>
        </Link>
        <Link href="/app/offer-ride" className="flex flex-col items-center gap-1 text-zinc-500 hover:text-indigo-600">
          <MapPin className="h-5 w-5" />
          <span className="text-[10px] font-medium">Offer</span>
        </Link>
        <Link href="/app/my-rides" className="flex flex-col items-center gap-1 text-zinc-500 hover:text-indigo-600">
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Rides</span>
        </Link>
      </div>
      
      {/* Spacer for mobile bottom nav */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
}
