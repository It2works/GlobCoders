import { useState, useMemo } from "react";

interface UseSearchOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterFunctions?: Record<string, (item: T, values: string[]) => boolean>;
}

export function useSearch<T>({
  data,
  searchFields,
  filterFunctions = {}
}: UseSearchOptions<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const filteredData = useMemo(() => {
    // Ensure data is an array before filtering
    if (!Array.isArray(data)) {
      console.warn('useSearch: data is not an array:', data);
      return [];
    }

    let filtered = data;

    // Apply search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value &&
            String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([filterKey, values]) => {
      if (values.length > 0 && filterFunctions[filterKey]) {
        filtered = filtered.filter((item) =>
          filterFunctions[filterKey](item, values)
        );
      }
    });

    return filtered;
  }, [data, searchTerm, activeFilters, searchFields, filterFunctions]);

  const updateFilter = (filterKey: string, values: string[]) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: values
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const reset = () => {
    setSearchTerm("");
    setActiveFilters({});
  };

  return {
    searchTerm,
    setSearchTerm,
    activeFilters,
    updateFilter,
    clearFilters,
    clearSearch,
    reset,
    filteredData,
    hasActiveFilters: Object.values(activeFilters).some(values => values.length > 0),
    hasSearch: searchTerm.trim().length > 0
  };
}