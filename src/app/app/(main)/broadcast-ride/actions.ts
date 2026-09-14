"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { geocodeAddress } from "@/lib/location";

export async function createRideBroadcast(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const origin = formData.get("origin")?.toString();
  const destination = formData.get("destination")?.toString();
  const city = formData.get("city")?.toString();
  const departure_time = formData.get("departure_time")?.toString();
  const seats_needed = parseInt(formData.get("seats")?.toString() || "1", 10);

  if (!origin || !destination || !city || !departure_time || !seats_needed) {
    return { error: "All fields are required" };
  }

  // Geocode origin and destination
  const originCoords = await geocodeAddress(origin, city);
  const destCoords = await geocodeAddress(destination, city);

  const { error } = await supabase.from("ride_broadcasts").insert({
    passenger_id: user.id,
    city,
    origin,
    origin_lat: originCoords?.lat || null,
    origin_lng: originCoords?.lng || null,
    destination,
    dest_lat: destCoords?.lat || null,
    dest_lng: destCoords?.lng || null,
    departure_time: new Date(departure_time).toISOString(),
    seats_needed,
    status: "active",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/find-passengers");
  revalidatePath("/app/my-rides");

  return { success: true };
}
