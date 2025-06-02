-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
