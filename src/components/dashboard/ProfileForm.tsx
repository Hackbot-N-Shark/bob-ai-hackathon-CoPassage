"use client";

import { useState, useTransition } from "react";
import { updateUserProfile } from "@/actions/dashboard";
import { toast } from "sonner";

export function ProfileForm({ 
  initialName, 
  email,
  role 
}: { 
  initialName: string;
  email: string;
  role: string;
}) {
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      setMessage(null);
      const result = await updateUserProfile(name);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated successfully!");
      }
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        {/* Email Field (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-500 shadow-sm sm:text-sm"
          />
          <p className="mt-1 text-xs text-zinc-400">
            Your email is managed by your authentication provider.
          </p>
        </div>

        {/* Role Field (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Role
          </label>
          <input
            type="text"
            value={role}
            disabled
            className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-500 shadow-sm sm:text-sm capitalize"
          />
        </div>

        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-zinc-700">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            className="mt-1 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
            placeholder="John Doe"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-100">
        <button
          type="submit"
          disabled={isPending || name.trim() === initialName}
          className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
