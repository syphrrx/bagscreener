export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchPumpFunCoin } from "@/lib/pumpfun";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Fetch pump.fun data
  const coin = await fetchPumpFunCoin(address);

  // Fetch our listing data
  const listing = await prisma.listing.findFirst({
    where: { tokenAddress: address },
    orderBy: { createdAt: "desc" },
  });

  if (!coin && !listing) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  return NextResponse.json({ coin, listing });
}
