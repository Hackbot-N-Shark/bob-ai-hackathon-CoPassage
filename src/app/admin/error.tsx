"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-zinc-900">
        Something went wrong!
      </h2>
      <p className="mb-8 max-w-md text-sm text-zinc-500">
        We encountered an unexpected error while loading this page. This could be
        due to a database issue or a network interruption.
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={() => window.location.href = "/admin"}
          className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Return to Dashboard
        </button>
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
      
      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-left">
          <p className="mb-2 text-xs font-semibold text-red-800 uppercase tracking-wider">
            Developer Details
          </p>
          <pre className="overflow-x-auto text-xs text-red-600">
            {error.message}
            {"\n"}
            {error.stack}
          </pre>
        </div>
      )}
    </div>
  );
}
