-- CreateEnum
CREATE TYPE "EventActor" AS ENUM ('CLIENT', 'ADMIN', 'SYSTEM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RequestStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "RequestStatus" ADD VALUE 'REJECTED';
ALTER TYPE "RequestStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "PlanRequest" ADD COLUMN     "holdExpiresAt" TIMESTAMP(3),
ADD COLUMN     "unitPrice" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "PlanRequestEvent" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "fromStatus" "RequestStatus",
    "toStatus" "RequestStatus" NOT NULL,
    "note" TEXT,
    "actor" "EventActor" NOT NULL,
    "actorId" INTEGER,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanRequestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanRequestEvent_requestId_createdAt_idx" ON "PlanRequestEvent"("requestId", "createdAt");

-- AddForeignKey
ALTER TABLE "PlanRequestEvent" ADD CONSTRAINT "PlanRequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PlanRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanRequestEvent" ADD CONSTRAINT "PlanRequestEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: las solicitudes en curso empiezan a apartar cupo (72 h desde ahora).
UPDATE "PlanRequest"
SET "holdExpiresAt" = CURRENT_TIMESTAMP + INTERVAL '72 hours'
WHERE "status" IN ('PENDING', 'CONTACTED');

-- Backfill: precio por persona del plan como referencia para reportes.
UPDATE "PlanRequest" r
SET "unitPrice" = p."price"
FROM "Plan" p
WHERE r."planId" = p."id";

-- Backfill: evento inicial de cada solicitud existente (creación → estado actual).
INSERT INTO "PlanRequestEvent" ("requestId", "fromStatus", "toStatus", "actor", "actorId", "createdAt")
SELECT "id", NULL, "status", 'CLIENT', "userId", "createdAt"
FROM "PlanRequest";
