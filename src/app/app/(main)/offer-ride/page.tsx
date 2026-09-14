import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OfferRideForm from "./OfferRideForm";
import Link from "next/link";
import { AlertCircle, Car } from "lucide-react";

export default async function OfferRidePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/app/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_driver_verified")
    .eq("id", user.id)
    .single();

  if (!profile?.is_driver_verified) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center bg-white p-12 rounded-2xl shadow-sm border border-zinc-200">
        <div className="mx-auto h-16 w-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Driver Verification Required</h2>
        <p className="text-zinc-500 mb-8 max-w-md mx-auto">
          You need to be a verified driver and register a vehicle before you can offer rides on CoPassage.
        </p>
        <Link 
          href="/app/driver-setup" 
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Car className="h-5 w-5" />
          Setup Driver Profile
        </Link>
      </div>
    );
  }

  // Fetch user's vehicles
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("owner_id", user.id);

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center bg-white p-12 rounded-2xl shadow-sm border border-zinc-200">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">No Vehicles Found</h2>
        <p className="text-zinc-500 mb-8">Please register a vehicle first.</p>
        <Link href="/app/driver-setup" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold">
          Add Vehicle
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Offer a Ride</h1>
        <p className="text-zinc-500 mt-1">Post your upcoming journey and share costs with passengers.</p>
      </div>
      <OfferRideForm vehicles={vehicles} />
    </div>
  );
}
