"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { AlertCircle, MapPin, Clock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface SOSAlert {
  id: string;
  user_id: string;
  city: string;
  location_lat: number | null;
  location_lng: number | null;
  status: string;
  created_at: string;
}

export default function SOSAlertsPage() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState<string | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadInitialData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("assigned_city")
        .eq("id", user.id)
        .single();
        
      if (profile?.assigned_city) {
        setCity(profile.assigned_city);
        
        // Load initial active alerts
        const { data: initialAlerts } = await supabase
          .from("sos_alerts")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });
          
        if (initialAlerts) {
          setAlerts(initialAlerts);
        }
      }
      setLoading(false);
    }
    
    loadInitialData();
  }, [supabase]);

  useEffect(() => {
    if (!city) return;

    // Subscribe to realtime updates for this city
    const channel = supabase
      .channel('sos_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sos_alerts',
          filter: `city=eq.${city}` // Need to make sure filter syntax is exactly supported, otherwise filter in JS
        },
        (payload) => {
          const newAlert = payload.new as SOSAlert;
          // Play a sound or show a highly visible toast
          toast.error("NEW SOS ALERT!", { 
            description: "A new emergency alert was just triggered.",
            duration: 10000,
            icon: <AlertCircle className="text-red-500" />
          });
          setAlerts((current) => [newAlert, ...current]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sos_alerts',
          filter: `city=eq.${city}`
        },
        (payload) => {
          const updatedAlert = payload.new as SOSAlert;
          if (updatedAlert.status !== 'active') {
            // Remove it from the active list
            setAlerts((current) => current.filter(a => a.id !== updatedAlert.id));
          } else {
            // Update it
            setAlerts((current) => current.map(a => a.id === updatedAlert.id ? updatedAlert : a));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, city]);

  async function resolveAlert(alertId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("sos_alerts")
      .update({ 
        status: "resolved", 
        resolved_by: user.id,
        resolved_at: new Date().toISOString()
      })
      .eq("id", alertId);

    if (error) {
      toast.error("Failed to resolve alert: " + error.message);
    } else {
      toast.success("Alert resolved successfully.");
      // It will also be removed optimistically or via Realtime
      setAlerts((current) => current.filter(a => a.id !== alertId));
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-red-600 p-6 rounded-2xl shadow-lg text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SOS Alerts</h1>
            <p className="text-red-100 text-sm">
              Live emergency monitoring for <span className="font-semibold text-white">{city}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 font-medium">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-red-300"></span>
          </span>
          {alerts.length} Active
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-zinc-200 shadow-sm">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900">All clear</h3>
            <p className="mt-1 text-zinc-500">There are no active SOS alerts in your city.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="bg-white p-6 rounded-2xl border-2 border-red-500 shadow-md relative overflow-hidden flex flex-col sm:flex-row gap-6">
              <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
              
              <div className="flex-1 space-y-3 pl-2">
                <div className="flex items-center gap-3 mb-2">
                  <span className="animate-pulse bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    Emergency
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">{alert.id.split('-')[0]}</span>
                </div>
                
                <h3 className="text-xl font-bold text-zinc-900">SOS Triggered</h3>
                
                <div className="flex flex-wrap gap-4 mt-2">
                  {alert.location_lat && alert.location_lng ? (
                    <div className="flex items-center gap-1.5 text-sm text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
                      <MapPin className="h-4 w-4 text-red-500" />
                      {alert.location_lat.toFixed(4)}, {alert.location_lng.toFixed(4)}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      Location unavailable
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1.5 text-sm text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
                    <Clock className="h-4 w-4 text-blue-500" />
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div className="sm:border-l sm:border-zinc-100 sm:pl-6 flex flex-col justify-center min-w-[200px]">
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Resolve Emergency
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
