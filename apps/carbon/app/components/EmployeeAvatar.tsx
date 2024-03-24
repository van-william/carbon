import { HStack } from "@carbon/react";
import { usePeople } from "~/stores";
import Avatar from "./Avatar";

const EmployeeAvatar = ({ employeeId }: { employeeId: string | null }) => {
  const [people] = usePeople();
  if (!employeeId) return null;

  const person = people.find((p) => p.id === employeeId);

  if (!person && people.length > 0) {
    return (
      <HStack>
        <Avatar size="sm" />
        <span className="text-muted-foreground">Deactivated user</span>
      </HStack>
    );
  }

  if (!person) {
    return null;
  }

  return (
    <HStack>
      <Avatar
        size="sm"
        src={person.avatarUrl ?? undefined}
        name={person?.name ?? ""}
      />
      <span>{person.name}</span>
    </HStack>
  );
};

export default EmployeeAvatar;
