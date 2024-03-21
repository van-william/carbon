import {
  Button,
  Enumerable,
  Hyperlink,
  MenuIcon,
  MenuItem,
} from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { TableNew } from "~/components";
import { usePermissions } from "~/hooks";
import type {
  Supplier,
  SupplierStatus,
  SupplierType,
} from "~/modules/purchasing";
import { path } from "~/utils/path";

type SuppliersTableProps = {
  data: Supplier[];
  count: number;
  supplierTypes: Partial<SupplierType>[];
  supplierStatuses: SupplierStatus[];
};

const SuppliersTable = memo(
  ({ data, count, supplierStatuses, supplierTypes }: SuppliersTableProps) => {
    const navigate = useNavigate();
    const permissions = usePermissions();

    const columns = useMemo<ColumnDef<Supplier>[]>(() => {
      return [
        {
          accessorKey: "name",
          header: "Name",
          cell: ({ row }) => (
            <Hyperlink
              onClick={() => navigate(path.to.supplier(row.original.id!))}
            >
              {row.original.name}
            </Hyperlink>
          ),
        },
        {
          accessorKey: "type",
          header: "Supplier Type",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
          meta: {
            filter: {
              type: "static",
              options: supplierTypes?.map((type) => ({
                value: type.name ?? "",
                label: <Enumerable value={type.name ?? ""} />,
              })),
            },
          },
        },
        {
          accessorKey: "status",
          header: "Supplier Status",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
          meta: {
            filter: {
              type: "static",
              options: supplierStatuses?.map((status) => ({
                value: status.name,
                label: <Enumerable value={status.name ?? ""} />,
              })),
            },
          },
        },
        {
          id: "orders",
          header: "Orders",
          cell: ({ row }) => (
            <Button
              variant="secondary"
              onClick={() =>
                navigate(
                  `${path.to.purchaseOrders}?filter=supplierName:eq:${row.original.id}`
                )
              }
            >
              {row.original.orderCount ?? 0} Orders
            </Button>
          ),
        },
        {
          id: "parts",
          header: "Parts",
          cell: ({ row }) => (
            <Button
              variant="secondary"
              onClick={() =>
                navigate(`${path.to.partsSearch}?supplierId=${row.original.id}`)
              }
            >
              {row.original.partCount ?? 0} Parts
            </Button>
          ),
        },
      ];
    }, [navigate, supplierStatuses, supplierTypes]);

    const renderContextMenu = useMemo(
      // eslint-disable-next-line react/display-name
      () => (row: Supplier) =>
        (
          <MenuItem onClick={() => navigate(path.to.supplier(row.id!))}>
            <MenuIcon icon={<BsFillPenFill />} />
            Edit Supplier
          </MenuItem>
        ),
      [navigate]
    );

    return (
      <>
        <TableNew<Supplier>
          count={count}
          columns={columns}
          data={data}
          label="Supplier"
          newPath={path.to.newSupplier}
          newPermission={permissions.can("create", "purchasing")}
          renderContextMenu={renderContextMenu}
        />
      </>
    );
  }
);

SuppliersTable.displayName = "SupplierTable";

export default SuppliersTable;
