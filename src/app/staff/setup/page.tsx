"use client";

import { useActionState } from "react";
import { completeStaffSetup, type StaffSetupFormState } from "./actions";
import { ShieldAlert, AlertCircle, Loader2, ArrowRight } from "lucide-react";

const initialState: StaffSetupFormState = {};

export default function StaffSetupPage() {
  const [state, formAction, isPending] = useActionState(
    completeStaffSetup,
    initialState
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-zinc-100 px-8 py-8 text-center bg-gradient-to-br from-purple-50 to-white">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 shadow-lg shadow-purple-600/20">
            <ShieldAlert className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Action Required
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Please complete your City Staff profile and set a new permanent password.
          </p>
        </div>

        {/* Form body */}
        <div className="px-8 py-7">
          <form action={formAction} className="space-y-5" noValidate>
            {/* Error banner */}
            {state?.error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-zinc-700"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                disabled={isPending}
                placeholder="Jane Doe"
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={isPending}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
