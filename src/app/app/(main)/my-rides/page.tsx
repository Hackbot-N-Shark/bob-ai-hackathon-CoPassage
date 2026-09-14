import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MapPin, Navigation, CheckCircle2, XCircle } from "lucide-react";
import ManageRequestButtons from "./ManageRequestButtons";
import Link from "next/link";

export default async function MyRidesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/app/login");

  // Fetch rides where user is driver (Offers)
  const { data: offers } = await supabase
    .from("ride_offers")
    .select("*, requests:ride_requests(*, rider:profiles!rider_id(full_name, avatar_url))")
    .eq("driver_id", user.id)
    .order("departure_time", { ascending: false });

  // Fetch rides where user is rider — also pull the match so we can link to the tracking page
  const { data: riderRequests } = await supabase
    .from("ride_requests")
    .select(`
      *,
      offer:ride_offers(*, driver:profiles!driver_id(full_name, avatar_url)),
      match:matches!request_id(id)
    `)
    .eq("rider_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">My Rides</h1>
        <p className="text-zinc-500 mt-1">Manage your carpools and upcoming trips.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* As a Rider Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-200 pb-2">
            As a Passenger
          </h2>
          
          {!riderRequests || riderRequests.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-zinc-200 border-dashed">
              <p className="text-zinc-500">You haven't requested any rides yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {riderRequests.map((req) => {
                const offer = (req.offer as any);
                // matches is a 1-row array due to the foreign key join
                const matchId = Array.isArray((req as any).match) && (req as any).match.length > 0
                  ? (req as any).match[0].id
                  : null;

                return (
                  <div key={req.id} className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">{new Date(offer?.departure_time).toLocaleDateString()}</span>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-zinc-900">{offer?.origin} → {offer?.destination}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                          {offer?.driver?.full_name?.charAt(0) || "D"}
                        </div>
                        <p className="text-sm text-zinc-600">{offer?.driver?.full_name}</p>
                      </div>
                    </div>

                    {req.status === 'accepted' && matchId && (
                      <div className="pt-2 border-t border-zinc-100">
                        <Link
                          href={`/app/ride/${matchId}`}
                          className="flex items-center gap-1.5 w-fit px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          Track Ride
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* As a Driver Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-200 pb-2">
            As a Driver
          </h2>
          
          {!offers || offers.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-zinc-200 border-dashed">
              <p className="text-zinc-500">You haven't offered any rides yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                  <div className="p-5 bg-zinc-50 border-b border-zinc-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        offer.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-200 text-zinc-700'
                      }`}>
                        {offer.status}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">{new Date(offer.departure_time).toLocaleDateString()}</span>
                    </div>
                    <p className="font-semibold text-zinc-900">{offer.origin} → {offer.destination}</p>
                    <p className="text-xs text-zinc-500 mt-1">{offer.available_seats} of {offer.total_seats} seats left</p>
                  </div>
                  
                  {/* Requests for this offer */}
                  <div className="p-4 divide-y divide-zinc-100">
                    {!offer.requests || offer.requests.length === 0 ? (
                      <p className="text-sm text-zinc-500 text-center py-2">No requests yet.</p>
                    ) : (
                      offer.requests.map((req: any) => (
                        <div key={req.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-sm">
                              {req.rider?.full_name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-900">{req.rider?.full_name}</p>
                              <p className="text-xs text-zinc-500">{req.seats_requested} seat(s) • {req.status}</p>
                            </div>
                          </div>
                          
                          {req.status === 'pending' && (
                            <ManageRequestButtons requestId={req.id} offerId={offer.id} />
                          )}
                          {req.status === 'accepted' && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          )}
                          {req.status === 'rejected' && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
