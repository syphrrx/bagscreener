"use client";

import { useState, useEffect } from "react";
import { Trophy, Skull } from "lucide-react";

interface Listing {
  id: string;
  tokenName: string;
  tokenTicker: string;
  creatorWallet: string;
  status: string;
  solPayout: number | null;
  createdAt: string;
  bondedAt: string | null;
  diedAt: string | null;
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default function Leaderboard() {
  const [bonded, setBonded] = useState<Listing[]>([]);
  const [dead, setDead] = useState<Listing[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/listings?status=bonded&limit=10").then((r) => r.json()),
      fetch("/api/listings?status=dead&limit=10").then((r) => r.json()),
    ]).then(([b, d]) => {
      setBonded(b);
      setDead(d);
    });
  }, []);

  return (
    <div id="leaderboard" className="grid gap-6 md:grid-cols-2">
      {/* Biggest Bags */}
      <div className="vw-card-cyan p-5">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-vw-cyan" />
          <h3 className="text-base font-bold uppercase tracking-wider neon-cyan">
            Biggest Bags
          </h3>
        </div>
        {bonded.length === 0 ? (
          <p className="py-6 text-center text-sm text-vw-purple/40">
            No bags have bonded yet. Be the first.
          </p>
        ) : (
          <div className="space-y-2">
            {bonded.map((l, i) => (
              <div
                key={l.id}
                className="flex items-center justify-between border border-vw-cyan/10 bg-vw-dark/50 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold neon-cyan">
                    #{i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {l.tokenName}{" "}
                      <span className="text-vw-purple/40">${l.tokenTicker}</span>
                    </p>
                    <p className="text-xs text-vw-purple/30">
                      {truncateAddress(l.creatorWallet)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold neon-cyan">
                  +{l.solPayout} SOL
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dead on Arrival */}
      <div className="vw-card-pink p-5">
        <div className="mb-4 flex items-center gap-2">
          <Skull className="h-5 w-5 text-vw-hot" />
          <h3 className="text-base font-bold uppercase tracking-wider neon-pink">
            Dead on Arrival
          </h3>
        </div>
        {dead.length === 0 ? (
          <p className="py-6 text-center text-sm text-vw-purple/40">
            No dead bags yet. Give it time.
          </p>
        ) : (
          <div className="space-y-2">
            {dead.map((l, i) => (
              <div
                key={l.id}
                className="flex items-center justify-between border border-vw-hot/10 bg-vw-dark/50 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold neon-pink">
                    #{i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {l.tokenName}{" "}
                      <span className="text-vw-purple/40">${l.tokenTicker}</span>
                    </p>
                    <p className="text-xs text-vw-purple/30">
                      {truncateAddress(l.creatorWallet)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold neon-pink">RIP</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
