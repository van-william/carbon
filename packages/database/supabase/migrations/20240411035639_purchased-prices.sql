CREATE OR REPLACE FUNCTION public.create_part_related_records()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."partCost"("partId", "costingMethod", "createdBy")
  VALUES (new.id, 'FIFO', new."createdBy");

  INSERT INTO public."partReplenishment"("partId", "createdBy")
  VALUES (new.id, new."createdBy");

  INSERT INTO public."partUnitSalePrice"("partId", "currencyCode", "createdBy")
  -- TODO: get default currency
  VALUES (new.id, 'USD', new."createdBy");
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE INDEX "costLedger_partId_idx" ON "costLedger" ("partId");