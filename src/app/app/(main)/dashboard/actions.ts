"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function reportIssue(formData: FormData) {
  const subject = formData.get("subject")?.toString();
  const description = formData.get("description")?.toString();
  const priority = formData.get("priority")?.toString() || "medium";
  const city = formData.get("city")?.toString();

  if (!subject || !city) {
    return { error: "Subject and City are required." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("escalations")
    .insert({
      ticket_ref: `USR-${Math.floor(Math.random() * 900000) + 100000}`,
      reported_by: user.id,
      city,
      subject,
      description,
      priority: priority as "low" | "medium" | "high" | "critical",
      status: "open",
    });

  if (error) return { error: error.message };

  revalidatePath("/app/dashboard");
  return { success: true };
}

export async function triggerSOS(city: string, lat?: number, lng?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("sos_alerts")
    .insert({
      user_id: user.id,
      city,
      location_lat: lat || null,
      location_lng: lng || null,
      status: "active",
    });

  if (error) return { error: error.message };

  revalidatePath("/app/dashboard");
  return { success: true };
}
