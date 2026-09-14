"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Navigation } from "lucide-react";
import { toast } from "sonner";

// Dynamically import LiveMap with SSR disabled since Leaflet requires window
const LiveMap = dynamic(() => import("@/components/LiveMap"), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-zinc-100 rounded-xl"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
});

export default function DriveTrackingPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!matchId) return;

    // Create a realtime channel for this specific ride match
    const channel = supabase.channel(`live-location-${matchId}`);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        toast.success("Live tracking active! Sharing your location with the passenger.");
      }
    });

    let watchId: number;

    if ("geolocation" in navigator) {
      // Continuously watch driver's position
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng });

          // Broadcast to passenger
          channel.send({
            type: "broadcast",
            event: "location",
            payload: { lat, lng }
          });
        },
        (err) => {
          console.error("Location error:", err);
          toast.error("Please enable location services to share your live location.");
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      supabase.removeChannel(channel);
    };
  }, [matchId, supabase]);

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-indigo-600" /> Drive in Progress
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Your location is being shared securely with your passenger.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-emerald-700">Live</span>
        </div>
      </div>

      <div className="flex-1 bg-white p-2 rounded-2xl shadow-sm border border-zinc-200 relative overflow-hidden">
        {location ? (
          <LiveMap driverLat={location.lat} driverLng={location.lng} passengerName="You" />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-50 rounded-xl border border-zinc-100">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
            <p className="text-zinc-500 font-medium">Acquiring GPS Signal...</p>
          </div>
        )}
      </div>
    </div>
  );
}
