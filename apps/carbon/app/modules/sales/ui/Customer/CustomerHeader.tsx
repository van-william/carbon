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
  CustomerDetail,
  CustomerStatus,
  CustomerType,
} from "~/modules/sales";
import type { ListItem } from "~/types";
import { path } from "~/utils/path";

const CustomerHeader = () => {
  const { customerId } = useParams();
  if (!customerId) throw new Error("Could not find customerId");
  const routeData = useRouteData<{ customer: CustomerDetail }>(
    path.to.customer(customerId)
  );
  const sharedCustomerData = useRouteData<{
    customerTypes: CustomerType[];
    customerStatuses: CustomerStatus[];
    paymentTerms: ListItem[];
  }>(path.to.customerRoot);

  const customerStatus = sharedCustomerData?.customerStatuses?.find(
    (status) => status.id === routeData?.customer?.customerStatusId
  )?.name;

  const customerType = sharedCustomerData?.customerTypes?.find(
    (type) => type.id === routeData?.customer?.customerTypeId
  )?.name;

  return (
    <VStack>
      <Card>
        <HStack className="justify-between items-start">
          <CardHeader>
            <CardTitle>{routeData?.customer?.name}</CardTitle>
          </CardHeader>
          <CardAction>
            {/* <Button onClick={() => alert("TODO")} leftIcon={<FaHistory />}>
              Customer Details
            </Button> */}
          </CardAction>
        </HStack>
        <CardContent>
          <CardAttributes>
            <CardAttribute>
              <CardAttributeLabel>Account Manager</CardAttributeLabel>
              <CardAttributeValue>
                {routeData?.customer?.accountManagerId ? (
                  <EmployeeAvatar
                    employeeId={routeData?.customer?.accountManagerId ?? null}
                  />
                ) : (
                  "-"
                )}
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Assignee</CardAttributeLabel>
              <CardAttributeValue>
                {routeData?.customer?.assignee ? (
                  <EmployeeAvatar
                    employeeId={routeData?.customer?.assignee ?? null}
                  />
                ) : (
                  "-"
                )}
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Type</CardAttributeLabel>
              <CardAttributeValue>
                {customerType ? <Enumerable value={customerType!} /> : "-"}
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Status</CardAttributeLabel>
              <CardAttributeValue>
                {customerStatus ? <Enumerable value={customerStatus!} /> : "-"}
              </CardAttributeValue>
            </CardAttribute>
          </CardAttributes>
        </CardContent>
      </Card>
    </VStack>
  );
};

export default CustomerHeader;
