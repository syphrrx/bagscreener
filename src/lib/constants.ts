import { PublicKey } from "@solana/web3.js";

export const LISTING_COST_SOL = 1;
export const LISTING_COST_LAMPORTS = LISTING_COST_SOL * 1_000_000_000;

// Replace with your actual treasury wallet public key
export const TREASURY_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_TREASURY_WALLET || "11111111111111111111111111111111"
);

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

export const PUMP_FUN_API_URL = "https://frontend-api-v3.pump.fun/coins";

// Payout tiers based on bonding performance
export const PAYOUT_TIERS = [
  { minMultiple: 1, maxMultiple: 2, payout: 1.5 },
  { minMultiple: 2, maxMultiple: 5, payout: 3 },
  { minMultiple: 5, maxMultiple: Infinity, payout: 5 },
];

// How long (ms) before a listing is declared dead (48 hours)
export const LISTING_EXPIRY_MS = 48 * 60 * 60 * 1000;
