"use server";

import { createClient } from "@/lib/supabase/server";

export async function searchBroadcasts(city: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ride_broadcasts")
    .select(`
      *,
      passenger:profiles!passenger_id(full_name, avatar_url)
    `)
    .eq("city", city)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { broadcasts: data };
}
