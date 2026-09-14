"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types/supabase";

export type UpdateRoleResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Server Action — Update a user's role.
 *
 * Only callable by an authenticated super_admin (enforced by RLS on the
 * profiles table in addition to this runtime check).
 */
export async function updateUserRole(
  targetUserId: string,
  newRole: UserRole
): Promise<UpdateRoleResult> {
  if (!["user", "city_staff", "super_admin"].includes(newRole)) {
    return { success: false, error: "Invalid role specified." };
  }

  const supabase = await createClient();

  // Verify the caller is a super_admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const callerProfile = data as { role: string } | null;

  if (!callerProfile || callerProfile.role !== "super_admin") {
    return { success: false, error: "Insufficient permissions." };
  }

  // Prevent a super_admin from demoting themselves
  if (targetUserId === user.id && newRole !== "super_admin") {
    return {
      success: false,
      error: "You cannot change your own role.",
    };
  }

  const { error } = await (supabase
    .from("profiles") as any)
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");

  const roleLabels: Record<UserRole, string> = {
    user: "User",
    city_staff: "City Staff",
    super_admin: "Super Admin",
  };

  return {
    success: true,
    message: `Role updated to "${roleLabels[newRole]}" successfully.`,
  };
}

export async function inviteCityStaff(
  email: string,
  fullName: string,
  assignedCity: string
): Promise<UpdateRoleResult> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return { success: false, error: "SUPABASE_SERVICE_ROLE_KEY is not set." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const callerProfile = data as { role: string } | null;

  if (!callerProfile || callerProfile.role !== "super_admin") {
    return { success: false, error: "Insufficient permissions." };
  }

  // Use the admin API with the service role key
  
  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data: inviteData, error: inviteError } = await adminAuthClient.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
      role: 'city_staff',
      assigned_city: assignedCity,
      force_password_change: true,
    }
  });

  if (inviteError) {
    return { success: false, error: inviteError.message };
  }

  revalidatePath("/admin/users");

  return {
    success: true,
    message: `Invitation sent to ${email}.`,
  };
}

export async function deleteUser(
  targetUserId: string
): Promise<UpdateRoleResult> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return { success: false, error: "SUPABASE_SERVICE_ROLE_KEY is not set." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const callerProfile = data as { role: string } | null;

  if (!callerProfile || callerProfile.role !== "super_admin") {
    return { success: false, error: "Insufficient permissions." };
  }

  if (targetUserId === user.id) {
    return { success: false, error: "You cannot delete your own account." };
  }

  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { error } = await adminAuthClient.auth.admin.deleteUser(targetUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");

  return {
    success: true,
    message: "User permanently deleted.",
  };
}

export async function updateUserCity(
  userId: string,
  newCity: string
): Promise<UpdateRoleResult> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return { success: false, error: "SUPABASE_SERVICE_ROLE_KEY is not set." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const callerProfile = data as { role: string } | null;

  if (!callerProfile || callerProfile.role !== "super_admin") {
    return { success: false, error: "Insufficient permissions." };
  }

  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const { error: updateError } = await adminAuthClient.auth.admin.updateUserById(userId, {
      user_metadata: { assigned_city: newCity }
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    const { error: profileError } = await (supabase
      .from("profiles") as any)
      .update({ assigned_city: newCity })
      .eq("id", userId);

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    revalidatePath("/admin/users");

    return { success: true, message: "User's assigned city updated successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update assigned city" };
  }
}
