import { Enumerable, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { BsFillPenFill, BsPeopleFill } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { TableNew } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import type { CustomerStatus } from "~/modules/sales";
import { path } from "~/utils/path";

type CustomerStatusesTableProps = {
  data: CustomerStatus[];
  count: number;
};

const CustomerStatusesTable = memo(
  ({ data, count }: CustomerStatusesTableProps) => {
    const [params] = useUrlParams();
    const navigate = useNavigate();
    const permissions = usePermissions();

    const columns = useMemo<ColumnDef<CustomerStatus>[]>(() => {
      return [
        {
          accessorKey: "name",
          header: "Customer Status",
          cell: ({ row }) => (
            <Enumerable
              value={row.original.name}
              onClick={() => navigate(row.original.id)}
              className="cursor-pointer"
            />
          ),
        },
      ];
    }, [navigate]);

    const renderContextMenu = useCallback(
      (row: CustomerStatus) => {
        return (
          <>
            <MenuItem
              onClick={() => {
                navigate(`${path.to.customers}?filter=status:eq:${row.name}`);
              }}
            >
              <MenuIcon icon={<BsPeopleFill />} />
              View Customers
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate(
                  `${path.to.customerStatus(row.id)}?${params.toString()}`
                );
              }}
            >
              <MenuIcon icon={<BsFillPenFill />} />
              Edit Customer Status
            </MenuItem>
            <MenuItem
              disabled={!permissions.can("delete", "sales")}
              onClick={() => {
                navigate(
                  `${path.to.deleteCustomerStatus(row.id)}?${params.toString()}`
                );
              }}
            >
              <MenuIcon icon={<IoMdTrash />} />
              Delete Customer Status
            </MenuItem>
          </>
        );
      },
      [navigate, params, permissions]
    );

    return (
      <TableNew<CustomerStatus>
        data={data}
        columns={columns}
        count={count}
        label="Customer Status"
        newPath={path.to.newCustomerStatus}
        newPermission={permissions.can("create", "sales")}
        renderContextMenu={renderContextMenu}
      />
    );
  }
);

CustomerStatusesTable.displayName = "CustomerStatusesTable";
export default CustomerStatusesTable;
