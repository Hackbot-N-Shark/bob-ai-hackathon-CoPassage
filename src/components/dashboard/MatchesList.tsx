"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

type MatchStatus = "pending" | "active" | "completed" | "cancelled";

interface Match {
  id: string;
  match_ref: string;
  city: string;
  driver_name: string;
  rider_name: string;
  status: MatchStatus;
  created_at: string;
}

const STATUS_COLORS: Record<MatchStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-zinc-100 text-zinc-600",
};

export function MatchesList({
  matches,
  totalCount,
  currentPage,
  itemsPerPage,
  initialStatus,
  initialSearch,
}: {
  matches: Match[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  initialStatus: MatchStatus | "all";
  initialSearch: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<MatchStatus | "all">(initialStatus);
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  function updateUrl(
    newFilter: MatchStatus | "all",
    newSearch: string,
    newPage: number
  ) {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter !== "all") {
      params.set("status", newFilter);
    } else {
      params.delete("status");
    }
    if (newSearch.trim()) {
      params.set("search", newSearch.trim());
    } else {
      params.delete("search");
    }
    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleFilterChange(status: MatchStatus | "all") {
    setFilter(status);
    updateUrl(status, search, 1);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateUrl(filter, search, 1);
  }

  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    updateUrl(filter, search, newPage);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "active", "completed", "cancelled"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                disabled={isPending}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  filter === tab
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                } disabled:opacity-50`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search city or ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
          />
        </form>
      </div>

      {/* Matches Table */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">City</th>
                <th className="px-6 py-3">Participants</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-zinc-100 ${isPending ? "opacity-50" : ""}`}>
              {matches.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-400"
                  >
                    No matches found matching criteria.
                  </td>
                </tr>
              ) : (
                matches.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-zinc-50">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-600">
                      {m.match_ref}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-800">
                      {m.city}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-800">D: {m.driver_name}</div>
                      <div className="text-zinc-500 mt-0.5">R: {m.rider_name}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[m.status]}`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="text-sm text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
