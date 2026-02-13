import { PUMP_FUN_API_URL } from "./constants";

export interface PumpFunCoin {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  metadata_uri: string;
  twitter: string | null;
  telegram: string | null;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  created_timestamp: number;
  raydium_pool: string | null;
  complete: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: number;
  website: string | null;
  show_name: boolean;
  king_of_the_hill_timestamp: number | null;
  market_cap: number;
  reply_count: number;
  last_reply: number | null;
  nsfw: boolean;
  market_id: string | null;
  inverted: boolean | null;
  usd_market_cap: number;
}

export async function fetchPumpFunCoin(
  tokenAddress: string
): Promise<PumpFunCoin | null> {
  try {
    const res = await fetch(`${PUMP_FUN_API_URL}/${tokenAddress}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PumpFunCoin;
  } catch {
    return null;
  }
}

export function isBonded(coin: PumpFunCoin): boolean {
  // A pump.fun token is "bonded" when it completes its bonding curve
  // and migrates to Raydium (raydium_pool is set, or complete is true)
  return coin.complete === true || (coin.raydium_pool != null && coin.raydium_pool !== "");
}
