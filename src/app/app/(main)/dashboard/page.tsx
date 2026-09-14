"use client";

import { useState, useEffect } from "react";
import { reportIssue, triggerSOS } from "./actions";
import { ShieldAlert, AlertTriangle, Send, Loader2, Car, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function UserDashboard() {
  const [city, setCity] = useState("Mumbai"); // Default for demo
  const [isSosActive, setIsSosActive] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_driver_verified")
          .eq("id", user.id)
          .single();
          
        if (profile) setIsDriver(profile.is_driver_verified);
      }
      setLoadingProfile(false);
    }
    loadProfile();
  }, [supabase]);

  async function handleSOS() {
    setIsSosActive(true);
    
    // Try to get location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const res = await triggerSOS(city, position.coords.latitude, position.coords.longitude);
          if (res.error) toast.error("SOS Failed: " + res.error);
          else toast.success("SOS Alert Sent! Help is on the way.");
          setIsSosActive(false);
        },
        async () => {
          // Fallback without location
          const res = await triggerSOS(city);
          if (res.error) toast.error("SOS Failed: " + res.error);
          else toast.success("SOS Alert Sent! Help is on the way.");
          setIsSosActive(false);
        }
      );
    } else {
      const res = await triggerSOS(city);
      if (res.error) toast.error("SOS Failed: " + res.error);
      else toast.success("SOS Alert Sent! Help is on the way.");
      setIsSosActive(false);
    }
  }

  async function handleReport(formData: FormData) {
    setIsReporting(true);
    formData.append("city", city);
    const res = await reportIssue(formData);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Issue reported successfully. City Staff has been notified.");
      (document.getElementById("report-form") as HTMLFormElement).reset();
    }
    setIsReporting(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {loadingProfile ? "Dashboard" : isDriver ? "Driver Dashboard" : "Passenger Dashboard"}
            </h1>
            <p className="text-sm text-zinc-500">Welcome to CoPassage</p>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1">Current City</label>
            <select 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="bg-zinc-100 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>
        </div>

        {/* Driver Status Banner or Driver Quick Actions */}
        {!loadingProfile && (
          isDriver ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/app/offer-ride" className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col justify-between group">
                <div className="bg-white/20 w-fit p-3 rounded-xl mb-4">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center justify-between">
                    Offer a Ride
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </h3>
                  <p className="text-indigo-100 text-sm mt-1">Post a new route and fill your empty seats.</p>
                </div>
              </Link>

              <Link href="/app/find-passengers" className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col justify-between group">
                <div className="bg-white/20 w-fit p-3 rounded-xl mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center justify-between">
                    Find Passengers
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </h3>
                  <p className="text-amber-100 text-sm mt-1">Browse locals who need a ride nearby.</p>
                </div>
              </Link>
              
              <Link href="/app/my-rides" className="bg-white rounded-2xl p-6 text-zinc-900 shadow-sm border border-zinc-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="bg-indigo-50 w-fit p-3 rounded-xl mb-4">
                  <ShieldAlert className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center justify-between">
                    Manage Requests
                    <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </h3>
                  <p className="text-zinc-500 text-sm mt-1">Review pending passengers for your routes.</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Have a car? Become a Driver!</h2>
                <p className="text-indigo-100 text-sm mt-1">Offset your travel costs by offering empty seats to other CoPassage users.</p>
              </div>
              <Link 
                href="/app/driver-setup" 
                className="flex-shrink-0 bg-white text-indigo-600 font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
              >
                Register Vehicle
              </Link>
            </div>
          )
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SOS Section */}
          <div className="md:col-span-1 bg-red-600 rounded-2xl p-6 text-center text-white shadow-lg shadow-red-600/20 flex flex-col items-center justify-center">
            <div className="mb-4 bg-white/20 p-4 rounded-full">
              <ShieldAlert className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-bold mb-2">Emergency SOS</h2>
            <p className="text-sm text-red-100 mb-6">
              Press this button in an emergency to instantly alert city staff with your location.
            </p>
            <button
              onClick={handleSOS}
              disabled={isSosActive}
              className="relative w-full py-4 rounded-xl bg-white text-red-600 font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-80 disabled:scale-100"
            >
              {isSosActive ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Sending...
                </span>
              ) : (
                "ACTIVATE SOS"
              )}
            </button>
          </div>

          {/* Report Issue Section */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">Report an Issue</h2>
            </div>
            
            <form id="report-form" action={handleReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  required
                  placeholder="e.g., Driver didn't show up"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Priority</label>
                  <select 
                    name="priority"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                <textarea 
                  name="description"
                  required
                  rows={3}
                  placeholder="Please provide details about the issue..."
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isReporting}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-lg py-2.5 font-medium hover:bg-zinc-800 transition-colors disabled:opacity-70"
              >
                {isReporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit Report
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
