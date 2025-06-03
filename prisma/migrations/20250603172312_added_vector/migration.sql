-- CreateTable
CREATE TABLE "ChunkNode" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "startChar" INTEGER NOT NULL,
    "endChar" INTEGER NOT NULL,
    "embedding" vector,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summaryId" TEXT,

    CONSTRAINT "ChunkNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SummaryNode" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "SummaryNode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChunkNode" ADD CONSTRAINT "ChunkNode_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "SummaryNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryNode" ADD CONSTRAINT "SummaryNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SummaryNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
