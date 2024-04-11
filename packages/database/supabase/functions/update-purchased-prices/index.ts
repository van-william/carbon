import { serve } from "https://deno.land/std@0.175.0/http/server.ts";

import { DB, getConnectionPool, getDatabaseClient } from "../lib/database.ts";
import { corsHeaders } from "../lib/headers.ts";
import { getSupabaseServiceRole } from "../lib/supabase.ts";

const pool = getConnectionPool(1);
const db = getDatabaseClient<DB>(pool);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { invoiceId } = await req.json();

  try {
    if (!invoiceId) throw new Error("Payload is missing invoiceId");

    const client = getSupabaseServiceRole(req.headers.get("Authorization"));

    const [purchaseInvoice, purchaseInvoiceLines] = await Promise.all([
      client.from("purchaseInvoice").select("*").eq("id", invoiceId).single(),
      client.from("purchaseInvoiceLine").select("*").eq("invoiceId", invoiceId),
    ]);

    if (purchaseInvoice.error)
      throw new Error("Failed to fetch purchaseInvoice");
    if (purchaseInvoiceLines.error)
      throw new Error("Failed to fetch receipt lines");

    const partSuppliers = await client
      .from("partSupplier")
      .select("*")
      .eq("supplierId", purchaseInvoice.data?.supplierId ?? "")
      .in(
        "partId",
        purchaseInvoiceLines.data
          .filter((line) => Boolean(line.partId))
          .map((line) => line.partId)
      );

    await db.transaction().execute(async (trx) => {});

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error(err);

    return new Response(JSON.stringify(err), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
