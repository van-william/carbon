import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  VStack,
} from "@carbon/react";
import { ValidatedForm } from "@carbon/remix-validated-form";
import type { z } from "zod";
import {
  ComboboxControlled,
  CustomFormFields,
  Hidden,
  Input,
  Select,
  Submit,
} from "~/components/Form";
import { usePermissions } from "~/hooks";
import type {
  ReceiptLine,
  ReceiptSourceDocument,
  receiptStatusType,
} from "~/modules/inventory";
import {
  receiptSourceDocumentType,
  receiptValidator,
} from "~/modules/inventory";
import { path } from "~/utils/path";
import useReceiptForm from "./useReceiptForm";

type ReceiptFormProps = {
  initialValues: z.infer<typeof receiptValidator>;
  status: (typeof receiptStatusType)[number];
  receiptLines?: ReceiptLine[];
};

const formId = "receipt-form";

const ReceiptForm = ({
  initialValues,
  status,
  receiptLines,
}: ReceiptFormProps) => {
  const permissions = usePermissions();
  const {
    locationId,
    locations,
    sourceDocumentId,
    supplierId,
    sourceDocuments,
    setLocationId,
    setSourceDocument,
    setSourceDocumentId,
  } = useReceiptForm({
    receipt: initialValues,
    receiptLines: receiptLines ?? [],
  });

  const isPosted = status === "Posted";
  const isEditing = initialValues.id !== undefined;
  const locationOptions = locations.map((l) => ({
    label: l.name,
    value: l.id,
  }));

  return (
    <ValidatedForm
      id={formId}
      validator={receiptValidator}
      method="post"
      action={path.to.receiptDetails(initialValues.id)}
      defaultValues={initialValues}
      style={{ width: "100%" }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Receipt" : "New Receipt"}</CardTitle>
          {!isEditing && (
            <CardDescription>
              A receipt is a record of a part received from a supplier or
              transfered from another location.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Hidden name="id" />
          <Hidden
            name="sourceDocumentReadableId"
            value={
              sourceDocuments.find((d) => d.id === sourceDocumentId)?.name ?? ""
            }
          />
          <Hidden name="supplierId" value={supplierId ?? ""} />
          <VStack spacing={4} className="min-h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 w-full">
              <Input name="receiptId" label="Receipt ID" isReadOnly />
              <ComboboxControlled
                name="locationId"
                label="Location"
                options={locationOptions}
                value={locationId ?? undefined}
                onChange={(newValue) => {
                  if (newValue) setLocationId(newValue.value as string);
                }}
                isReadOnly={isPosted}
              />
              <Select
                name="sourceDocument"
                label="Source Document"
                options={receiptSourceDocumentType.map((v) => ({
                  label: v,
                  value: v,
                }))}
                onChange={(newValue) => {
                  if (newValue) {
                    setSourceDocument(newValue.value as ReceiptSourceDocument);
                    setSourceDocumentId(null);
                  }
                }}
                isReadOnly={isPosted}
              />
              <ComboboxControlled
                name="sourceDocumentId"
                label="Source Document ID"
                options={sourceDocuments.map((d) => ({
                  label: d.name,
                  value: d.id,
                }))}
                value={sourceDocumentId ?? undefined}
                onChange={(newValue) => {
                  if (newValue) {
                    setSourceDocumentId(newValue.value as string);
                  }
                }}
                isReadOnly={isPosted}
              />
              <Input name="externalDocumentId" label="External Reference" />
              <CustomFormFields table="receipt" />
            </div>
          </VStack>
        </CardContent>
        <CardFooter>
          <Submit
            isDisabled={
              isEditing
                ? !permissions.can("update", "inventory")
                : !permissions.can("create", "inventory")
            }
          >
            Save
          </Submit>
        </CardFooter>
      </Card>
    </ValidatedForm>

    // <VStack>
    //   <SectionTitle>Receipt Lines</SectionTitle>
    //   <DataGrid<ReceiptLine>
    //     data={internalReceiptLines}
    //     columns={receiptLineColumns}
    //     canEdit={!isPosted}
    //     contained={false}
    //     editableComponents={editableComponents}
    //     onDataChange={setReceiptLines}
    //   />
    // </VStack>
    // <SectionTitle>Notes</SectionTitle>
    // <Notes notes={notes} documentId={initialValues.id} />
  );
};

export default ReceiptForm;
