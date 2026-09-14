"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function acceptRequest(requestId: string, offerId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Update request status
  const { error: reqError, data: request } = await supabase
    .from("ride_requests")
    .update({ status: "accepted" })
    .eq("id", requestId)
    .select()
    .single();

  if (reqError) return { error: reqError.message };

  // Create match and return its id so the driver can navigate to /app/drive/[matchId]
  const { error: matchError, data: match } = await supabase
    .from("matches")
    .insert({
      match_ref: `MTC-${Math.floor(Math.random() * 900000) + 100000}`,
      city: (await supabase.from("ride_offers").select("city").eq("id", offerId).single()).data?.city || "Unknown",
      driver_id: user.id,
      rider_id: request.rider_id,
      offer_id: offerId,
      request_id: requestId,
      status: "active"
    })
    .select("id")
    .single();

  if (matchError) return { error: matchError.message };

  // Update available seats
  // In a real app we'd use a postgres function for atomic decrement, but this is an MVP
  const { data: offer } = await supabase.from("ride_offers").select("available_seats").eq("id", offerId).single();
  if (offer) {
    const newSeats = Math.max(0, offer.available_seats - request.seats_requested);
    await supabase.from("ride_offers").update({
      available_seats: newSeats,
      status: newSeats === 0 ? "full" : "active"
    }).eq("id", offerId);
  }

  revalidatePath("/app/my-rides");
  return { success: true, matchId: match.id };
}

export async function rejectRequest(requestId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("ride_requests")
    .update({ status: "rejected" })
    .eq("id", requestId);

  if (error) return { error: error.message };
  
  revalidatePath("/app/my-rides");
  return { success: true };
}
