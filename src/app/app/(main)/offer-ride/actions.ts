"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { geocodeAddress } from "@/lib/location";

export async function createRideOffer(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const origin = formData.get("origin")?.toString();
  const destination = formData.get("destination")?.toString();
  const city = formData.get("city")?.toString();
  const departure_time = formData.get("departure_time")?.toString();
  const total_seats = parseInt(formData.get("seats")?.toString() || "0", 10);
  const price_per_seat = parseFloat(formData.get("price")?.toString() || "0");
  const vehicle_id = formData.get("vehicle_id")?.toString();

  if (!origin || !destination || !city || !departure_time || !total_seats || !vehicle_id) {
    return { error: "All fields are required" };
  }

  // Geocode origin and destination (same as broadcast-ride)
  const [originCoords, destCoords] = await Promise.all([
    geocodeAddress(origin, city),
    geocodeAddress(destination, city),
  ]);

  const { error } = await supabase.from("ride_offers").insert({
    driver_id: user.id,
    vehicle_id,
    city,
    origin,
    origin_lat: originCoords?.lat ?? null,
    origin_lng: originCoords?.lng ?? null,
    destination,
    dest_lat: destCoords?.lat ?? null,
    dest_lng: destCoords?.lng ?? null,
    departure_time: new Date(departure_time).toISOString(),
    total_seats,
    available_seats: total_seats,
    price_per_seat,
    status: "active",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/offer-ride");
  revalidatePath("/app/find-ride");
  revalidatePath("/app/my-rides");

  return { success: true };
}
