"use client";

import { useState } from "react";
import { acceptRequest, rejectRequest } from "./actions";
import { Check, X, Loader2, Navigation } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ManageRequestButtons({ requestId, offerId }: { requestId: string, offerId: string }) {
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);

  async function handleAccept() {
    setLoading("accept");
    const res = await acceptRequest(requestId, offerId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Request accepted! A match has been created.");
      setMatchId(res.matchId);
    }
    setLoading(null);
  }

  async function handleReject() {
    setLoading("reject");
    const res = await rejectRequest(requestId);
    if (res.error) toast.error(res.error);
    else toast.success("Request rejected.");
    setLoading(null);
  }

  // Once accepted, replace the action buttons with a "Start Ride" link
  if (matchId) {
    return (
      <Link
        href={`/app/drive/${matchId}`}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
      >
        <Navigation className="h-3.5 w-3.5" />
        Start Ride
      </Link>
    );
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleAccept}
        disabled={loading !== null}
        className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors disabled:opacity-50"
        title="Accept Request"
      >
        {loading === "accept" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </button>
      <button 
        onClick={handleReject}
        disabled={loading !== null}
        className="h-8 w-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
        title="Reject Request"
      >
        {loading === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
      </button>
    </div>
  );
}
