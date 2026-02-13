"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import ListingForm from "./ListingForm";
import TokenFeed from "./TokenFeed";
import StatsBar from "./StatsBar";
import Leaderboard from "./Leaderboard";
import BondChecker from "./BondChecker";

const multipliers = ["5x", "3x", "2x", "6x", "10x", "4x", "8x", "7x"];

function AnimatedMultiplier() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % multipliers.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block min-w-[3ch] neon-cyan font-black transition-all duration-300">
      {multipliers[index]}
    </span>
  );
}

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen">
      <Header />
      <BondChecker />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <section className="mb-12 text-center">
          <h2 className="text-4xl font-black uppercase tracking-wider sm:text-5xl">
            <span className="gradient-text">Put your bags where</span>
            <br />
            <span className="neon-pink">your mouth is.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm uppercase tracking-wider text-vw-purple/50">
            Pay 1 SOL to list your token. If it bonds, you get rewarded{" "}
            <AnimatedMultiplier />
          </p>
          <div className="mx-auto mt-6 h-px w-48 bg-gradient-to-r from-transparent via-vw-pink to-transparent" />
        </section>

        {/* Stats */}
        <section className="mb-8">
          <StatsBar />
        </section>

        {/* Listing Form */}
        <section className="mb-10">
          <ListingForm onSuccess={() => setRefreshKey((k) => k + 1)} />
        </section>

        {/* Feed */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold uppercase tracking-wider neon-purple">
            Latest Bags
          </h2>
          <TokenFeed refreshKey={refreshKey} />
        </section>

        {/* Leaderboard */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold uppercase tracking-wider neon-purple">
            Leaderboard
          </h2>
          <Leaderboard />
        </section>

        {/* CA Box */}
        <section className="mt-12 flex items-center justify-center gap-3">
          <span className="text-sm font-bold uppercase tracking-wider neon-pink">CA:</span>
          <div className="vw-card-pink flex items-center gap-2 px-4 py-2">
            <code className="text-sm font-bold text-vw-pink/80 select-all">
              {process.env.NEXT_PUBLIC_PRODUCT_CA || "SOON"}
            </code>
            <button
              onClick={() => {
                const ca = process.env.NEXT_PUBLIC_PRODUCT_CA || "";
                if (ca) navigator.clipboard.writeText(ca);
              }}
              className="text-xs text-vw-purple/40 transition hover:text-vw-cyan"
              title="Copy CA"
            >
              [copy]
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-vw-purple/10 pb-8 pt-8 text-center">
          <p className="text-sm text-vw-purple/30">
            Bagscreener isn&apos;t here to tell you what&apos;s good.
          </p>
          <p className="mt-1 text-sm font-bold neon-purple">
            It&apos;s here to show you who actually believed.
          </p>
          <p className="mt-4 text-xs uppercase tracking-widest text-vw-purple/20">
            vaporwave by design &middot; 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
