export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [total, live, bonded, dead] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "live" } }),
    prisma.listing.count({ where: { status: "bonded" } }),
    prisma.listing.count({ where: { status: "dead" } }),
  ]);

  const totalSolCollected = await prisma.listing.aggregate({
    _sum: { solPaid: true },
  });

  const totalSolPaidOut = await prisma.listing.aggregate({
    where: { status: "bonded" },
    _sum: { solPayout: true },
  });

  return NextResponse.json({
    total,
    live,
    bonded,
    dead,
    solCollected: totalSolCollected._sum.solPaid || 0,
    solPaidOut: totalSolPaidOut._sum.solPayout || 0,
    solRetained: (totalSolCollected._sum.solPaid || 0) - (totalSolPaidOut._sum.solPayout || 0),
  });
}
