"use client";

import { useActionState, useEffect, useRef } from "react";
import { adminLogin, type LoginFormState } from "./actions";
import { ShieldCheck, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const initialState: LoginFormState = {};

/**
 * Admin Login Page — Client Component.
 *
 * Uses React 19 `useActionState` (formerly `useFormState`) to wire the
 * `adminLogin` Server Action directly to the form with pending state and
 * server-returned error display.
 *
 * Falls back gracefully on React 18 by using the same hook signature —
 * `useActionState` is available in Next.js 14.1+ via the `react` canary
 * channel that ships with the framework.
 */
export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(
    adminLogin,
    initialState
  );

  // Focus the email field on mount for accessibility
  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-sm">

        {/* Header */}
        <div className="border-b border-zinc-100 px-8 py-8 text-center relative bg-gradient-to-br from-zinc-100 to-white">
          <Link href="/" className="absolute left-6 top-6 text-sm text-zinc-400 hover:text-zinc-600 font-medium transition-colors">
            &larr; Home
          </Link>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 shadow-lg shadow-zinc-800/20">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">System Admin</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Sign in with your Super Admin credentials
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

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700"
              >
                Email address
              </label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                required
                disabled={isPending}
                placeholder="admin@copassage.in"
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 aria-[invalid]:border-red-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={isPending}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to Admin Panel
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 bg-zinc-50 px-8 py-5 text-center">
          <p className="text-center text-xs text-zinc-400">
            Access restricted to Super Admins only.
            <br />
            Contact your system administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
