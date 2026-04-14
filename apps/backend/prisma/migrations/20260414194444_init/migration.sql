/*
  Warnings:

  - You are about to alter the column `name` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `serialNumber` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The `status` column on the `Asset` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `category` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('Operational', 'Breakdown', 'UnderMaintenance');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('Corrective', 'Preventive', 'Predictive');

-- CreateEnum
CREATE TYPE "FrequencyType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('DueDate', 'Overdue');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "brand" VARCHAR(100),
ADD COLUMN     "category" VARCHAR(50) NOT NULL,
ADD COLUMN     "location" VARCHAR(255),
ADD COLUMN     "manualFileUrl" TEXT,
ADD COLUMN     "purchaseDate" TIMESTAMP(3),
ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "sopFileUrl" TEXT,
ADD COLUMN     "warrantyEnd" TIMESTAMP(3),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "serialNumber" SET DATA TYPE VARCHAR(100),
DROP COLUMN "status",
ADD COLUMN     "status" "AssetStatus" NOT NULL DEFAULT 'Operational';

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "description" TEXT NOT NULL,
    "technicianName" VARCHAR(100) NOT NULL,
    "maintenanceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "downtimeHours" DOUBLE PRECISION,
    "partsUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SparePart" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "partNumber" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "minStockLevel" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION,
    "supplier" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SparePart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSparePart" (
    "id" TEXT NOT NULL,
    "maintenanceLogId" TEXT NOT NULL,
    "sparePartId" TEXT NOT NULL,
    "quantityUsed" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "MaintenanceSparePart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "frequencyType" "FrequencyType" NOT NULL,
    "frequencyValue" INTEGER,
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "lastExecutedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isOverdue" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceAlert" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "alertDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "alertType" "AlertType" NOT NULL DEFAULT 'DueDate',

    CONSTRAINT "MaintenanceAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MaintenanceLog_assetId_idx" ON "MaintenanceLog"("assetId");

-- CreateIndex
CREATE INDEX "MaintenanceLog_maintenanceDate_idx" ON "MaintenanceLog"("maintenanceDate");

-- CreateIndex
CREATE INDEX "MaintenanceLog_type_idx" ON "MaintenanceLog"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SparePart_partNumber_key" ON "SparePart"("partNumber");

-- CreateIndex
CREATE INDEX "SparePart_partNumber_idx" ON "SparePart"("partNumber");

-- CreateIndex
CREATE INDEX "SparePart_name_idx" ON "SparePart"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceSparePart_maintenanceLogId_sparePartId_key" ON "MaintenanceSparePart"("maintenanceLogId", "sparePartId");

-- CreateIndex
CREATE INDEX "Schedule_assetId_idx" ON "Schedule"("assetId");

-- CreateIndex
CREATE INDEX "Schedule_nextDueDate_idx" ON "Schedule"("nextDueDate");

-- CreateIndex
CREATE INDEX "Schedule_isActive_isOverdue_idx" ON "Schedule"("isActive", "isOverdue");

-- CreateIndex
CREATE INDEX "MaintenanceAlert_scheduleId_idx" ON "MaintenanceAlert"("scheduleId");

-- CreateIndex
CREATE INDEX "MaintenanceAlert_alertDate_idx" ON "MaintenanceAlert"("alertDate");

-- CreateIndex
CREATE INDEX "MaintenanceAlert_isRead_idx" ON "MaintenanceAlert"("isRead");

-- CreateIndex
CREATE INDEX "Asset_serialNumber_idx" ON "Asset"("serialNumber");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "Asset_category_idx" ON "Asset"("category");

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSparePart" ADD CONSTRAINT "MaintenanceSparePart_maintenanceLogId_fkey" FOREIGN KEY ("maintenanceLogId") REFERENCES "MaintenanceLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSparePart" ADD CONSTRAINT "MaintenanceSparePart_sparePartId_fkey" FOREIGN KEY ("sparePartId") REFERENCES "SparePart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAlert" ADD CONSTRAINT "MaintenanceAlert_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAlert" ADD CONSTRAINT "MaintenanceAlert_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
