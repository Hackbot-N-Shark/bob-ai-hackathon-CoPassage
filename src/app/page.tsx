import Link from "next/link";
import { Car, ShieldCheck, Map, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-hidden flex flex-col items-center justify-center font-sans">
      
      {/* Background gradients for premium modern look */}
      <div className="absolute top-0 -left-1/4 w-3/4 h-1/2 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-3/4 h-1/2 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-5xl w-full px-6 py-20 mx-auto text-center">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Car className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            CoPassage
          </h1>
        </div>

        {/* Hero Copy */}
        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
          Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Urban Commute.</span>
        </h2>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-16">
          The next-generation carpooling platform. Connect with riders, manage city operations, and oversee the entire network from powerful, purpose-built portals.
        </p>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          
          {/* User Portal */}
          <Link href="/app/login" className="group relative block overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mb-6 group-hover:scale-110 transition-transform text-indigo-400">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Rider & Driver App</h3>
              <p className="text-sm text-zinc-400">Find rides, offer empty seats, and commute together efficiently.</p>
            </div>
          </Link>

          {/* City Staff Portal */}
          <Link href="/staff/login" className="group relative block overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mb-6 group-hover:scale-110 transition-transform text-purple-400">
                <Map className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">City Staff Portal</h3>
              <p className="text-sm text-zinc-400">Manage local escalations, monitor active routes, and oversee operations.</p>
            </div>
          </Link>

          {/* Super Admin Portal */}
          <Link href="/admin/login" className="group relative block overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-zinc-500/20 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mb-6 group-hover:scale-110 transition-transform text-zinc-300">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">System Admin</h3>
              <p className="text-sm text-zinc-400">Global oversight, access management, and financial ledgers.</p>
            </div>
          </Link>

        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 text-center w-full text-zinc-600 text-sm">
        &copy; {new Date().getFullYear()} CoPassage Inc. All rights reserved.
      </div>
    </div>
  );
}
