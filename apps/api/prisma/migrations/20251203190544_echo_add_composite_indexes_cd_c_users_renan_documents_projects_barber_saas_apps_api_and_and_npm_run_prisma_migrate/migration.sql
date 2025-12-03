-- CreateIndex
CREATE INDEX "appointments_tenantId_scheduledAt_idx" ON "appointments"("tenantId", "scheduledAt");

-- CreateIndex
CREATE INDEX "appointments_barberId_scheduledAt_idx" ON "appointments"("barberId", "scheduledAt");
