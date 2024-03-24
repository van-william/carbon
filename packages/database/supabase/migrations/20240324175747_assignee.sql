-- ALTER TABLE "account" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
ALTER TABLE "contractor" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
ALTER TABLE "customer" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
-- ALTER TABLE "part" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
-- ALTER TABLE "partner" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
-- ALTER TABLE "purchaseOrder" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
-- ALTER TABLE "purchaseInvoice" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
-- ALTER TABLE "quote" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
-- ALTER TABLE "receipt" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
-- ALTER TABLE "requestForQuote" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
-- ALTER TABLE "service" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;
ALTER TABLE "supplier" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;

-- DROP VIEW "accounts";
-- CREATE OR REPLACE VIEW "accounts" WITH(SECURITY_INVOKER=true) AS
--   SELECT 
--     "account".*,
--     (SELECT "category" FROM "accountCategory" WHERE "accountCategory"."id" = "account"."accountCategoryId") AS "accountCategory",
--     (SELECT "name" FROM "accountSubcategory" WHERE "accountSubcategory"."id" = "account"."accountSubcategoryId") AS "accountSubCategory"  
--   FROM "account"
-- ;

DROP VIEW "contractors";
CREATE OR REPLACE VIEW "contractors" WITH(SECURITY_INVOKER=true) AS
  SELECT 
    p.id AS "supplierContactId", 
    p."active", 
    p."hoursPerWeek", 
    p."customFields",
    p."assignee",
    s.id AS "supplierId",
    c."firstName",
    c."lastName",
    c."email",
    array_agg(pa."abilityId") AS "abilityIds"
  FROM "contractor" p 
    INNER JOIN "supplierContact" sc 
      ON sc.id = p.id
    INNER JOIN "supplier" s
      ON s.id = sc."supplierId"
    INNER JOIN "contact" c 
      ON c.id = sc."contactId"
    LEFT JOIN "contractorAbility" pa
      ON pa."contractorId" = p.id
  WHERE p."active" = true
  GROUP BY p.id, p.active, p."hoursPerWeek", p."customFields", s.id, c.id, s.name, c."firstName", c."lastName", c."email";

DROP VIEW "customers";
CREATE OR REPLACE VIEW "customers" AS 
  SELECT 
    c.*,
    ct.name AS "type",
    cs.name AS "status"
  FROM "customer" c
  LEFT JOIN "customerType" ct ON ct.id = c."customerTypeId"
  LEFT JOIN "customerStatus" cs ON cs.id = c."customerStatusId";

-- DROP VIEW "documents";
-- CREATE OR REPLACE VIEW "documents" WITH(SECURITY_INVOKER=true) AS 
--   SELECT
--     d.*,
--     u."avatarUrl" AS "createdByAvatar",
--     u."fullName" AS "createdByFullName",
--     u2."avatarUrl" AS "updatedByAvatar",
--     u2."fullName" AS "updatedByFullName",
--     ARRAY(SELECT dl.label FROM "documentLabel" dl WHERE dl."documentId" = d.id AND dl."userId" = auth.uid()::text) AS labels,
--     EXISTS(SELECT 1 FROM "documentFavorite" df WHERE df."documentId" = d.id AND df."userId" = auth.uid()::text) AS favorite,
--     (SELECT MAX("createdAt") FROM "documentTransaction" dt WHERE dt."documentId" = d.id) AS "lastActivityAt"
--   FROM "document" d
--   LEFT JOIN "user" u ON u.id = d."createdBy"
--   LEFT JOIN "user" u2 ON u2.id = d."updatedBy";

-- DROP VIEW "partners";
-- CREATE OR REPLACE VIEW "partners" WITH(SECURITY_INVOKER=true) AS
--   SELECT 
--     p.*,
--     p.id AS "supplierLocationId", 
--     a2.name AS "abilityName",
--     s.id AS "supplierId", 
--     s.name AS "supplierName", 
--     a.city,
--     a.state
--   FROM "partner" p 
--     INNER JOIN "supplierLocation" sl 
--       ON sl.id = p.id
--     INNER JOIN "supplier" s
--       ON s.id = sl."supplierId"
--     INNER JOIN "address" a 
--       ON a.id = sl."addressId"
--     INNER JOIN "ability" a2
--       ON a2.id = p."abilityId"
--   WHERE p."active" = true;

-- DROP VIEW "parts";
-- CREATE OR REPLACE VIEW "parts" WITH(SECURITY_INVOKER=true) AS 
--   SELECT
--     p.id,
--     p.name,
--     p.description,
--     p."partType",
--     p."partGroupId",
--     pg.name AS "partGroup",
--     p."replenishmentSystem",
--     p.active,
--     p."customFields",
--     array_agg(ps."supplierId") AS "supplierIds"
--   FROM "part" p
--   LEFT JOIN "partGroup" pg ON pg.id = p."partGroupId"
--   LEFT JOIN "partSupplier" ps ON ps."partId" = p.id
--   GROUP BY p.id,
--     p.name,
--     p.description,
--     p."partType",
--     p."partGroupId",
--     pg.name,
--     p."replenishmentSystem",
--     p.active,
--     p."customFields";
  
-- DROP VIEW "purchaseOrders";
-- CREATE OR REPLACE VIEW "purchaseOrders" WITH(SECURITY_INVOKER=true) AS
--   SELECT
--     p.*,
--     sm."name" AS "shippingMethodName",
--     st."name" AS "shippingTermName",
--     pt."name" AS "paymentTermName",
--     pd."receiptRequestedDate",
--     pd."receiptPromisedDate",
--     pd."dropShipment",
--     l."id" AS "locationId",
--     l."name" AS "locationName",
--     s."name" AS "supplierName",
--     u."avatarUrl" AS "createdByAvatar",
--     u."fullName" AS "createdByFullName",
--     u2."avatarUrl" AS "updatedByAvatar",
--     u2."fullName" AS "updatedByFullName",
--     u3."avatarUrl" AS "closedByAvatar",
--     u3."fullName" AS "closedByFullName",
--     EXISTS(SELECT 1 FROM "purchaseOrderFavorite" pf WHERE pf."purchaseOrderId" = p.id AND pf."userId" = auth.uid()::text) AS favorite
--   FROM "purchaseOrder" p
--   LEFT JOIN "purchaseOrderDelivery" pd ON pd."id" = p."id"
--   LEFT JOIN "shippingMethod" sm ON sm."id" = pd."shippingMethodId"
--   LEFT JOIN "shippingTerm" st ON st."id" = pd."shippingTermId"
--   LEFT JOIN "purchaseOrderPayment" pp ON pp."id" = p."id"
--   LEFT JOIN "paymentTerm" pt ON pt."id" = pp."paymentTermId"
--   LEFT JOIN "location" l ON l."id" = pd."locationId"
--   LEFT JOIN "supplier" s ON s."id" = p."supplierId"
--   LEFT JOIN "user" u ON u."id" = p."createdBy"
--   LEFT JOIN "user" u2 ON u2."id" = p."updatedBy"
--   LEFT JOIN "user" u3 ON u3."id" = p."closedBy";

-- DROP VIEW "purchaseInvoices";
-- CREATE OR REPLACE VIEW "purchaseInvoices" WITH(SECURITY_INVOKER=true) AS 
--   SELECT 
--     pi."id",
--     pi."invoiceId",
--     pi."supplierId",
--     pi."supplierReference",
--     pi."invoiceSupplierId",
--     pi."invoiceSupplierLocationId",
--     pi."invoiceSupplierContactId",
--     pi."postingDate",
--     pi."dateIssued",
--     pi."dateDue",
--     pi."datePaid",
--     pi."paymentTermId",
--     pi."currencyCode",
--     pi."exchangeRate",
--     pi."subtotal",
--     pi."totalDiscount",
--     pi."totalAmount",
--     pi."totalTax",
--     pi."balance",
--     pi."createdBy",
--     pi."createdAt",
--     pi."updatedBy",
--     pi."updatedAt",
--     pi."customFields",
--     CASE
--       WHEN pi."dateDue" < CURRENT_DATE AND pi."status" = 'Submitted' THEN 'Overdue'
--       ELSE pi."status"
--     END AS status,
--     s."name" AS "supplierName",
--     c."fullName" AS "contactName",
--     u."avatarUrl" AS "createdByAvatar",
--     u."fullName" AS "createdByFullName",
--     u2."avatarUrl" AS "updatedByAvatar",
--     u2."fullName" AS "updatedByFullName"
--   FROM "purchaseInvoice" pi
--     LEFT JOIN "supplier" s ON s.id = pi."supplierId"
--     LEFT JOIN "supplierContact" sc ON sc.id = pi."invoiceSupplierContactId"
--     LEFT JOIN "contact" c ON c.id = sc."contactId"
--     LEFT JOIN "user" u ON u."id" = pi."createdBy"
--     LEFT JOIN "user" u2 ON u2."id" = pi."updatedBy";

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
CREATE OR REPLACE VIEW "suppliers" AS 
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