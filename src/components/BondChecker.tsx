"use client";

import { useEffect } from "react";

const CHECK_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

export default function BondChecker() {
  useEffect(() => {
    const checkBonds = async () => {
      try {
        await fetch("/api/listings/check-bonds", { method: "POST" });
      } catch (err) {
        console.error("Bond check failed:", err);
      }
    };

    // Run immediately on mount
    checkBonds();

    // Then every 2 minutes
    const interval = setInterval(checkBonds, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // This component renders nothing — it just runs the poller
  return null;
}
