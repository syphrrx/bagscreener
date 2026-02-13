"use client";

import { useState, useEffect, useCallback } from "react";
import TokenCard from "./TokenCard";
import { RefreshCw } from "lucide-react";

interface Listing {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenTicker: string;
  description: string | null;
  imageUrl: string | null;
  creatorWallet: string;
  status: string;
  solPaid: number;
  solPayout: number | null;
  botBuyTx: string | null;
  bondedAt: string | null;
  diedAt: string | null;
  createdAt: string;
}

type FilterStatus = "all" | "live" | "bonded" | "dead";

export default function TokenFeed({ refreshKey }: { refreshKey: number }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      setListings(data);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings, refreshKey]);

  const filters: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "all" },
    { label: "Live", value: "live" },
    { label: "Bonded", value: "bonded" },
    { label: "Dead", value: "dead" },
  ];

  return (
    <div id="feed">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                filter === f.value
                  ? "vw-btn"
                  : "border border-vw-purple/20 bg-transparent text-vw-purple/50 hover:border-vw-pink/30 hover:text-vw-pink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={fetchListings}
          className="flex items-center gap-1.5 border border-vw-purple/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-vw-purple/50 transition hover:border-vw-cyan/30 hover:text-vw-cyan"
        >
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin border-2 border-vw-pink border-t-transparent" />
        </div>
      ) : listings.length === 0 ? (
        <div className="vw-card py-16 text-center">
          <p className="text-lg font-bold neon-purple">No bags found.</p>
          <p className="mt-1 text-sm text-vw-purple/40">
            Be the first degen to list a token.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <TokenCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
