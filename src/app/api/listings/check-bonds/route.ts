export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchPumpFunCoin, isBonded } from "@/lib/pumpfun";
import { LISTING_EXPIRY_MS } from "@/lib/constants";
import { sellToken, transferSol, getBondingProgress, getBotBalance } from "@/lib/pump-trade";

export async function POST() {
  try {
    const liveListings = await prisma.listing.findMany({
      where: { status: "live" },
    });

    const results = { checked: 0, bonded: 0, died: 0, errors: 0 };

    for (const listing of liveListings) {
      results.checked++;

      // Check if listing has expired (48h)
      const age = Date.now() - new Date(listing.createdAt).getTime();
      if (age > LISTING_EXPIRY_MS) {
        // Sell any remaining tokens before marking dead (recoup what we can)
        if (listing.botBuyTx && !listing.botSellTx) {
          const sellResult = await sellToken(listing.tokenAddress);
          if (sellResult.success) {
            await prisma.listing.update({
              where: { id: listing.id },
              data: { botSellTx: sellResult.signature },
            });
            console.log(`[BOT] Sold expired token ${listing.tokenAddress}`);
          }
        }

        await prisma.listing.update({
          where: { id: listing.id },
          data: { status: "dead", diedAt: new Date() },
        });
        results.died++;
        continue;
      }

      // Fetch current token data from pump.fun
      const coin = await fetchPumpFunCoin(listing.tokenAddress);
      if (!coin) continue;

      // Track bonding curve progress
      const progress = getBondingProgress(coin);
      await prisma.listing.update({
        where: { id: listing.id },
        data: { bondingProgress: progress },
      });

      // ONLY sell once the token has fully bonded (complete=true)
      if (isBonded(coin) && listing.botBuyTx && !listing.botSellTx) {
        console.log(`[BOT] Token ${listing.tokenAddress} BONDED — selling now`);

        // Sell all tokens
        const sellResult = await sellToken(listing.tokenAddress);
        let sellTx: string | null = null;
        if (sellResult.success) {
          sellTx = sellResult.signature || null;
          console.log(`[BOT] Sold ${listing.tokenAddress}: ${sellTx}`);
        } else {
          console.error(`[BOT] Sell failed for ${listing.tokenAddress}:`, sellResult.error);
          results.errors++;
        }

        // Transfer SOL proceeds back to the creator who listed the token
        const payoutResult = await payoutToCreator(listing);

        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            status: "bonded",
            bondedAt: new Date(),
            botSellTx: sellTx,
            solPayout: payoutResult.amount,
            payoutTx: payoutResult.signature || null,
          },
        });
        results.bonded++;
        continue;
      }

      // If bonded but bot never bought (e.g. seed data), just mark bonded
      if (isBonded(coin) && !listing.botBuyTx) {
        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            status: "bonded",
            bondedAt: new Date(),
            bondingProgress: 1.0,
          },
        });
        results.bonded++;
      }
    }

    return NextResponse.json({
      message: "Bond check complete",
      ...results,
    });
  } catch (error) {
    console.error("Error checking bonds:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * After selling the token, check the bot wallet balance and send
 * the SOL proceeds back to the listing creator.
 */
async function payoutToCreator(listing: {
  id: string;
  creatorWallet: string;
  botBuyAmount: number | null;
}): Promise<{ amount: number; signature?: string }> {
  try {
    // Get the bot wallet balance after the sell
    const botBalance = await getBotBalance();

    // Keep a small reserve (0.01 SOL) for future tx fees
    const reserve = 0.01;
    const buyAmount = listing.botBuyAmount || 0.95;

    // Send back the greater of: the buy amount, or available balance minus reserve
    // This way if the sell yielded more than the buy, the creator gets the profit
    const availableForPayout = Math.max(0, botBalance - reserve);
    const payoutAmount = Math.min(availableForPayout, Math.max(buyAmount, availableForPayout));

    if (payoutAmount <= 0.001) {
      console.error(`[BOT] Insufficient balance for payout: ${botBalance} SOL`);
      return { amount: 0 };
    }

    const result = await transferSol(listing.creatorWallet, payoutAmount);
    if (result.success) {
      console.log(
        `[BOT] Paid ${payoutAmount.toFixed(4)} SOL to ${listing.creatorWallet}: ${result.signature}`
      );
      return { amount: payoutAmount, signature: result.signature };
    } else {
      console.error(`[BOT] Payout transfer failed:`, result.error);
      return { amount: 0 };
    }
  } catch (err) {
    console.error(`[BOT] payoutToCreator error:`, err);
    return { amount: 0 };
  }
}
