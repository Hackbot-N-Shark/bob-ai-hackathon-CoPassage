"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EscalationStatus } from "@/types/supabase";

type Result =
  | { success: true; message: string }
  | { success: false; error: string };

const VALID_STATUSES: EscalationStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

export async function updateEscalationStatus(
  escalationId: string,
  newStatus: EscalationStatus
): Promise<Result> {
  if (!VALID_STATUSES.includes(newStatus)) {
    return { success: false, error: "Invalid status." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated." };

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const callerProfile = data as { role: string } | null;

  if (!callerProfile || callerProfile.role !== "super_admin") {
    return { success: false, error: "Insufficient permissions." };
  }

  const { error } = await (supabase
    .from("escalations") as any)
    .update({ status: newStatus })
    .eq("id", escalationId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/escalations");
  revalidatePath("/admin");

  return { success: true, message: `Status updated to "${newStatus}".` };
}
