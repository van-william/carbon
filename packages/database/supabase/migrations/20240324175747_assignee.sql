ALTER TABLE "customer" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
ALTER TABLE "part" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
ALTER TABLE "purchaseOrder" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
ALTER TABLE "purchaseInvoice" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
-- ALTER TABLE "quote" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
-- ALTER TABLE "receipt" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
-- ALTER TABLE "requestForQuote" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
-- ALTER TABLE "service" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
ALTER TABLE "supplier" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;

DROP VIEW "customers";
CREATE OR REPLACE VIEW "customers" WITH(SECURITY_INVOKER=true) AS 
  SELECT 
    c.*,
    ct.name AS "type",
    cs.name AS "status"
  FROM "customer" c
  LEFT JOIN "customerType" ct ON ct.id = c."customerTypeId"
  LEFT JOIN "customerStatus" cs ON cs.id = c."customerStatusId";

DROP VIEW "parts";
CREATE OR REPLACE VIEW "parts" WITH(SECURITY_INVOKER=true) AS 
  SELECT
    p.*,
    pg.name AS "partGroup",
    ps."supplierIds"
  FROM "part" p
  LEFT JOIN "partGroup" pg ON pg.id = p."partGroupId"
  LEFT JOIN (
    SELECT 
      "partId",
      array_agg(ps."supplierId") AS "supplierIds"
    FROM "partSupplier" ps
    GROUP BY "partId"
  )  ps ON ps."partId" = p.id;
  
DROP VIEW "purchaseOrders";
CREATE OR REPLACE VIEW "purchaseOrders" WITH(SECURITY_INVOKER=true) AS
  SELECT
    p.*,
    sm."name" AS "shippingMethodName",
    st."name" AS "shippingTermName",
    pt."name" AS "paymentTermName",
    pd."receiptRequestedDate",
    pd."receiptPromisedDate",
    pd."dropShipment",
    l."id" AS "locationId",
    l."name" AS "locationName",
    EXISTS(SELECT 1 FROM "purchaseOrderFavorite" pf WHERE pf."purchaseOrderId" = p.id AND pf."userId" = auth.uid()::text) AS favorite
  FROM "purchaseOrder" p
  LEFT JOIN "purchaseOrderDelivery" pd ON pd."id" = p."id"
  LEFT JOIN "shippingMethod" sm ON sm."id" = pd."shippingMethodId"
  LEFT JOIN "shippingTerm" st ON st."id" = pd."shippingTermId"
  LEFT JOIN "purchaseOrderPayment" pp ON pp."id" = p."id"
  LEFT JOIN "paymentTerm" pt ON pt."id" = pp."paymentTermId"
  LEFT JOIN "location" l ON l."id" = pd."locationId";

DROP VIEW "purchaseInvoices";
CREATE OR REPLACE VIEW "purchaseInvoices" WITH(SECURITY_INVOKER=true) AS 
  SELECT 
    pi."id",
    pi."invoiceId",
    pi."supplierId",
    pi."supplierReference",
    pi."invoiceSupplierId",
    pi."postingDate",
    pi."dateIssued",
    pi."dateDue",
    pi."datePaid",
    pi."paymentTermId",
    pi."currencyCode",
    pi."exchangeRate",
    pi."subtotal",
    pi."totalDiscount",
    pi."totalAmount",
    pi."totalTax",
    pi."balance",
    pi."assignee",
    pi."createdBy",
    pi."createdAt",
    pi."updatedBy",
    pi."updatedAt",
    pi."customFields",
    CASE
      WHEN pi."dateDue" < CURRENT_DATE AND pi."status" = 'Submitted' THEN 'Overdue'
      ELSE pi."status"
    END AS status,
    pt."name" AS "paymentTermName"
  FROM "purchaseInvoice" pi
  LEFT JOIN "paymentTerm" pt ON pt."id" = pi."paymentTermId";

-- DROP VIEW "quotes";
-- CREATE OR REPLACE VIEW "quotes" WITH(SECURITY_INVOKER=true) AS
--   SELECT 
--   q."id",
--   q."quoteId",
--   q."customerId",
--   q."customerLocationId",
--   q."customerContactId",
--   q."name",
--   q."status",
--   q."notes",
--   q."quoteDate",
--   q."expirationDate",
--   q."customerReference",
--   q."locationId",
--   q."createdAt",
--   q."createdBy",
--   q."ownerId",
--   q."customFields",
--   uo."fullName" AS "ownerFullName",
--   uo."avatarUrl" AS "ownerAvatar",
--   c."name" AS "customerName",
--   uc."fullName" AS "createdByFullName",
--   uc."avatarUrl" AS "createdByAvatar",
--   uu."fullName" AS "updatedByFullName",
--   uu."avatarUrl" AS "updatedByAvatar",
--   l."name" AS "locationName",
--   array_agg(ql."partId") AS "partIds",
--   EXISTS(SELECT 1 FROM "quoteFavorite" pf WHERE pf."quoteId" = q.id AND pf."userId" = auth.uid()::text) AS favorite
-- FROM "quote" q
-- LEFT JOIN "customer" c
--   ON c.id = q."customerId"
-- LEFT JOIN "location" l
--   ON l.id = q."locationId"
-- LEFT JOIN "quoteLine" ql
--   ON ql."quoteId" = q.id
-- LEFT JOIN "user" uo
--   ON uo.id = q."ownerId"
-- LEFT JOIN "user" uc
--   ON uc.id = q."createdBy"
-- LEFT JOIN "user" uu
--   ON uu.id = q."updatedBy"
-- GROUP BY
--   q."id",
--   q."quoteId",
--   q."customerId",
--   q."customerLocationId",
--   q."customerContactId",
--   q."name",
--   q."status",
--   q."notes",
--   q."quoteDate",
--   q."expirationDate",
--   q."customerReference",
--   q."locationId",
--   q."createdAt",
--   q."createdBy",
--   q."customFields",
--   c."name",
--   uo."fullName",
--   uo."avatarUrl",
--   uc."fullName",
--   uc."avatarUrl",
--   uu."fullName",
--   uu."avatarUrl",
--   l."name";

-- DROP VIEW "receipts";
-- CREATE OR REPLACE VIEW "receipts" WITH(SECURITY_INVOKER=true) AS
--   SELECT 
--     r.*,
--     cb."fullName" as "createdByFullName",
--     cb."avatarUrl" as "createdByAvatar",
--     ub."fullName" as "updatedByFullName",
--     ub."avatarUrl" as "updatedByAvatar",
--     l."name" as "locationName",
--     s."name" as "supplierName"
--   FROM "receipt" r
--   LEFT JOIN "user" cb
--     ON cb.id = r."createdBy"
--   LEFT JOIN "user" ub
--     ON ub.id = r."updatedBy"
--   LEFT JOIN "location" l
--     ON l.id = r."locationId"
--   LEFT JOIN "supplier" s
--     ON s.id = r."supplierId";

-- DROP VIEW "requestForQuotes";
-- CREATE OR REPLACE VIEW "requestForQuotes" WITH(SECURITY_INVOKER=true) AS
--   SELECT 
--   r."id",
--   r."requestForQuoteId",
--   r."name",
--   r."status",
--   r."notes",
--   r."receiptDate",
--   r."expirationDate",
--   r."locationId",
--   r."customFields",
--   r."createdAt",
--   r."createdBy",
--   uc."fullName" AS "createdByFullName",
--   uc."avatarUrl" AS "createdByAvatar",
--   uu."fullName" AS "updatedByFullName",
--   uu."avatarUrl" AS "updatedByAvatar",
--   l."name" AS "locationName",
--   array_agg(rs."supplierId") AS "supplierIds",
--   array_agg(rl."partId") AS "partIds",
--   EXISTS(SELECT 1 FROM "requestForQuoteFavorite" pf WHERE pf."requestForQuoteId" = r.id AND pf."userId" = auth.uid()::text) AS favorite
-- FROM "requestForQuote" r
-- LEFT JOIN "location" l
--   ON l.id = r."locationId"
-- LEFT JOIN "requestForQuoteSupplier" rs
--   ON rs."requestForQuoteId" = r.id
-- LEFT JOIN "requestForQuoteLine" rl
--   ON rl."requestForQuoteId" = r.id
-- LEFT JOIN "user" uc
--   ON uc.id = r."createdBy"
-- LEFT JOIN "user" uu
--   ON uu.id = r."updatedBy"
-- GROUP BY
--   r."id",
--   r."requestForQuoteId",
--   r."name",
--   r."status",
--   r."notes",
--   r."receiptDate",
--   r."expirationDate",
--   r."locationId",
--   r."customFields",
--   r."createdAt",
--   r."createdBy",
--   uc."fullName",
--   uc."avatarUrl",
--   uu."fullName",
--   uu."avatarUrl",
--   l."name";

-- DROP VIEW "services";
-- CREATE OR REPLACE VIEW "services" WITH(SECURITY_INVOKER=true) AS
--   SELECT
--     s."id",
--     s."name",
--     s."description",
--     s."blocked",
--     s."partGroupId",
--     s."serviceType",
--     s."active",
--     s."approved",
--     s."approvedBy",
--     s."fromDate",
--     s."toDate",
--     s."customFields",
--     pg.name AS "partGroup",
--     array_agg(ss."supplierId") AS "supplierIds"
--   FROM "service" s
--   LEFT JOIN "partGroup" pg ON pg.id = s."partGroupId"
--   LEFT JOIN "serviceSupplier" ss ON ss."serviceId" = s.id
--   GROUP BY 
--     s."id",
--     s."name",
--     s."description",
--     s."blocked",
--     s."partGroupId",
--     s."serviceType",
--     s."active",
--     s."approved",
--     s."approvedBy",
--     s."fromDate",
--     s."toDate",
--     s."customFields",
--     pg.name;

DROP VIEW "suppliers";
CREATE OR REPLACE VIEW "suppliers" WITH(SECURITY_INVOKER=true) AS 
  SELECT 
    s.*,
    st.name AS "type",    
    ss.name AS "status",
    po.count AS "orderCount",
    p.count AS "partCount"
  FROM "supplier" s
  LEFT JOIN "supplierType" st ON st.id = s."supplierTypeId"
  LEFT JOIN "supplierStatus" ss ON ss.id = s."supplierStatusId"
  LEFT JOIN (
    SELECT 
      "supplierId",
      COUNT(*) AS "count"
    FROM "purchaseOrder"
    GROUP BY "supplierId"
  ) po ON po."supplierId" = s.id
  LEFT JOIN (
    SELECT 
      "supplierId",
      COUNT(*) AS "count"
    FROM "partSupplier"
    GROUP BY "supplierId"
  ) p ON p."supplierId" = s.id;