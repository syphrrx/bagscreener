"use client";

import { Skull, Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

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

const statusCardClass: Record<string, string> = {
  live: "vw-card",
  bonded: "vw-card-cyan",
  dead: "vw-card-pink",
  pending: "vw-card",
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    live: {
      label: "LIVE",
      className: "text-vw-yellow border-vw-yellow/30 bg-vw-yellow/5",
      icon: <Clock className="h-3 w-3" />,
    },
    bonded: {
      label: "BONDED",
      className: "text-vw-cyan border-vw-cyan/30 bg-vw-cyan/5",
      icon: <Trophy className="h-3 w-3" />,
    },
    dead: {
      label: "DEAD",
      className: "text-vw-hot border-vw-hot/30 bg-vw-hot/5",
      icon: <Skull className="h-3 w-3" />,
    },
    pending: {
      label: "PENDING",
      className: "text-vw-purple/60 border-vw-purple/20 bg-vw-purple/5",
      icon: <Clock className="h-3 w-3" />,
    },
  };

  const c = config[status] || config.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
        c.className
      )}
    >
      {c.icon} {c.label}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default function TokenCard({ listing }: { listing: Listing }) {
  const statusMessages: Record<string, string> = {
    live: "This dev paid 1 SOL. Respect.",
    bonded: `Bags survived. Dev rewarded ${listing.solPayout || "?"} SOL.`,
    dead: "RIP. SOL secured.",
    pending: "Waiting for confirmation...",
  };

  return (
    <div className={cn("p-5 transition-all hover:brightness-110", statusCardClass[listing.status] || "vw-card")}>
      <div className="flex items-start gap-4">
        {listing.imageUrl ? (
          <div className="flex-shrink-0 border border-vw-purple/20 bg-vw-dark">
            <img
              src={listing.imageUrl}
              alt={listing.tokenName}
              className="h-12 w-12 object-cover"
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-vw-purple/20 bg-vw-dark text-lg font-bold text-vw-purple">
            {listing.tokenTicker.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="truncate text-base font-bold text-white">
              {listing.tokenName}
            </h3>
            <span className="text-sm font-bold text-vw-purple/50">
              ${listing.tokenTicker}
            </span>
            <StatusBadge status={listing.status} />
          </div>

          <p className="mt-0.5 text-xs text-vw-purple/40">
            by {truncateAddress(listing.creatorWallet)} &middot;{" "}
            {timeAgo(listing.createdAt)}
          </p>

          {listing.description && (
            <p className="mt-2 line-clamp-2 text-sm text-vw-purple/60">
              {listing.description}
            </p>
          )}

          <p className="mt-2 text-xs font-medium italic text-vw-pink/40">
            &ldquo;{statusMessages[listing.status] || statusMessages.pending}&rdquo;
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-vw-purple/40">Reserved</span>
          <span className="text-sm font-bold neon-purple">{listing.solPaid} SOL</span>
          {listing.solPayout && (
            <>
              <span className="mt-1 text-xs font-bold uppercase tracking-wider text-vw-cyan/40">Payout</span>
              <span className="text-sm font-bold neon-cyan">
                {listing.solPayout} SOL
              </span>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-vw-purple/10 pt-3">
        <a
          href={`https://pump.fun/coin/${listing.tokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold uppercase tracking-wider text-vw-purple/40 transition hover:text-vw-pink"
        >
          pump.fun
        </a>
        <span className="text-vw-purple/20">&middot;</span>
        <a
          href={listing.botBuyTx ? `https://solscan.io/tx/${listing.botBuyTx}` : `https://solscan.io/token/${listing.tokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold uppercase tracking-wider text-vw-purple/40 transition hover:text-vw-pink"
        >
          solscan
        </a>
        <span className="text-vw-purple/20">&middot;</span>
        <span className="text-xs text-vw-purple/30">
          {truncateAddress(listing.tokenAddress)}
        </span>
      </div>
    </div>
  );
}
