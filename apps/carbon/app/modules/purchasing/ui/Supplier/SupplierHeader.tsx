import {
  Card,
  CardAction,
  CardAttribute,
  CardAttributeLabel,
  CardAttributeValue,
  CardAttributes,
  CardContent,
  CardHeader,
  CardTitle,
  Enumerable,
  HStack,
  VStack,
} from "@carbon/react";

import { useParams } from "@remix-run/react";
import { EmployeeAvatar } from "~/components";
import { useRouteData } from "~/hooks";
import type {
  SupplierDetail,
  SupplierStatus,
  SupplierType,
} from "~/modules/purchasing";
import type { ListItem } from "~/types";
import { path } from "~/utils/path";

const SupplierHeader = () => {
  const { supplierId } = useParams();
  if (!supplierId) throw new Error("Could not find supplierId");
  const routeData = useRouteData<{ supplier: SupplierDetail }>(
    path.to.supplier(supplierId)
  );
  const sharedSupplierData = useRouteData<{
    supplierTypes: SupplierType[];
    supplierStatuses: SupplierStatus[];
    paymentTerms: ListItem[];
  }>(path.to.supplierRoot);

  const supplierStatus = sharedSupplierData?.supplierStatuses?.find(
    (status) => status.id === routeData?.supplier?.supplierStatusId
  )?.name;

  const supplierType = sharedSupplierData?.supplierTypes?.find(
    (type) => type.id === routeData?.supplier?.supplierTypeId
  )?.name;

  return (
    <VStack>
      <Card>
        <HStack className="justify-between items-start">
          <CardHeader>
            <CardTitle>{routeData?.supplier?.name}</CardTitle>
          </CardHeader>
          <CardAction>
            {/* <Button onClick={() => alert("TODO")} leftIcon={<FaHistory />}>
              Supplier Details
            </Button> */}
          </CardAction>
        </HStack>
        <CardContent>
          <CardAttributes>
            <CardAttribute>
              <CardAttributeLabel>Account Manager</CardAttributeLabel>
              <CardAttributeValue>
                {routeData?.supplier?.accountManagerId ? (
                  <EmployeeAvatar
                    employeeId={routeData?.supplier?.accountManagerId ?? null}
                  />
                ) : (
                  "-"
                )}
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Assignee</CardAttributeLabel>
              <CardAttributeValue>
                {routeData?.supplier?.assignee ? (
                  <EmployeeAvatar
                    employeeId={routeData?.supplier?.assignee ?? null}
                  />
                ) : (
                  "-"
                )}
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Type</CardAttributeLabel>
              <CardAttributeValue>
                {supplierType ? <Enumerable value={supplierType!} /> : "-"}
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Status</CardAttributeLabel>
              <CardAttributeValue>
                {supplierStatus ? <Enumerable value={supplierStatus!} /> : "-"}
              </CardAttributeValue>
            </CardAttribute>
          </CardAttributes>
        </CardContent>
      </Card>
    </VStack>
  );
};

export default SupplierHeader;
