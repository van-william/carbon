import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { path } from "~/utils/path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { receiptId } = params;
  if (!receiptId) throw new Error("Could not find receiptId");
  throw redirect(path.to.receiptDetails(receiptId));
}
