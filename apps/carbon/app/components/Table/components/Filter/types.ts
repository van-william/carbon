import type { ReactNode } from "react";

export type ColumnFilter = {
  accessorKey: string;
  header: string;
  pluralHeader?: string;
  filter: ColumnFilterData;
};

export type Option = {
  label: string | ReactNode;
  value: string;
  helper?: string;
};

export type ColumnFilterData =
  | {
      type: "static";
      options: Option[];
    }
  | {
      type: "fetcher";
      endpoint: string;
      transform?: (result: any) => Option[];
    };
