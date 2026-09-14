"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { updateUserRole, inviteCityStaff, deleteUser, updateUserCity } from "../actions";
import type { UserRole } from "@/types/supabase";
import { ShieldCheck, ShieldOff, ChevronDown, ChevronLeft, ChevronRight, Plus, X, Loader2, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  assigned_city: string | null;
  created_at: string;
}

interface RoleActionsProps {
  profile: Profile;
  currentAdminId: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  user: "User",
  city_staff: "City Staff",
  super_admin: "Super Admin",
};

const ROLE_BADGE: Record<UserRole, string> = {
  user: "bg-zinc-100 text-zinc-600",
  city_staff: "bg-indigo-100 text-indigo-700",
  super_admin: "bg-purple-100 text-purple-700",
};

/**
 * Inline role-change control — rendered per row in the data table.
 */
function RoleActions({ profile, currentAdminId }: RoleActionsProps) {
  const [isPending, startTransition] = useTransition();

  const isSelf = profile.id === currentAdminId;

  function handleRoleChange(newRole: UserRole) {
    startTransition(async () => {
      const result = await updateUserRole(profile.id, newRole);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
      }
    });
  }

  function handleDeleteUser() {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    startTransition(async () => {
      const result = await deleteUser(profile.id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
      }
    });
  }

  function handleEditCity() {
    const newCity = window.prompt("Enter new assigned city:", profile.assigned_city || "");
    if (newCity === null) return;
    if (newCity.trim() === "") {
      toast.error("City name cannot be empty.");
      return;
    }

    startTransition(async () => {
      const result = await updateUserCity(profile.id, newCity.trim());
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
      }
    });
  }

  if (isSelf) {
    return (
      <span className="text-xs text-zinc-400 italic">Current session</span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {profile.role === "user" && (
          <button
            onClick={() => handleRoleChange("city_staff")}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {isPending ? "Updating…" : "Promote to City Staff"}
          </button>
        )}
        {profile.role === "city_staff" && (
          <>
            <button
              onClick={handleEditCity}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
            >
              <MapPin className="h-3.5 w-3.5" />
              {isPending ? "Updating…" : "Edit City"}
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isPending ? "Deleting…" : "Revoke Access"}
            </button>
            <button
              onClick={() => handleRoleChange("super_admin")}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 disabled:opacity-50"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {isPending ? "Updating…" : "Make Super Admin"}
            </button>
          </>
        )}
        {profile.role === "super_admin" && (
          <button
            onClick={() => handleRoleChange("city_staff")}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            {isPending ? "Updating…" : "Demote to City Staff"}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------
export function UsersTable({
  profiles,
  currentAdminId,
  totalCount,
  currentPage,
  itemsPerPage,
  initialSearch,
}: {
  profiles: Profile[];
  currentAdminId: string;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  initialSearch: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffCity, setStaffCity] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  async function handleInviteStaff(e: React.FormEvent) {
    e.preventDefault();
    setIsInviting(true);
    const result = await inviteCityStaff(staffEmail, staffName, staffCity);
    setIsInviting(false);
    
    if (!result.success) {
      toast.error((result as any).error);
      return;
    }
    
    toast.success((result as any).message);
    setIsModalOpen(false);
    setStaffEmail("");
    setStaffName("");
    setStaffCity("");
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearch(val);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) {
        params.set("search", val);
        params.delete("page");
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* Table toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            All Users
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400">
            {totalCount} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={handleSearch}
            placeholder="Search name, email, role…"
            className="w-56 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Table */}
      {profiles.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-zinc-400">
          No users match your search.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isPending ? "opacity-50" : ""}`}>
              <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Current Role</th>
                <th className="px-6 py-3">Assigned City</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {profiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="transition-colors hover:bg-zinc-50"
                >
                  {/* Avatar + name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                        {(profile.full_name ?? profile.email ?? "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="font-medium text-zinc-800">
                        {profile.full_name ?? (
                          <span className="italic text-zinc-400">
                            No name
                          </span>
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-zinc-500">
                    {profile.email ?? "—"}
                  </td>

                  {/* Role badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[profile.role]}`}
                    >
                      {ROLE_LABELS[profile.role]}
                    </span>
                  </td>

                  {/* Assigned City */}
                  <td className="px-6 py-4 text-zinc-500 text-sm">
                    {profile.role === "city_staff" ? (
                      profile.assigned_city ? (
                        <span className="font-medium text-zinc-700">{profile.assigned_city}</span>
                      ) : (
                        <span className="italic text-zinc-400">Unassigned</span>
                      )
                    ) : (
                      <span className="italic text-zinc-400">—</span>
                    )}
                  </td>

                  {/* Joined date */}
                  <td className="px-6 py-4 text-xs text-zinc-400">
                    {new Date(profile.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <RoleActions
                      profile={profile}
                      currentAdminId={currentAdminId}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-3">
            <span className="text-sm text-zinc-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </>
      )}

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-zinc-900">Provision City Staff</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleInviteStaff} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="staffEmail" className="block text-sm font-medium text-zinc-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="staffEmail"
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="staff@city.gov"
                    className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-xs text-zinc-500">An invitation link will be sent to this email.</p>
                </div>
                <div>
                  <label htmlFor="staffName" className="block text-sm font-medium text-zinc-700">
                    Full Name <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="staffName"
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Jane Doe"
                    className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="staffCity" className="block text-sm font-medium text-zinc-700">
                    Assigned City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="staffCity"
                    type="text"
                    required
                    value={staffCity}
                    onChange={(e) => setStaffCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting || !staffEmail}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isInviting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
