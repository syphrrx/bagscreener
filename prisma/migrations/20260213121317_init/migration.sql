-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenAddress" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "tokenTicker" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "creatorWallet" TEXT NOT NULL,
    "txSignature" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "solPaid" REAL NOT NULL DEFAULT 1.0,
    "solPayout" REAL,
    "payoutTx" TEXT,
    "bondedAt" DATETIME,
    "diedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_txSignature_key" ON "Listing"("txSignature");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_creatorWallet_idx" ON "Listing"("creatorWallet");

-- CreateIndex
CREATE INDEX "Listing_tokenAddress_idx" ON "Listing"("tokenAddress");
