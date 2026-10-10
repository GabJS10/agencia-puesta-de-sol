-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "maxDays" INTEGER,
ADD COLUMN     "minDays" INTEGER;

-- Backfill: los planes por rango existentes no quedan sin límite.
UPDATE "Plan" SET "minDays" = 2, "maxDays" = 7 WHERE "bookingMode" = 'DATE_RANGE';
