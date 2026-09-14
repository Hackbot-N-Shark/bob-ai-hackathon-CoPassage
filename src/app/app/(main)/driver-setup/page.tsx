"use client";

import { useState } from "react";
import { registerVehicle } from "./actions";
import { Car, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DriverSetupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await registerVehicle(formData);
    
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success("Vehicle registered successfully! You are now a verified driver.");
      router.push("/app/dashboard");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Become a Driver</h1>
            <p className="text-sm text-zinc-500">Register your vehicle to start offering rides.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex gap-3 text-blue-800">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>Trust & Safety Verification</strong>
            <p className="mt-1 opacity-90">
              For this MVP demo, submitting your vehicle details will instantly verify your account. In production, this would be queued for City Staff approval.
            </p>
          </div>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 block">Make (Brand)</label>
              <input 
                name="make"
                required
                placeholder="e.g., Toyota"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 block">Model</label>
              <input 
                name="model"
                required
                placeholder="e.g., Camry"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 block">Year</label>
              <input 
                name="year"
                type="number"
                required
                min="1990"
                max={new Date().getFullYear() + 1}
                placeholder="e.g., 2020"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 block">Color</label>
              <input 
                name="color"
                required
                placeholder="e.g., Silver"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 block">License Plate</label>
              <input 
                name="license_plate"
                required
                placeholder="e.g., MH-01-AB-1234"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 block">Passenger Capacity</label>
              <select 
                name="capacity"
                defaultValue="4"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              >
                <option value="1">1 Seat</option>
                <option value="2">2 Seats</option>
                <option value="3">3 Seats</option>
                <option value="4">4 Seats</option>
                <option value="5">5 Seats</option>
                <option value="6">6+ Seats</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:hover:bg-indigo-600"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
