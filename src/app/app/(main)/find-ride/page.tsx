"use client";

import { useState } from "react";
import { searchRides, requestRide } from "./actions";
import { Search, MapPin, Navigation, Car, Users, IndianRupee, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function FindRidePage() {
  const [loading, setLoading] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [rides, setRides] = useState<any[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(formData: FormData) {
    setLoading(true);
    setHasSearched(true);
    const city = formData.get("city")?.toString() || "Mumbai";
    const origin = formData.get("origin")?.toString() || "";
    const destination = formData.get("destination")?.toString() || "";

    const res = await searchRides(city, origin, destination);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      setRides(res.rides || []);
    }
    setLoading(false);
  }

  async function handleRequest(offerId: string) {
    setRequestingId(offerId);
    const res = await requestRide(offerId, 1);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Request sent! The driver will review it shortly.");
    }
    setRequestingId(null);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Find a Ride</h1>
        <p className="text-zinc-500 mt-1">Search for carpools going your way and save on travel costs.</p>
      </div>

      {/* Search Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <form action={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/4 space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">City</label>
            <select 
              name="city"
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/3 space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                name="origin"
                placeholder="Leaving from..."
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/3 space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">To</label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                name="destination"
                placeholder="Going to..."
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-70 h-[42px]"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">Available Rides</h2>
          
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : rides?.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-zinc-200 border-dashed">
              <Car className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-zinc-900">No rides found</h3>
              <p className="text-zinc-500 mt-1">Try adjusting your search criteria or checking back later.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {rides?.map((ride) => (
                <div key={ride.id} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-zinc-200 hover:border-indigo-200 transition-colors flex flex-col md:flex-row gap-6">
                  
                  <div className="flex-1 space-y-4">
                    {/* Route Timeline */}
                    <div className="relative pl-6 space-y-4">
                      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-zinc-200"></div>
                      
                      <div className="relative">
                        <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-indigo-600 bg-white"></div>
                        <p className="font-semibold text-zinc-900">{ride.origin}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {new Date(ride.departure_time).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-indigo-600"></div>
                        <p className="font-semibold text-zinc-900">{ride.destination}</p>
                      </div>
                    </div>
                    
                    {/* Driver & Car Info */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {ride.driver?.full_name?.charAt(0) || "D"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{ride.driver?.full_name || "Unknown Driver"}</p>
                        <p className="text-xs text-zinc-500">
                          {ride.vehicle?.make} {ride.vehicle?.model} • {ride.vehicle?.color}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Column */}
                  <div className="md:border-l md:border-zinc-100 md:pl-6 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 min-w-[140px]">
                    <div className="text-left md:text-right">
                      <div className="flex items-center gap-1 font-bold text-2xl text-zinc-900">
                        <IndianRupee className="h-5 w-5" />
                        {ride.price_per_seat}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 mt-1 justify-start md:justify-end">
                        <Users className="h-3.5 w-3.5" />
                        {ride.available_seats} seats left
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRequest(ride.id)}
                      disabled={requestingId === ride.id}
                      className="flex-shrink-0 flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-70"
                    >
                      {requestingId === ride.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>Book Seat <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
