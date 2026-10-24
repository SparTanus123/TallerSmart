-- CreateTable
CREATE TABLE "intake_photos" (
    "id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intake_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "intake_photos_storage_key_key" ON "intake_photos"("storage_key");

-- CreateIndex
CREATE INDEX "intake_photos_work_order_id_created_at_idx" ON "intake_photos"("work_order_id", "created_at");

-- AddForeignKey
ALTER TABLE "intake_photos" ADD CONSTRAINT "intake_photos_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
