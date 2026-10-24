-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ADVISOR', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('PERSONAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "CatalogItemType" AS ENUM ('SERVICE', 'PART');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('RECEIVED', 'DIAGNOSING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AuthorizationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADVISOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "type" "ClientType" NOT NULL DEFAULT 'PERSONAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "current_client_id" UUID NOT NULL,
    "plate" TEXT NOT NULL,
    "vin" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" UUID NOT NULL,
    "type" "CatalogItemType" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'unidad',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "technician_id" UUID,
    "created_by_id" UUID NOT NULL,
    "report_approved_by_id" UUID,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'RECEIVED',
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'MEDIUM',
    "complaint" TEXT NOT NULL,
    "diagnosis" TEXT,
    "notes" TEXT,
    "mileage_in" INTEGER NOT NULL,
    "mileage_out" INTEGER,
    "estimated_delivery" DATE,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "delivery_report_draft" TEXT,
    "approved_report_snapshot" TEXT,
    "report_approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_items" (
    "id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "catalog_item_id" UUID,
    "type" "CatalogItemType" NOT NULL,
    "name_snapshot" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "authorization_status" "AuthorizationStatus" NOT NULL DEFAULT 'PENDING',
    "authorized_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_events" (
    "id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "from_value" JSONB,
    "to_value" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_events" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "from_value" JSONB,
    "to_value" JSONB,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");

-- CreateIndex
CREATE INDEX "vehicles_current_client_id_idx" ON "vehicles"("current_client_id");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_items_code_key" ON "catalog_items"("code");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_number_key" ON "work_orders"("number");

-- CreateIndex
CREATE INDEX "work_orders_status_created_at_idx" ON "work_orders"("status", "created_at");

-- CreateIndex
CREATE INDEX "work_orders_vehicle_id_created_at_idx" ON "work_orders"("vehicle_id", "created_at");

-- CreateIndex
CREATE INDEX "work_order_events_work_order_id_created_at_idx" ON "work_order_events"("work_order_id", "created_at");

-- CreateIndex
CREATE INDEX "vehicle_events_vehicle_id_created_at_idx" ON "vehicle_events"("vehicle_id", "created_at");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_current_client_id_fkey" FOREIGN KEY ("current_client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_report_approved_by_id_fkey" FOREIGN KEY ("report_approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_items" ADD CONSTRAINT "work_order_items_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_items" ADD CONSTRAINT "work_order_items_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_events" ADD CONSTRAINT "work_order_events_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_events" ADD CONSTRAINT "work_order_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_events" ADD CONSTRAINT "vehicle_events_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_events" ADD CONSTRAINT "vehicle_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
