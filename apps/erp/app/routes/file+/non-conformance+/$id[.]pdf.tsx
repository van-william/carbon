import { requirePermissions } from "@carbon/auth/auth.server";
import { NonConformancePDF } from "@carbon/documents/pdf";
import { renderToStream } from "@react-pdf/renderer";
import { type LoaderFunctionArgs } from "@vercel/remix";
import {
  getNonConformance,
  getNonConformanceActionTasks,
  getNonConformanceApprovalTasks,
  getNonConformanceInvestigationTasks,
  getNonConformanceReviewers,
  getNonConformanceTypes,
} from "~/modules/quality";
import { getCompany } from "~/modules/settings";
import { getLocale } from "~/utils/request";

export const config = { runtime: "nodejs" };

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "quality",
  });

  const { id } = params;
  if (!id) throw new Error("Could not find non-conformance id");

  const [
    company,
    nonConformance,
    nonConformanceTypes,
    investigationTasks,
    actionTasks,
    approvalTasks,
    reviewers,
  ] = await Promise.all([
    getCompany(client, companyId),
    getNonConformance(client, id),
    getNonConformanceTypes(client, companyId),
    getNonConformanceInvestigationTasks(client, id, companyId),
    getNonConformanceActionTasks(client, id, companyId),
    getNonConformanceApprovalTasks(client, id, companyId),
    getNonConformanceReviewers(client, id, companyId),
  ]);

  if (company.error) {
    console.error(company.error);
  }

  if (nonConformance.error) {
    console.error(nonConformance.error);
  }

  if (nonConformanceTypes.error) {
    console.error(nonConformanceTypes.error);
  }

  if (investigationTasks.error) {
    console.error(investigationTasks.error);
  }

  if (actionTasks.error) {
    console.error(actionTasks.error);
  }

  if (approvalTasks.error) {
    console.error(approvalTasks.error);
  }

  if (
    company.error ||
    nonConformance.error ||
    nonConformanceTypes.error ||
    investigationTasks.error ||
    actionTasks.error ||
    approvalTasks.error
  ) {
    throw new Error("Failed to load non-conformance");
  }

  const locale = getLocale(request);

  const stream = await renderToStream(
    <NonConformancePDF
      company={company.data}
      locale={locale}
      nonConformance={nonConformance.data}
      nonConformanceTypes={nonConformanceTypes.data ?? []}
      investigationTasks={investigationTasks.data ?? []}
      actionTasks={actionTasks.data ?? []}
      reviewers={reviewers.data ?? []}
    />
  );

  const body: Buffer = await new Promise((resolve, reject) => {
    const buffers: Uint8Array[] = [];
    stream.on("data", (data) => {
      buffers.push(data);
    });
    stream.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
    stream.on("error", reject);
  });

  const headers = new Headers({ "Content-Type": "application/pdf" });
  return new Response(body, { status: 200, headers });
}
