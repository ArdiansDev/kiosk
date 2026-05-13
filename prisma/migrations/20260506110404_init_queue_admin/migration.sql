-- CreateTable
CREATE TABLE "QueueEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "queueDate" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "serviceTitle" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "ktp" TEXT,
    "customerId" TEXT,
    "address" TEXT,
    "detail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailyQueueCounter" (
    "queueDate" TEXT NOT NULL PRIMARY KEY,
    "lastSequence" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "QueueEntry_queueDate_createdAt_idx" ON "QueueEntry"("queueDate", "createdAt");

-- CreateIndex
CREATE INDEX "QueueEntry_createdAt_idx" ON "QueueEntry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QueueEntry_queueDate_sequence_key" ON "QueueEntry"("queueDate", "sequence");
