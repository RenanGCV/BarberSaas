-- AlterTable
ALTER TABLE "cash_flows" ADD COLUMN     "countedCash" DOUBLE PRECISION,
ADD COLUMN     "countedCredit" DOUBLE PRECISION,
ADD COLUMN     "countedDebit" DOUBLE PRECISION,
ADD COLUMN     "countedPix" DOUBLE PRECISION,
ADD COLUMN     "expectedCash" DOUBLE PRECISION,
ADD COLUMN     "expectedCredit" DOUBLE PRECISION,
ADD COLUMN     "expectedDebit" DOUBLE PRECISION,
ADD COLUMN     "expectedPix" DOUBLE PRECISION,
ADD COLUMN     "observations" TEXT;
