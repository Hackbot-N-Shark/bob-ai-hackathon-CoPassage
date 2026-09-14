"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function searchRides(city: string, origin: string, destination: string) {
  const supabase = await createClient();

  // Basic ilike search for MVP
  const { data, error } = await supabase
    .from("ride_offers")
    .select(`
      *,
      driver:profiles!driver_id(full_name, avatar_url),
      vehicle:vehicles!vehicle_id(make, model, color, license_plate)
    `)
    .eq("city", city)
    .eq("status", "active")
    .ilike("origin", `%${origin}%`)
    .ilike("destination", `%${destination}%`)
    .gt("available_seats", 0)
    .order("departure_time", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { rides: data };
}

export async function requestRide(offerId: string, seats: number = 1) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Check if they already requested this ride
  const { data: existing } = await supabase
    .from("ride_requests")
    .select("id")
    .eq("offer_id", offerId)
    .eq("rider_id", user.id)
    .single();

  if (existing) {
    return { error: "You have already requested to join this ride." };
  }

  const { error } = await supabase.from("ride_requests").insert({
    offer_id: offerId,
    rider_id: user.id,
    seats_requested: seats,
    status: "pending"
  });

  if (error) return { error: error.message };

  revalidatePath("/app/find-ride");
  revalidatePath("/app/my-rides");

  return { success: true };
}
