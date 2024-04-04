import { useParams } from "@remix-run/react";
import { BsBank, BsListCheck } from "react-icons/bs";
import { PiMoneyFill } from "react-icons/pi";
import { usePermissions } from "~/hooks";
import type { ReceiptLine } from "~/modules/inventory/types";
import type { Note } from "~/modules/shared";
import type { Role } from "~/types";

export function useReceiptSidebar(
  lines: ReceiptLine[] = [],
  notes: Note[] = []
) {
  const permissions = usePermissions();
  const { receiptId } = useParams();
  if (!receiptId) throw new Error("receiptId not found");

  return [
    {
      name: "Details",
      to: "details",
      icon: BsBank,
      shortcut: "Command+Shift+d",
    },
    {
      name: "Lines",
      to: "lines",
      role: ["employee"],
      count: lines.length,
      icon: BsListCheck,
      shortcut: "Command+Shift+l",
    },

    {
      name: "Notes",
      to: "notes",
      role: ["employee"],
      count: notes.length,
      icon: PiMoneyFill,
      shortcut: "Command+Shift+n",
    },
  ].filter(
    (item) =>
      item.role === undefined ||
      item.role.some((role) => permissions.is(role as Role))
  );
}
