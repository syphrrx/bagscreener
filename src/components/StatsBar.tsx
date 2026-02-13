"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Skull, Flame, Coins } from "lucide-react";

interface Stats {
  total: number;
  live: number;
  bonded: number;
  dead: number;
  solCollected: number;
  solPaidOut: number;
  solRetained: number;
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/listings/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) return null;

  const items = [
    {
      label: "Total Listed",
      value: stats.total,
      icon: <Coins className="h-4 w-4 text-vw-cyan" />,
      glow: "neon-cyan",
    },
    {
      label: "Live",
      value: stats.live,
      icon: <Flame className="h-4 w-4 text-vw-yellow" />,
      glow: "",
    },
    {
      label: "Bonded",
      value: stats.bonded,
      icon: <TrendingUp className="h-4 w-4 text-vw-cyan" />,
      glow: "neon-cyan",
    },
    {
      label: "Dead",
      value: stats.dead,
      icon: <Skull className="h-4 w-4 text-vw-hot" />,
      glow: "neon-pink",
    },
    {
      label: "SOL Paid Out",
      value: `${stats.solPaidOut.toFixed(1)}`,
      icon: <Coins className="h-4 w-4 text-vw-purple" />,
      glow: "neon-purple",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="vw-card px-4 py-3">
          <div className="flex items-center gap-3">
            {item.icon}
            <div>
              <p className={`text-lg font-bold ${item.glow || "text-vw-yellow"}`}>
                {item.value}
              </p>
              <p className="text-xs uppercase tracking-wider text-vw-purple/50">
                {item.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
