"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-vw-purple/20 bg-vw-dark/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Image src="/logoo.png" alt="Bagscreener" width={32} height={32} className="h-8 w-8" />
          <h1 className="text-xl font-bold tracking-tight">
            <span className="neon-pink">bag</span>
            <span className="neon-cyan">screener</span>
          </h1>
          <div className="hidden items-center gap-2 ml-4 md:flex">
            <span className="text-xs font-bold uppercase tracking-wider neon-pink">CA:</span>
            <code
              className="cursor-pointer border border-vw-pink/20 bg-vw-dark/80 px-2 py-0.5 text-xs font-bold text-vw-pink/70 transition hover:text-vw-cyan select-all"
              onClick={() => {
                const ca = process.env.NEXT_PUBLIC_PRODUCT_CA || "";
                if (ca) navigator.clipboard.writeText(ca);
              }}
              title="Click to copy"
            >
              {process.env.NEXT_PUBLIC_PRODUCT_CA || "SOON"}
            </code>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-bold uppercase tracking-wider text-vw-purple/60 md:flex">
          <a href="#feed" className="transition hover:text-vw-pink">
            Feed
          </a>
          <a href="#leaderboard" className="transition hover:text-vw-pink">
            Leaderboard
          </a>
        </nav>
      </div>
    </header>
  );
}
