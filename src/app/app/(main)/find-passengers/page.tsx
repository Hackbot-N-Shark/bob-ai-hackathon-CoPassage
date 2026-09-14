"use client";

import { useState, useEffect } from "react";
import { searchBroadcasts } from "./actions";
import { calculateDistance } from "@/lib/location";
import { Search, MapPin, Navigation, Clock, Users, Loader2, Compass } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function FindPassengersPage() {
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("Mumbai");
  const [rawBroadcasts, setRawBroadcasts] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [driverLoc, setDriverLoc] = useState<{lat: number, lng: number} | null>(null);

  // Sort helper — pure, no side-effects
  function sortByDistance(bcasts: any[], loc: {lat: number, lng: number} | null) {
    if (!loc) return bcasts;
    return [...bcasts]
      .map(b => ({
        ...b,
        distance: b.origin_lat && b.origin_lng
          ? calculateDistance(loc.lat, loc.lng, b.origin_lat, b.origin_lng)
          : 9999,
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  // On mount: kick off fetch and geolocation independently
  useEffect(() => {
    fetchBroadcasts("Mumbai");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setDriverLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Geolocation denied or error:", err)
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-sort whenever location arrives after the initial fetch
  useEffect(() => {
    if (driverLoc && rawBroadcasts.length > 0) {
      setBroadcasts(sortByDistance(rawBroadcasts, driverLoc));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverLoc]);

  async function fetchBroadcasts(targetCity: string) {
    setLoading(true);
    const res = await searchBroadcasts(targetCity);
    
    if (res.error) {
      toast.error(res.error);
    } else if (res.broadcasts) {
      setRawBroadcasts(res.broadcasts);
      // Use the current driverLoc value at fetch time; if location arrives
      // later the effect above will re-sort automatically.
      setBroadcasts(sortByDistance(res.broadcasts, driverLoc));
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Find Passengers</h1>
          <p className="text-zinc-500 mt-1">Browse locals who need a ride and offer them a seat.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              fetchBroadcasts(e.target.value);
            }}
            className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>
          <button 
            onClick={() => fetchBroadcasts(city)}
            className="p-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-600 shadow-sm transition-colors"
            title="Refresh"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      {driverLoc && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3 text-emerald-700 text-sm mb-4">
          <Compass className="h-4 w-4 flex-shrink-0" />
          <span>Location active. Passengers are sorted by distance from your current location.</span>
        </div>
      )}

      {loading && broadcasts.length === 0 ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : broadcasts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-zinc-200 border-dashed">
          <Users className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-zinc-900">No active broadcasts</h3>
          <p className="text-zinc-500 mt-1">There are currently no passengers looking for a ride in {city}.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {broadcasts.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 hover:border-indigo-200 transition-colors">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                    {b.passenger?.full_name?.charAt(0) || "P"}
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between w-full">
                      <h3 className="font-bold text-zinc-900">{b.passenger?.full_name}</h3>
                      {b.distance && b.distance < 9999 && (
                        <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {b.distance.toFixed(1)} km away
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(b.departure_time).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {b.seats_needed} Seats</span>
                    </div>
                  </div>
                </div>

                <div className="md:border-l md:border-zinc-100 md:pl-6 flex flex-col justify-center gap-3 min-w-[200px]">
                  <div className="text-sm">
                    <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Route</p>
                    <p className="font-semibold text-zinc-900 line-clamp-1 flex items-center gap-1"><MapPin className="h-3 w-3 text-indigo-500"/> {b.origin}</p>
                    <div className="h-3 border-l-2 border-dashed border-zinc-300 ml-1.5 my-0.5"></div>
                    <p className="font-semibold text-zinc-900 line-clamp-1 flex items-center gap-1"><Navigation className="h-3 w-3 text-indigo-500"/> {b.destination}</p>
                  </div>
                </div>
                
              </div>
              
              <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-end">
                <Link 
                  href="/app/offer-ride"
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Offer a Ride
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
