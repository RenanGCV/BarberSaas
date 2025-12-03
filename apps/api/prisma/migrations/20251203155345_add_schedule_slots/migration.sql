/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `schedules` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantId,barberId,scheduledAt]` on the table `schedules` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `scheduledAt` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "dayOfWeek",
DROP COLUMN "endTime",
DROP COLUMN "isActive",
DROP COLUMN "startTime",
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduledAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "schedules_tenantId_idx" ON "schedules"("tenantId");

-- CreateIndex
CREATE INDEX "schedules_scheduledAt_idx" ON "schedules"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_tenantId_barberId_scheduledAt_key" ON "schedules"("tenantId", "barberId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
