import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Connection } from "@solana/web3.js";
import { SOLANA_RPC_URL, LISTING_COST_LAMPORTS, TREASURY_WALLET } from "@/lib/constants";
import { fetchPumpFunCoin } from "@/lib/pumpfun";
import { buyToken, BUY_AMOUNT_SOL } from "@/lib/pump-trade";
import { getBotKeypair } from "@/lib/bot-wallet";

/**
 * Full flow after a listing is created:
 * 1. Treasury wallet received 1 SOL from the user
 * 2. Forward ~0.95 SOL from treasury to bot wallet
 * 3. Bot wallet buys the token (the CA the user entered)
 * 4. Bond checker will later sell once bonding is detected
 */
async function triggerBotBuy(listingId: string, tokenAddress: string) {
  try {
    // Step 1: Forward SOL from treasury to bot wallet
    const botPubkey = getBotKeypair().publicKey.toBase58();
    console.log(`[BOT] Forwarding ${BUY_AMOUNT_SOL} SOL to bot wallet ${botPubkey} for ${tokenAddress}`);

    // Note: The treasury wallet forwarding is done manually or via a separate process.
    // The bot wallet should be pre-funded. In production, you'd automate this with
    // the treasury wallet's private key. For now, the bot wallet needs to have SOL.

    // Step 2: Bot buys the token using the CA the user entered
    const result = await buyToken(tokenAddress);
    if (result.success) {
      await prisma.listing.update({
        where: { id: listingId },
        data: {
          botBuyTx: result.signature,
          botBuyAmount: BUY_AMOUNT_SOL,
        },
      });
      console.log(`[BOT] Bought ${tokenAddress} for listing ${listingId}: ${result.signature}`);
    } else {
      console.error(`[BOT] Buy failed for ${tokenAddress}:`, result.error);
    }
  } catch (err: unknown) {
    console.error(`[BOT] triggerBotBuy error:`, err);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const wallet = searchParams.get("wallet");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (wallet) where.creatorWallet = wallet;

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
  });

  return NextResponse.json(listings);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenAddress, tokenName, tokenTicker, description, creatorWallet, txSignature } = body;

    if (!tokenAddress || !tokenName || !tokenTicker || !creatorWallet || !txSignature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if this tx signature was already used
    const existing = await prisma.listing.findUnique({ where: { txSignature } });
    if (existing) {
      return NextResponse.json({ error: "Transaction already used for a listing" }, { status: 409 });
    }

    // Verify the transaction on-chain
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const tx = await connection.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found. Please wait a moment and try again." }, { status: 404 });
    }

    if (tx.meta?.err) {
      return NextResponse.json({ error: "Transaction failed on-chain" }, { status: 400 });
    }

    // Verify the transfer: check that SOL was sent to treasury
    const preBalances = tx.meta?.preBalances || [];
    const postBalances = tx.meta?.postBalances || [];
    const accountKeys = tx.transaction.message.accountKeys;

    let treasuryIdx = -1;
    for (let i = 0; i < accountKeys.length; i++) {
      if (accountKeys[i].pubkey.toBase58() === TREASURY_WALLET.toBase58()) {
        treasuryIdx = i;
        break;
      }
    }

    if (treasuryIdx === -1) {
      return NextResponse.json({ error: "Treasury wallet not found in transaction" }, { status: 400 });
    }

    const received = postBalances[treasuryIdx] - preBalances[treasuryIdx];
    if (received < LISTING_COST_LAMPORTS) {
      return NextResponse.json(
        { error: `Insufficient payment. Expected ${LISTING_COST_LAMPORTS} lamports, got ${received}` },
        { status: 400 }
      );
    }

    // Try to fetch token info from pump.fun for the image
    let imageUrl: string | null = null;
    const coinData = await fetchPumpFunCoin(tokenAddress);
    if (coinData) {
      imageUrl = coinData.image_uri || null;
    }

    // Create the listing
    const listing = await prisma.listing.create({
      data: {
        tokenAddress,
        tokenName,
        tokenTicker,
        description: description || null,
        imageUrl,
        creatorWallet,
        txSignature,
        status: "live",
        solPaid: 1.0,
      },
    });

    // Trigger bot buy in the background (don't block the response)
    triggerBotBuy(listing.id, tokenAddress).catch((err: unknown) =>
      console.error("[BOT] Background buy trigger failed:", err)
    );

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
