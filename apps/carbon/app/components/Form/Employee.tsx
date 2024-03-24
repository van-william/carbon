import { useMemo } from "react";
import { usePeople } from "~/stores";
import type { ComboboxProps } from "./Combobox";
import CreatableCombobox from "./CreatableCombobox";

type EmployeeSelectProps = Omit<ComboboxProps, "options"> & {};

const Employee = (props: EmployeeSelectProps) => {
  const [people] = usePeople();

  const options = useMemo(
    () =>
      people.map((part) => ({
        value: part.id,
        label: part.name,
      })) ?? [],
    [people]
  );

  return (
    <>
      <CreatableCombobox
        options={options}
        {...props}
        label={props?.label ?? "Employee"}
      />
    </>
  );
};

Employee.displayName = "Employee";

export default Employee;
