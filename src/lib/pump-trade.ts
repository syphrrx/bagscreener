import { VersionedTransaction, Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getBotKeypair, getBotConnection } from "./bot-wallet";

const PUMPPORTAL_API = "https://pumpportal.fun/api/trade-local";

// How much of the 1 SOL listing fee to use for buying the token
// Treasury keeps ~0.05 SOL for fees, forwards the rest to bot wallet for buying
export const BUY_AMOUNT_SOL = 0.95;
const SLIPPAGE = 25; // 25% slippage tolerance
const PRIORITY_FEE = 0.001; // SOL

interface TradeResult {
  success: boolean;
  signature?: string;
  error?: string;
}

/**
 * Buy a token on pump.fun using the bot wallet
 */
export async function buyToken(mintAddress: string): Promise<TradeResult> {
  try {
    const botKeypair = getBotKeypair();
    const connection = getBotConnection();

    const response = await fetch(PUMPPORTAL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: botKeypair.publicKey.toBase58(),
        action: "buy",
        mint: mintAddress,
        denominatedInSol: "true",
        amount: BUY_AMOUNT_SOL,
        slippage: SLIPPAGE,
        priorityFee: PRIORITY_FEE,
        pool: "pump",
      }),
    });

    if (response.status !== 200) {
      const errText = await response.text();
      return { success: false, error: `PumpPortal buy error: ${errText}` };
    }

    const data = await response.arrayBuffer();
    const tx = VersionedTransaction.deserialize(new Uint8Array(data));
    tx.sign([botKeypair]);

    const signature = await connection.sendTransaction(tx, {
      skipPreflight: false,
      maxRetries: 3,
    });

    // Wait for confirmation
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      { signature, ...latestBlockhash },
      "confirmed"
    );

    console.log(`[BOT] Bought token ${mintAddress}: ${signature}`);
    return { success: true, signature };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[BOT] Buy failed for ${mintAddress}:`, msg);
    return { success: false, error: msg };
  }
}

/**
 * Sell all of a token on pump.fun using the bot wallet
 */
export async function sellToken(mintAddress: string): Promise<TradeResult> {
  try {
    const botKeypair = getBotKeypair();
    const connection = getBotConnection();

    const response = await fetch(PUMPPORTAL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: botKeypair.publicKey.toBase58(),
        action: "sell",
        mint: mintAddress,
        denominatedInSol: "false",
        amount: "100%", // Sell all tokens
        slippage: SLIPPAGE,
        priorityFee: PRIORITY_FEE,
        pool: "pump",
      }),
    });

    if (response.status !== 200) {
      const errText = await response.text();
      return { success: false, error: `PumpPortal sell error: ${errText}` };
    }

    const data = await response.arrayBuffer();
    const tx = VersionedTransaction.deserialize(new Uint8Array(data));
    tx.sign([botKeypair]);

    const signature = await connection.sendTransaction(tx, {
      skipPreflight: false,
      maxRetries: 3,
    });

    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      { signature, ...latestBlockhash },
      "confirmed"
    );

    console.log(`[BOT] Sold token ${mintAddress}: ${signature}`);
    return { success: true, signature };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[BOT] Sell failed for ${mintAddress}:`, msg);
    return { success: false, error: msg };
  }
}

/**
 * Transfer SOL from bot wallet to a recipient
 */
export async function transferSol(
  recipientAddress: string,
  amountSol: number
): Promise<TradeResult> {
  try {
    const botKeypair = getBotKeypair();
    const connection = getBotConnection();

    const { SystemProgram, Transaction } = await import("@solana/web3.js");

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: botKeypair.publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: Math.floor(amountSol * LAMPORTS_PER_SOL),
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = botKeypair.publicKey;
    transaction.sign(botKeypair);

    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      { skipPreflight: false, maxRetries: 3 }
    );

    await connection.confirmTransaction(signature, "confirmed");

    console.log(`[BOT] Transferred ${amountSol} SOL to ${recipientAddress}: ${signature}`);
    return { success: true, signature };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[BOT] Transfer failed:`, msg);
    return { success: false, error: msg };
  }
}

/**
 * Calculate bonding curve progress (0 to 1).
 * pump.fun starts with ~1B virtual tokens and ~30 SOL virtual reserves.
 * As people buy, virtual_token_reserves decreases and virtual_sol_reserves increases.
 * The curve completes when virtual_sol_reserves reaches ~115 SOL (complete=true).
 */
export function getBondingProgress(coin: {
  virtual_sol_reserves: number;
  complete: boolean;
}): number {
  if (coin.complete) return 1.0;

  // pump.fun bonding curve: starts at ~30 SOL virtual, completes at ~115 SOL virtual
  const INITIAL_VIRTUAL_SOL = 30_000_000_000; // 30 SOL in lamports
  const FINAL_VIRTUAL_SOL = 115_000_000_000; // ~115 SOL in lamports
  const range = FINAL_VIRTUAL_SOL - INITIAL_VIRTUAL_SOL;

  const progress = (coin.virtual_sol_reserves - INITIAL_VIRTUAL_SOL) / range;
  return Math.max(0, Math.min(1, progress));
}

/**
 * Get the bot wallet's SOL balance
 */
export async function getBotBalance(): Promise<number> {
  const botKeypair = getBotKeypair();
  const connection = getBotConnection();
  const balance = await connection.getBalance(botKeypair.publicKey);
  return balance / LAMPORTS_PER_SOL;
}
