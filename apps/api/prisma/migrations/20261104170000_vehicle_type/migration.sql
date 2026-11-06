-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'MOTORCYCLE', 'ATV', 'OTHER');

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN "type" "VehicleType" NOT NULL DEFAULT 'CAR';
