-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "tokenTicker" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "creatorWallet" TEXT NOT NULL,
    "txSignature" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "solPaid" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "solPayout" DOUBLE PRECISION,
    "payoutTx" TEXT,
    "botBuyTx" TEXT,
    "botSellTx" TEXT,
    "botBuyAmount" DOUBLE PRECISION,
    "bondingProgress" DOUBLE PRECISION,
    "bondedAt" TIMESTAMP(3),
    "diedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_txSignature_key" ON "Listing"("txSignature");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_creatorWallet_idx" ON "Listing"("creatorWallet");

-- CreateIndex
CREATE INDEX "Listing_tokenAddress_idx" ON "Listing"("tokenAddress");
