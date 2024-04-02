ALTER TABLE "purchaseOrderLine" ADD COLUMN "conversionFactor" NUMERIC(10, 2) DEFAULT 1;
ALTER TABLE "purchaseOrderLine" ADD COLUMN "inventoryUnitOfMeasureCode" TEXT REFERENCES "unitOfMeasure" ("code");
ALTER TABLE "purchaseOrderLine" ADD COLUMN "purchaseUnitOfMeasureCode" TEXT REFERENCES "unitOfMeasure" ("code");

ALTER TABLE "partSupplier" ADD COLUMN "unitPrice" NUMERIC(10, 2) DEFAULT 0;
