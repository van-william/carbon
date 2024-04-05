import {
  Card,
  CardAction,
  CardAttribute,
  CardAttributeLabel,
  CardAttributeValue,
  CardAttributes,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Enumerable,
  HStack,
  Menubar,
  MenubarItem,
  VStack,
} from "@carbon/react";
import { formatDate } from "@carbon/utils";

import { useNavigate, useParams } from "@remix-run/react";
import { Assign, EmployeeAvatar, useOptimisticAssignment } from "~/components";
import { usePermissions, useRouteData } from "~/hooks";
import type { Receipt, ReceiptLine } from "~/modules/inventory";
import { ReceiptStatus } from "~/modules/inventory";
import { path } from "~/utils/path";

const ReceiptHeader = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { receiptId } = useParams();
  if (!receiptId) throw new Error("receiptId not found");

  const routeData = useRouteData<{
    receipt: Receipt;
    receiptLines: ReceiptLine[];
  }>(path.to.receipt(receiptId));

  if (!routeData) throw new Error("Could not find routeData");

  const canPost =
    routeData.receiptLines.length > 0 &&
    routeData.receiptLines.some((line) => line.receivedQuantity > 0);

  const isPosted = routeData.receipt.status === "Posted";

  const onPost = () => {
    navigate(path.to.receiptPost(routeData.receipt.id!));
  };

  const optimisticAssignment = useOptimisticAssignment({
    id: receiptId,
    table: "receipt",
  });
  const assignee =
    optimisticAssignment !== undefined
      ? optimisticAssignment
      : routeData?.receipt?.assignee;

  return (
    <VStack>
      {permissions.is("employee") && (
        <Menubar>
          <Assign
            id={receiptId}
            table="receipt"
            value={routeData?.receipt?.assignee ?? ""}
          />
          <MenubarItem isDisabled={!canPost || isPosted} onClick={onPost}>
            Post
          </MenubarItem>
        </Menubar>
      )}
      <Card>
        <HStack className="justify-between items-start">
          <CardHeader>
            <CardTitle>{routeData?.receipt?.receiptId}</CardTitle>
            <CardDescription>
              {routeData?.receipt?.locationName}
            </CardDescription>
          </CardHeader>
          <CardAction>
            {/* <Button
            variant="secondary"
            onClick={() => alert("TODO")}
            leftIcon={<FaHistory />}
          >
            View History
          </Button> */}
          </CardAction>
        </HStack>
        <CardContent>
          <CardAttributes>
            <CardAttribute>
              <CardAttributeLabel>Assignee</CardAttributeLabel>
              <CardAttributeValue>
                {assignee ? (
                  <EmployeeAvatar employeeId={assignee ?? null} />
                ) : (
                  "-"
                )}
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Location</CardAttributeLabel>
              <CardAttributeValue>
                <Enumerable value={routeData?.receipt?.locationName} />
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Source Document</CardAttributeLabel>
              <CardAttributeValue>
                <Enumerable
                  value={routeData?.receipt?.sourceDocument ?? null}
                />
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Source Document ID</CardAttributeLabel>
              <CardAttributeValue>
                {routeData?.receipt?.sourceDocumentReadableId}
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Posting Date</CardAttributeLabel>
              <CardAttributeValue>
                {routeData?.receipt?.postingDate
                  ? formatDate(routeData?.receipt?.postingDate)
                  : "-"}
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Status</CardAttributeLabel>
              <CardAttributeValue>
                <ReceiptStatus status={routeData?.receipt?.status} />
              </CardAttributeValue>
            </CardAttribute>
          </CardAttributes>
        </CardContent>
      </Card>
    </VStack>
  );
};

export default ReceiptHeader;
