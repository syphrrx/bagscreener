import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PUMP_FUN_API = "https://frontend-api-v3.pump.fun/coins";

const TOKEN_ADDRESSES = [
  "6fTuQG4b3MsRcZUSZ4izaQkqz2KKTwvutd32vtQQpump",
  "puqAdNLwbb2o8jgNLXJh9xNQKFencfZbYuiaAbypump",
  "2TF3yXCDHyGLSsCsvWpnoAwSS1ScegT6PKdow8kypump",
  "BxQCxmQwMh8PPFSEPQzoeT8JNnj74sYHph2Ukvh9pump",
  "AVxZc4pu2r2DVx3HScFg3yQopJJD94V1GBT5TTampump",
];

async function main() {
  for (const address of TOKEN_ADDRESSES) {
    // Check if already exists
    const existing = await prisma.listing.findFirst({
      where: { tokenAddress: address },
    });
    if (existing) {
      console.log(`Skipping ${address} — already exists`);
      continue;
    }

    // Fetch from pump.fun
    let coin: any = null;
    try {
      const res = await fetch(`${PUMP_FUN_API}/${address}`);
      if (res.ok) coin = await res.json();
    } catch (e) {
      console.log(`Failed to fetch ${address} from pump.fun`);
    }

    const name = coin?.name || "Unknown";
    const symbol = coin?.symbol || "???";
    const description = coin?.description || null;
    const imageUrl = coin?.image_uri || null;
    const creator = coin?.creator || "AuULfhDFhnv1Z5XaGMRY3mJJDFjq9NeQbMFMGc3sMpKR";
    const isDead = coin ? (coin.complete === false && !coin.raydium_pool) : true;
    const isBonded = coin ? (coin.complete === true || !!coin.raydium_pool) : false;

    let status = "live";
    if (isBonded) status = "bonded";
    else if (isDead && coin?.market_cap < 5000) status = "dead";

    await prisma.listing.create({
      data: {
        tokenAddress: address,
        tokenName: name,
        tokenTicker: symbol,
        description,
        imageUrl,
        creatorWallet: creator,
        txSignature: `seed_${address}`,
        status,
        solPaid: 1.0,
        diedAt: status === "dead" ? new Date() : null,
        bondedAt: status === "bonded" ? new Date() : null,
      },
    });

    console.log(`Inserted ${name} ($${symbol}) — ${status}`);
  }

  console.log("Done seeding!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
