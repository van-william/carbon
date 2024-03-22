import { Enumerable, Hyperlink, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { New, Table } from "~/components";
import { usePermissions } from "~/hooks";
import type { Customer, CustomerStatus, CustomerType } from "~/modules/sales";
import { path } from "~/utils/path";

type CustomersTableProps = {
  data: Customer[];
  count: number;
  customerTypes: Partial<CustomerType>[];
  customerStatuses: CustomerStatus[];
};

const CustomersTable = memo(
  ({ data, count, customerStatuses, customerTypes }: CustomersTableProps) => {
    const navigate = useNavigate();
    const permissions = usePermissions();

    const columns = useMemo<ColumnDef<Customer>[]>(() => {
      return [
        {
          accessorKey: "name",
          header: "Name",
          cell: ({ row }) => (
            <Hyperlink
              onClick={() => navigate(path.to.customer(row.original.id!))}
            >
              {row.original.name}
            </Hyperlink>
          ),
        },
        {
          accessorKey: "type",
          header: "Customer Type",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
          meta: {
            filter: {
              type: "static",
              options: customerTypes?.map((type) => ({
                value: type.name ?? "",
                label: <Enumerable value={type.name ?? ""} />,
              })),
            },
          },
        },
        {
          accessorKey: "status",
          header: "Customer Status",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
          meta: {
            filter: {
              type: "static",
              options: customerStatuses?.map((status) => ({
                value: status.name,
                label: <Enumerable value={status.name ?? ""} />,
              })),
            },
          },
        },
        // {
        //   id: "orders",
        //   header: "Orders",
        //   cell: ({ row }) => (
        //
        //       <Button
        //         variant="secondary"
        //         onClick={() =>
        //           navigate(`${path.to.salesOrders}?customerId=${row.original.id}`)
        //         }
        //       >
        //         {row.original.orderCount ?? 0} Orders
        //       </Button>
        //   ),
        // },
      ];
    }, [customerStatuses, customerTypes, navigate]);

    const renderContextMenu = useMemo(
      // eslint-disable-next-line react/display-name
      () => (row: Customer) =>
        (
          <MenuItem onClick={() => navigate(path.to.customer(row.id!))}>
            <MenuIcon icon={<BsFillPenFill />} />
            Edit Customer
          </MenuItem>
        ),
      [navigate]
    );

    return (
      <>
        <Table<Customer>
          count={count}
          columns={columns}
          data={data}
          primaryAction={
            permissions.can("create", "sales") && (
              <New label="Customer" to={path.to.newCustomer} />
            )
          }
          renderContextMenu={renderContextMenu}
        />
      </>
    );
  }
);

CustomersTable.displayName = "CustomerTable";

export default CustomersTable;
