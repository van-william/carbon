import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Enumerable,
  HStack,
  IconButton,
  Table,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  VStack,
} from "@carbon/react";
import {
  ValidatedForm,
  validationError,
  validator,
} from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { z } from "zod";
import { Number, Submit } from "~/components/Form";
import {
  QuotationLineForm,
  getQuoteLine,
  quotationLineValidator,
  upsertQuoteLine,
} from "~/modules/sales";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { getCustomFields, setCustomFields } from "~/utils/form";
import { assertIsPost, notFound } from "~/utils/http";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "sales",
    role: "employee",
  });

  const { lineId } = params;
  if (!lineId) throw notFound("lineId not found");

  const [quotationLine] = await Promise.all([getQuoteLine(client, lineId)]);

  return json({
    quotationLine: quotationLine?.data ?? null,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "purchasing",
  });

  const { id: quoteId, lineId } = params;
  if (!quoteId) throw new Error("Could not find id");
  if (!lineId) throw new Error("Could not find lineId");

  const formData = await request.formData();
  const validation = await validator(quotationLineValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const updateQuotationLine = await upsertQuoteLine(client, {
    id: lineId,
    ...data,
    updatedBy: userId,
    customFields: setCustomFields(formData),
  });

  if (updateQuotationLine.error) {
    return redirect(
      path.to.quoteLine(quoteId, lineId),
      await flash(
        request,
        error(updateQuotationLine.error, "Failed to update quote line")
      )
    );
  }

  return redirect(path.to.quoteLine(quoteId, lineId));
}

export default function EditQuotationLineRoute() {
  const { quotationLine } = useLoaderData<typeof loader>();
  if (!quotationLine) throw new Error("Could not find quotation line");

  const initialValues = {
    id: quotationLine?.id ?? undefined,
    quoteId: quotationLine?.quoteId ?? "",
    partId: quotationLine?.partId ?? "",
    description: quotationLine?.description ?? "",
    customerPartId: quotationLine?.customerPartId ?? "",
    customerPartRevision: quotationLine?.customerPartRevision ?? "",
    replenishmentSystem: (quotationLine?.replenishmentSystem ?? "") as
      | "Buy"
      | "Make",
    status: quotationLine?.status ?? "Draft",
    unitOfMeasureCode: quotationLine?.unitOfMeasureCode ?? "",
    ...getCustomFields(quotationLine?.customFields),
  };

  return (
    <>
      <QuotationLineForm key={initialValues.id} initialValues={initialValues} />
      <QuotationCostingTable />
      <QuotationLinePrice />
    </>
  );
}

export function QuotationCostingTable() {
  return (
    <Card>
      <HStack className="justify-between items-start">
        <CardHeader>
          <CardTitle>Costing</CardTitle>
        </CardHeader>
        <CardAction>
          <IconButton
            variant="secondary"
            icon={<BsThreeDotsVertical />}
            aria-label="Options"
          />
        </CardAction>
      </HStack>
      <CardContent>
        <Table>
          <Thead>
            <Tr>
              <Th className="font-mono"></Th>
              <Th className="font-mono">1</Th>
              <Th className="font-mono">25</Th>
              <Th className="font-mono">50</Th>
              <Th className="font-mono">100</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td className="border-r border-border">
                <HStack className="w-full justify-between ">
                  <span>Total Raw Material</span>
                  <Enumerable value="Material" />
                </HStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$3.00</span>
                  <span className="text-muted-foreground text-xs">$3.00</span>
                </VStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$75.00</span>
                  <span className="text-muted-foreground text-xs">$3.00</span>
                </VStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$150.00</span>
                  <span className="text-muted-foreground text-xs">$3.00</span>
                </VStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$300.00</span>
                  <span className="text-muted-foreground text-xs">$3.00</span>
                </VStack>
              </Td>
            </Tr>
            <Tr>
              <Td className="border-r border-border">
                <HStack className="w-full justify-between ">
                  <span>Total Labor &amp; Overhead</span>
                  <Enumerable value="Labor" />
                </HStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$3.00</span>
                  <span className="text-muted-foreground text-xs">$3.00</span>
                </VStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$75.00</span>
                  <span className="text-muted-foreground text-xs">$3.00</span>
                </VStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$150.00</span>
                  <span className="text-muted-foreground text-xs">$3.00</span>
                </VStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$300.00</span>
                  <span className="text-muted-foreground text-xs">$3.00</span>
                </VStack>
              </Td>
            </Tr>
            <Tr>
              <Td className="border-r border-border">
                <HStack className="w-full justify-between ">
                  <span>Total Outside Processing</span>
                  <Enumerable value="Subcontract" />
                </HStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$0.00</span>
                  <span className="text-muted-foreground text-xs">$0.00</span>
                </VStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$0.00</span>
                  <span className="text-muted-foreground text-xs">$0.00</span>
                </VStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$0.00</span>
                  <span className="text-muted-foreground text-xs">$0.00</span>
                </VStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$0.00</span>
                  <span className="text-muted-foreground text-xs">$0.00</span>
                </VStack>
              </Td>
            </Tr>
            <Tr className="font-bold">
              <Td className="border-r border-border">
                <HStack className="w-full justify-between ">
                  <span>Total Cost</span>
                </HStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$6.00</span>
                  <span className="text-muted-foreground text-xs">$6.00</span>
                </VStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$150.00</span>
                  <span className="text-muted-foreground text-xs">$6.00</span>
                </VStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$300.00</span>
                  <span className="text-muted-foreground text-xs">$6.00</span>
                </VStack>
              </Td>
              <Td className="font-mono">
                <VStack spacing={0}>
                  <span>$600.00</span>
                  <span className="text-muted-foreground text-xs">$6.00</span>
                </VStack>
              </Td>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr className="font-bold">
              <Td className="border-r border-border"></Td>
              <Td className="font-mono text-center">
                <Button size="sm" variant="secondary">
                  Add
                </Button>
              </Td>
              <Td className="font-mono text-center">
                <Button size="sm" variant="secondary">
                  Add
                </Button>
              </Td>
              <Td className="font-mono text-center">
                <Button size="sm" variant="secondary">
                  Add
                </Button>
              </Td>
              <Td className="font-mono text-center">
                <Button size="sm" variant="secondary">
                  Add
                </Button>
              </Td>
            </Tr>
          </Tfoot>
        </Table>
      </CardContent>
    </Card>
  );
}

export function QuotationLinePrice() {
  return (
    <ValidatedForm validator={z.object({})} className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-x-8 gap-y-2 grid-cols-1 lg:grid-cols-3">
            <Number name="quantity" label="Quantity" />
            <Number
              name="unitCost"
              label="Unit Cost"
              formatOptions={{ style: "currency", currency: "USD" }}
            />
            <Number name="leadTime" label="Lead Time (Days)" />
            <Number name="discountPercent" label="Discount %" />
            <Number name="markupPercent" label="Markup %" />
            <Number
              name="extendedPrice"
              label="Extended Price"
              isReadOnly
              formatOptions={{ style: "currency", currency: "USD" }}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Submit>Save</Submit>
        </CardFooter>
      </Card>
    </ValidatedForm>
  );
}
