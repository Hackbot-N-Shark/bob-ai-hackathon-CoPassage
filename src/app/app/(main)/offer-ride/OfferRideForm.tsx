"use client";

import { useState } from "react";
import { createRideOffer } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Navigation, Calendar, IndianRupee, Users } from "lucide-react";

export default function OfferRideForm({ vehicles }: { vehicles: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await createRideOffer(formData);
    
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success("Ride offer published successfully!");
      router.push("/app/my-rides"); // Or wherever we want to redirect them
    }
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-zinc-200">
      <form action={handleSubmit} className="space-y-6">
        
        {/* Route Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-2">Route Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  name="origin"
                  required
                  placeholder="e.g., Andheri West"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">To</label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  name="destination"
                  required
                  placeholder="e.g., Bandra Kurla Complex"
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

        {/* Schedule & Seats Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-2">Schedule & Vehicle</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Departure Time</label>
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
              <label className="text-sm font-medium text-zinc-700">Vehicle</label>
              <select 
                name="vehicle_id"
                required
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.make} {v.model} ({v.license_plate})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Available Seats</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  name="seats"
                  type="number"
                  required
                  min="1"
                  max="8"
                  placeholder="e.g., 3"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Price per Seat</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  name="price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g., 150.00"
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
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:hover:bg-indigo-600"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publish Ride"}
          </button>
        </div>
      </form>
    </div>
  );
}
