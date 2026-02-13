"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PumpFunCoin {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  twitter: string | null;
  telegram: string | null;
  website: string | null;
  creator: string;
  created_timestamp: number;
  complete: boolean;
  raydium_pool: string | null;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: number;
  market_cap: number;
  usd_market_cap: number;
  reply_count: number;
  king_of_the_hill_timestamp: number | null;
}

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

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(2);
}

function formatSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(2);
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="text-vw-purple/40 hover:text-white transition">
      {copied ? <Check className="h-3.5 w-3.5 text-vw-cyan" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function TokenDetailPage() {
  const params = useParams();
  const address = params.address as string;

  const [coin, setCoin] = useState<PumpFunCoin | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/token/${address}`);
        if (!res.ok) {
          setError("Token not found");
          return;
        }
        const data = await res.json();
        setCoin(data.coin);
        setListing(data.listing);
      } catch {
        setError("Failed to load token data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [address]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-vw-purple/50 text-sm uppercase tracking-wider">Loading...</p>
      </div>
    );
  }

  if (error || (!coin && !listing)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-vw-hot text-sm">{error || "Token not found"}</p>
        <Link href="/" className="text-vw-purple/50 hover:text-white text-sm transition">
          <ArrowLeft className="inline h-4 w-4 mr-1" /> Back to feed
        </Link>
      </div>
    );
  }

  const name = coin?.name || listing?.tokenName || "Unknown";
  const symbol = coin?.symbol || listing?.tokenTicker || "???";
  const imageUrl = coin?.image_uri || listing?.imageUrl;
  const description = coin?.description || listing?.description;
  const bondingProgress = coin
    ? Math.min(1, coin.virtual_sol_reserves / (85 * 1_000_000_000))
    : 0;

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-vw-purple/20 bg-vw-dark/90 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-vw-purple/50 hover:text-white transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="h-8 w-8 object-cover flex-shrink-0" />
            ) : (
              <div className="h-8 w-8 flex items-center justify-center bg-vw-dark border border-vw-purple/20 text-sm font-bold text-vw-purple flex-shrink-0">
                {symbol.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white truncate">{name}</h1>
              <p className="text-xs text-vw-purple/50">${symbol}</p>
            </div>
          </div>
          {listing && (
            <span className={`ml-auto text-xs font-bold uppercase tracking-wider px-2 py-0.5 border ${
              listing.status === "live" ? "text-vw-yellow border-vw-yellow/30" :
              listing.status === "bonded" ? "text-vw-cyan border-vw-cyan/30" :
              "text-vw-hot border-vw-hot/30"
            }`}>
              {listing.status}
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left column: chart embed + description */}
          <div className="md:col-span-2 space-y-4">
            {/* Chart embed */}
            <div className="vw-card overflow-hidden">
              <iframe
                src={`https://birdeye.so/tv-widget/${address}?chain=solana&viewMode=pair&chartInterval=15&chartType=CANDLE&chartTimezone=UTC&chartLeftToolbar=show&theme=dark`}
                className="w-full h-[500px] border-0"
                title="Birdeye chart"
                allowFullScreen
              />
            </div>

            {/* Description */}
            {description && (
              <div className="vw-card p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-vw-purple/50 mb-2">Description</h3>
                <p className="text-sm text-vw-purple/70 whitespace-pre-wrap">{description}</p>
              </div>
            )}
          </div>

          {/* Right column: stats */}
          <div className="space-y-4">
            {/* Market data */}
            {coin && (
              <div className="vw-card p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-vw-purple/50">Market Data</h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-vw-purple/40">Market Cap</span>
                    <span className="text-sm font-bold text-white">${formatNumber(coin.usd_market_cap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-vw-purple/40">MC (SOL)</span>
                    <span className="text-sm font-bold text-white">{formatNumber(coin.market_cap)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-vw-purple/40">Virtual SOL Reserves</span>
                    <span className="text-sm font-bold text-white">{formatSol(coin.virtual_sol_reserves)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-vw-purple/40">Replies</span>
                    <span className="text-sm font-bold text-white">{coin.reply_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-vw-purple/40">Created</span>
                    <span className="text-sm font-bold text-white">{timeAgo(coin.created_timestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-vw-purple/40">Bonded</span>
                    <span className={`text-sm font-bold ${coin.complete ? "text-vw-cyan" : "text-vw-yellow"}`}>
                      {coin.complete ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {/* Bonding progress bar */}
                {!coin.complete && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-vw-purple/40">Bonding Progress</span>
                      <span className="text-xs text-vw-purple/50">{(bondingProgress * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-vw-dark border border-vw-purple/10">
                      <div
                        className="h-full bg-vw-cyan transition-all"
                        style={{ width: `${Math.min(100, bondingProgress * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Token info */}
            <div className="vw-card p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-vw-purple/50">Token Info</h3>

              <div className="space-y-2">
                <div>
                  <span className="text-xs text-vw-purple/40 block mb-0.5">Contract Address</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-vw-cyan break-all">{address}</code>
                    <CopyButton text={address} />
                  </div>
                </div>

                {coin?.creator && (
                  <div>
                    <span className="text-xs text-vw-purple/40 block mb-0.5">Creator</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-vw-purple/60">{truncateAddress(coin.creator)}</code>
                      <CopyButton text={coin.creator} />
                    </div>
                  </div>
                )}

                {listing?.creatorWallet && (
                  <div>
                    <span className="text-xs text-vw-purple/40 block mb-0.5">Listed By</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-vw-purple/60">{truncateAddress(listing.creatorWallet)}</code>
                      <CopyButton text={listing.creatorWallet} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Listing info */}
            {listing && (
              <div className="vw-card p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-vw-purple/50">Listing Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-vw-purple/40">SOL Paid</span>
                    <span className="text-sm font-bold text-white">{listing.solPaid} SOL</span>
                  </div>
                  {listing.solPayout && (
                    <div className="flex justify-between">
                      <span className="text-xs text-vw-purple/40">Payout</span>
                      <span className="text-sm font-bold neon-cyan">{listing.solPayout} SOL</span>
                    </div>
                  )}
                  {listing.botBuyTx && (
                    <div>
                      <span className="text-xs text-vw-purple/40 block mb-0.5">Bot Buy TX</span>
                      <a
                        href={`https://solscan.io/tx/${listing.botBuyTx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-vw-cyan hover:text-white transition"
                      >
                        {truncateAddress(listing.botBuyTx)} <ExternalLink className="inline h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="vw-card p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-vw-purple/50 mb-2">Links</h3>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://pump.fun/coin/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold uppercase tracking-wider text-vw-purple/40 hover:text-vw-pink transition flex items-center gap-1"
                >
                  Pump.fun <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={`https://solscan.io/token/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold uppercase tracking-wider text-vw-purple/40 hover:text-vw-pink transition flex items-center gap-1"
                >
                  Solscan <ExternalLink className="h-3 w-3" />
                </a>
                {coin?.twitter && (
                  <a
                    href={coin.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold uppercase tracking-wider text-vw-purple/40 hover:text-vw-pink transition flex items-center gap-1"
                  >
                    Twitter <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {coin?.telegram && (
                  <a
                    href={coin.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold uppercase tracking-wider text-vw-purple/40 hover:text-vw-pink transition flex items-center gap-1"
                  >
                    Telegram <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {coin?.website && (
                  <a
                    href={coin.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold uppercase tracking-wider text-vw-purple/40 hover:text-vw-pink transition flex items-center gap-1"
                  >
                    Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
