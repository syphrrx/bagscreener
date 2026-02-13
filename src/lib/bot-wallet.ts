import { Keypair, Connection } from "@solana/web3.js";
import bs58 from "bs58";

let _botKeypair: Keypair | null = null;

export function getBotKeypair(): Keypair {
  if (_botKeypair) return _botKeypair;

  const privateKey = process.env.BOT_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("BOT_WALLET_PRIVATE_KEY environment variable is not set");
  }

  try {
    // Support both base58 and JSON array formats
    if (privateKey.startsWith("[")) {
      const secretKey = Uint8Array.from(JSON.parse(privateKey));
      _botKeypair = Keypair.fromSecretKey(secretKey);
    } else {
      const secretKey = bs58.decode(privateKey);
      _botKeypair = Keypair.fromSecretKey(secretKey);
    }
  } catch (err) {
    throw new Error(`Failed to parse BOT_WALLET_PRIVATE_KEY: ${err}`);
  }

  return _botKeypair;
}

export function getBotConnection(): Connection {
  const rpcUrl =
    process.env.SOLANA_RPC_URL ||
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    "https://api.mainnet-beta.solana.com";
  return new Connection(rpcUrl, "confirmed");
}
