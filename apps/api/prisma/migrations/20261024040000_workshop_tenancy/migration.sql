CREATE TABLE "workshops" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);
INSERT INTO "workshops" ("id", "name") VALUES ('00000000-0000-4000-8000-000000000000', 'Taller principal');
ALTER TABLE "users" ADD COLUMN "workshop_id" UUID NOT NULL DEFAULT '00000000-0000-4000-8000-000000000000';
ALTER TABLE "clients" ADD COLUMN "workshop_id" UUID NOT NULL DEFAULT '00000000-0000-4000-8000-000000000000';
ALTER TABLE "vehicles" ADD COLUMN "workshop_id" UUID NOT NULL DEFAULT '00000000-0000-4000-8000-000000000000';
ALTER TABLE "catalog_items" ADD COLUMN "workshop_id" UUID NOT NULL DEFAULT '00000000-0000-4000-8000-000000000000';
ALTER TABLE "work_orders" ADD COLUMN "workshop_id" UUID NOT NULL DEFAULT '00000000-0000-4000-8000-000000000000';
ALTER TABLE "intake_photos" ADD COLUMN "workshop_id" UUID NOT NULL DEFAULT '00000000-0000-4000-8000-000000000000';
ALTER TABLE "work_order_items" ADD COLUMN "workshop_id" UUID NOT NULL DEFAULT '00000000-0000-4000-8000-000000000000';
ALTER TABLE "work_order_events" ADD COLUMN "workshop_id" UUID NOT NULL DEFAULT '00000000-0000-4000-8000-000000000000';
ALTER TABLE "vehicle_events" ADD COLUMN "workshop_id" UUID NOT NULL DEFAULT '00000000-0000-4000-8000-000000000000';
ALTER TABLE "users" ADD CONSTRAINT "users_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "clients" ADD CONSTRAINT "clients_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "intake_photos" ADD CONSTRAINT "intake_photos_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "work_order_items" ADD CONSTRAINT "work_order_items_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "work_order_events" ADD CONSTRAINT "work_order_events_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vehicle_events" ADD CONSTRAINT "vehicle_events_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "users_workshop_id_idx" ON "users"("workshop_id");
CREATE INDEX "clients_workshop_id_idx" ON "clients"("workshop_id");
CREATE INDEX "vehicles_workshop_id_idx" ON "vehicles"("workshop_id");
CREATE INDEX "catalog_items_workshop_id_idx" ON "catalog_items"("workshop_id");
CREATE INDEX "work_orders_workshop_id_idx" ON "work_orders"("workshop_id");
CREATE INDEX "intake_photos_workshop_id_idx" ON "intake_photos"("workshop_id");
CREATE INDEX "work_order_items_workshop_id_idx" ON "work_order_items"("workshop_id");
CREATE INDEX "work_order_events_workshop_id_idx" ON "work_order_events"("workshop_id");
CREATE INDEX "vehicle_events_workshop_id_idx" ON "vehicle_events"("workshop_id");
