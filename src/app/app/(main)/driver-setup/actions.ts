"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function registerVehicle(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const make = formData.get("make")?.toString();
  const model = formData.get("model")?.toString();
  const year = parseInt(formData.get("year")?.toString() || "0", 10);
  const color = formData.get("color")?.toString();
  const license_plate = formData.get("license_plate")?.toString();
  const capacity = parseInt(formData.get("capacity")?.toString() || "4", 10);

  if (!make || !model || !year || !color || !license_plate) {
    return { error: "All fields are required" };
  }

  const { error } = await supabase.from("vehicles").insert({
    owner_id: user.id,
    make,
    model,
    year,
    color,
    license_plate,
    capacity,
  });

  if (error) {
    return { error: error.message };
  }

  // Once the vehicle is registered, we pretend they are instantly verified for the sake of the MVP
  // In a real app, we would wait for city staff to verify them.
  const { error: profileError } = await (supabase.from("profiles") as any)
    .update({ is_driver_verified: true })
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/app/dashboard");
  revalidatePath("/app/driver-setup");
  
  // We cannot call redirect inside a try/catch or if it's meant to return an error, but it's safe at the end.
  // Actually, returning success is better and letting the client redirect.
  return { success: true };
}
