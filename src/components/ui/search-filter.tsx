import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface FilterOption {
  key: string;
  label: string;
  values: { value: string; label: string; count?: number }[];
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterOption[];
  activeFilters?: Record<string, string[]>;
  onFilterChange?: (filterKey: string, values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const SearchFilter = ({
  searchValue,
  onSearchChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  placeholder = "Search...",
  className = "",
}: SearchFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const totalActiveFilters = Object.values(activeFilters).reduce(
    (acc, values) => acc + values.length,
    0
  );

  const clearFilter = (filterKey: string, value: string) => {
    if (!onFilterChange) return;
    const currentValues = activeFilters[filterKey] || [];
    const newValues = currentValues.filter(v => v !== value);
    onFilterChange(filterKey, newValues);
  };

  const clearAllFilters = () => {
    if (!onFilterChange) return;
    filters.forEach(filter => {
      onFilterChange(filter.key, []);
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {filters.length > 0 && (
          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {totalActiveFilters > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {totalActiveFilters}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              {filters.map((filter, index) => (
                <div key={filter.key}>
                  <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
                  {filter.values.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={(activeFilters[filter.key] || []).includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (!onFilterChange) return;
                        const currentValues = activeFilters[filter.key] || [];
                        const newValues = checked
                          ? [...currentValues, option.value]
                          : currentValues.filter(v => v !== option.value);
                        onFilterChange(filter.key, newValues);
                      }}
                      className="flex items-center justify-between"
                    >
                      <span>{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-muted-foreground text-xs">
                          ({option.count})
                        </span>
                      )}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {index < filters.length - 1 && <DropdownMenuSeparator />}
                </div>
              ))}
              
              {totalActiveFilters > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="w-full"
                    >
                      Clear all filters
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Active Filters */}
      {totalActiveFilters > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) =>
            (activeFilters[filter.key] || []).map((value) => {
              const option = filter.values.find(v => v.value === value);
              return (
                <Badge key={`${filter.key}-${value}`} variant="secondary" className="gap-1">
                  {filter.label}: {option?.label || value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => clearFilter(filter.key, value)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};