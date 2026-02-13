"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-vw-purple/20 bg-vw-dark/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1">
          <Image src="/logoo.png" alt="Bagscreener" width={32} height={32} className="h-8 w-8" />
          <h1 className="text-xl font-bold tracking-tight">
            <span className="neon-pink">bag</span>
            <span style={{ color: "#B06AFF" }}>screener</span>
          </h1>
          <div className="hidden items-center gap-2 ml-4 md:flex">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#B06AFF" }}>CA:</span>
            <code
              className="cursor-pointer border bg-vw-dark/80 px-2 py-0.5 text-xs font-bold transition hover:text-vw-cyan select-all"
              style={{ borderColor: "rgba(176, 106, 255, 0.2)", color: "rgba(176, 106, 255, 0.7)" }}
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
          <a
            href="https://x.com/bagscreeners"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-white"
            title="Follow us on X"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
}
