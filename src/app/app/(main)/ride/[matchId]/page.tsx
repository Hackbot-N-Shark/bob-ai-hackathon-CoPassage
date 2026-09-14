"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-zinc-100 rounded-xl"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
});

export default function RideTrackingPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const [driverLoc, setDriverLoc] = useState<{lat: number, lng: number} | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!matchId) return;

    // Listen to the specific match channel
    const channel = supabase.channel(`live-location-${matchId}`);
    
    channel.on(
      'broadcast',
      { event: 'location' },
      (payload) => {
        if (payload.payload && payload.payload.lat && payload.payload.lng) {
          setDriverLoc({ lat: payload.payload.lat, lng: payload.payload.lng });
        }
      }
    ).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        toast.success("Connected to driver's live location.");
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, supabase]);

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-600" /> Driver's Live Location
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Watch your driver approach in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          {driverLoc ? (
            <>
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-emerald-700">Live</span>
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              <span className="text-sm font-medium text-zinc-500">Waiting for driver...</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white p-2 rounded-2xl shadow-sm border border-zinc-200 relative overflow-hidden">
        {driverLoc ? (
          <LiveMap driverLat={driverLoc.lat} driverLng={driverLoc.lng} passengerName="Driver" />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="bg-white p-6 rounded-full shadow-sm mb-4 border border-zinc-100">
              <MapPin className="h-8 w-8 text-zinc-300" />
            </div>
            <p className="text-zinc-500 font-medium text-center max-w-sm px-6">
              The map will appear as soon as the driver starts sharing their location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
