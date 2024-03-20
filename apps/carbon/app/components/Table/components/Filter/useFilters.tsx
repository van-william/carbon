import { useUrlParams } from "~/hooks";

export function useFilters() {
  const [params, setParams] = useUrlParams();
  const urlFiltersParams = params.getAll("filter");
  const hasFilter = (searchKey: string, searchValue: string) => {
    return urlFiltersParams.some((filter) => {
      const [key, operator, value] = filter.split(":");
      if (key && operator && value) {
        switch (operator) {
          case "eq":
            return key === searchKey && value === searchValue;
          case "in":
            const values = value.split(",");
            return key === searchKey && values.some((v) => v === searchValue);
          default:
            return false;
        }
      }
      return false;
    });
  };

  const hasFilterKey = (searchKey: string) => {
    return urlFiltersParams.some((filter) => {
      const [key] = filter.split(":");
      return key === searchKey;
    });
  };

  const getFilterKeyIndex = (key: string) => {
    return urlFiltersParams.findIndex((f) => {
      let accessorKey = f.split(":")?.[0];
      return key === accessorKey;
    });
  };

  const addFilter = (newKey: string, newValue: string) => {
    if (hasFilterKey(newKey)) {
      const filterIndex = getFilterKeyIndex(newKey);
      const filter = urlFiltersParams[filterIndex];
      const [key, operator, value] = filter.split(":");

      let newFilter = "";
      if (operator === "in") {
        newFilter = `${filter},${newValue}`;
      } else {
        newFilter = `${key}:in:${value},${newValue}`;
      }

      setParams({
        filter: urlFiltersParams.map((f, index) =>
          index === filterIndex ? newFilter : f
        ),
      });
    } else {
      setParams({
        filter: urlFiltersParams.concat(`${newKey}:eq:${newValue}`),
      });
    }
  };

  const removeFilter = (oldKey: string, oldValue: string) => {
    const filterIndex = getFilterKeyIndex(oldKey);
    const filter = urlFiltersParams[filterIndex];
    const [key, operator, value] = filter.split(":");
    if (operator === "in") {
      const values = value.split(",").filter((v) => v !== oldValue);
      if (values.length === 1) {
        setParams({
          filter: urlFiltersParams.map((f, index) =>
            index === filterIndex ? `${key}:eq:${values[0]}` : f
          ),
        });
      } else {
        setParams({
          filter: urlFiltersParams.map((f, index) =>
            index === filterIndex ? `${key}:in:${values.join(",")}` : f
          ),
        });
      }
    } else {
      setParams({
        filter: urlFiltersParams.filter((_, index) => index !== filterIndex),
      });
    }
  };

  const removeKey = (key: string) => {
    setParams({
      filter: urlFiltersParams.filter((f) => {
        const [filterKey] = f.split(":");
        return filterKey !== key;
      }),
    });
  };

  const toggleFilter = (key: string, value: string) => {
    if (hasFilter(key, value)) {
      removeFilter(key, value);
    } else {
      addFilter(key, value);
    }
  };

  const clearFilters = () => {
    setParams({ filter: undefined });
  };

  const hasFilters = urlFiltersParams.length > 0;

  return {
    clearFilters,
    hasFilter,
    hasFilters,
    hasFilterKey,
    removeKey,
    toggleFilter,
    urlFiltersParams,
  };
}
