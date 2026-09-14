"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setIsPending(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-zinc-100 px-8 py-8 text-center relative bg-gradient-to-br from-zinc-50 to-white">
          <Link href="/" className="absolute left-6 top-6 text-sm text-zinc-400 hover:text-zinc-600 font-medium transition-colors">
            &larr; Home
          </Link>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 shadow-lg shadow-zinc-900/20">
            <ShieldAlert className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Forgot Password</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Enter your email to receive a reset link
          </p>
        </div>

        <div className="px-8 py-7">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900">Check your inbox</h2>
              <p className="text-sm text-zinc-500">
                We sent a password reset link to <span className="font-medium text-zinc-900">{email}</span>. Please check your spam folder if you don't see it.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  placeholder="you@example.com"
                  className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !email}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
