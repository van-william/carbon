import { atom } from "nanostores";
import { useNanoStore } from "~/hooks";
import type { ListItem } from "~/types";

const $peopleStore = atom<ListItem[]>([]);
export const usePeople = () => useNanoStore($peopleStore, "people");
