-- CreateEnum
CREATE TYPE "AvailabilityMode" AS ENUM ('EXCLUSIVE', 'CAPACITY');

-- CreateEnum
CREATE TYPE "BookingMode" AS ENUM ('SINGLE_DAY', 'DATE_RANGE');

-- AlterTable
ALTER TABLE "Plan"
    ADD COLUMN "availabilityMode" "AvailabilityMode" NOT NULL DEFAULT 'EXCLUSIVE',
    ADD COLUMN "capacity" INTEGER,
    ADD COLUMN "bookingMode" "BookingMode" NOT NULL DEFAULT 'SINGLE_DAY',
    ADD COLUMN "bookingsOpen" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PlanRequest" ADD COLUMN "endDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "PlanRequest_planId_status_travelDate_idx" ON "PlanRequest"("planId", "status", "travelDate");

-- CreateTable
CREATE TABLE "PlanBlackout" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanBlackout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanBlackout_planId_startDate_idx" ON "PlanBlackout"("planId", "startDate");

-- AddForeignKey
ALTER TABLE "PlanBlackout" ADD CONSTRAINT "PlanBlackout_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
