"use client";

import { useState } from "react";
import { createRideBroadcast } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Navigation, Calendar, Users, RadioTower } from "lucide-react";

export default function BroadcastRidePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await createRideBroadcast(formData);
    
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success("Ride request broadcasted! Local drivers will be notified.");
      router.push("/app/my-rides"); 
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Broadcast a Ride Need</h1>
        <p className="text-zinc-500 mt-1">Can't find a ride? Broadcast your route and let local drivers find you.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-zinc-200">
        
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 flex gap-3 text-amber-800">
          <RadioTower className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>How Broadcasts Work</strong>
            <p className="mt-1 opacity-90">
              When you broadcast a ride need, it will appear on the radar of verified drivers heading your way. They can accept your request and pick you up.
            </p>
          </div>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {/* Route Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-2">Route Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">From (Exact Location)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                    name="origin"
                    required
                    placeholder="e.g., Colaba Causeway"
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">To (Exact Location)</label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                    name="destination"
                    required
                    placeholder="e.g., Juhu Beach"
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">City Context</label>
              <select 
                name="city"
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>
          </div>

          <div className="border-t border-zinc-100 my-6"></div>

          {/* Schedule Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-2">Schedule & Needs</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Desired Departure Time</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                    name="departure_time"
                    type="datetime-local"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Seats Needed</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                    name="seats"
                    type="number"
                    required
                    min="1"
                    max="6"
                    placeholder="e.g., 1"
                    defaultValue="1"
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3.5 font-semibold text-white shadow-sm hover:bg-amber-700 transition-all disabled:opacity-70 disabled:hover:bg-amber-600"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Broadcast Route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
