-- CreateTable
CREATE TABLE "barber_services" (
    "barberId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barber_services_pkey" PRIMARY KEY ("barberId","serviceId")
);

-- CreateIndex
CREATE INDEX "barber_services_barberId_idx" ON "barber_services"("barberId");

-- CreateIndex
CREATE INDEX "barber_services_serviceId_idx" ON "barber_services"("serviceId");

-- AddForeignKey
ALTER TABLE "barber_services" ADD CONSTRAINT "barber_services_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "barbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barber_services" ADD CONSTRAINT "barber_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
