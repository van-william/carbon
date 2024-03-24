import { HStack } from "@carbon/react";
import { useSuppliers } from "~/stores";
import Avatar from "./Avatar";

const SupplierAvatar = ({ supplierId }: { supplierId: string | null }) => {
  const [suppliers] = useSuppliers();
  if (!supplierId) return null;

  const supplier = suppliers.find((s) => s.id === supplierId) ?? {
    name: "",
    id: "",
  };

  return (
    <HStack>
      <Avatar size="sm" name={supplier?.name ?? ""} />
      <span>{supplier.name}</span>
    </HStack>
  );
};

export default SupplierAvatar;
