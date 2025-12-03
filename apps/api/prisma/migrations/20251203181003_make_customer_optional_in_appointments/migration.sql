/*
  Warnings:

  - You are about to drop the column `isBlocked` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `dayOfWeek` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_customerId_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_tenantId_fkey";

-- DropIndex
DROP INDEX "schedules_scheduledAt_idx";

-- DropIndex
DROP INDEX "schedules_tenantId_barberId_scheduledAt_key";

-- DropIndex
DROP INDEX "schedules_tenantId_idx";

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "customerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "isBlocked",
DROP COLUMN "scheduledAt",
DROP COLUMN "tenantId",
ADD COLUMN     "dayOfWeek" INTEGER NOT NULL,
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startTime" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
