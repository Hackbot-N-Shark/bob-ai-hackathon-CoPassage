"use client";

import { useActionState, useEffect, useRef } from "react";
import { userRegister, type UserRegisterFormState } from "./actions";
import { Users, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const initialState: UserRegisterFormState = {};

export default function UserRegisterPage() {
  const [state, formAction, isPending] = useActionState(
    userRegister,
    initialState
  );

  const fullNameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    fullNameRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">

        {/* Header */}
        <div className="border-b border-zinc-100 px-8 py-8 text-center relative bg-gradient-to-br from-indigo-50 to-white">
          <Link href="/" className="absolute left-6 top-6 text-sm text-zinc-400 hover:text-zinc-600 font-medium transition-colors">
            &larr; Home
          </Link>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
            <Users className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Create an Account</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Join CoPassage today
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
                Full name
              </label>
              <input
                ref={fullNameRef}
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                disabled={isPending}
                placeholder="John Doe"
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 aria-[invalid]:border-red-400"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isPending}
                placeholder="you@example.com"
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 aria-[invalid]:border-red-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={isPending}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Sign up
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 bg-zinc-50 px-8 py-5 text-center">
          <p className="text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/app/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
