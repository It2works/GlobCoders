import { useState, useMemo, useEffect } from "react";

interface UsePaginationOptions<T> {
  data: T[];
  itemsPerPage?: number;
  initialPage?: number;
}

export function usePagination<T>({
  data,
  itemsPerPage = 10,
  initialPage = 1
}: UsePaginationOptions<T>) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  const totalPages = Math.ceil(safeData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return safeData.slice(startIndex, endIndex);
  }, [safeData, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const reset = () => {
    setCurrentPage(1);
  };

  // Reset to page 1 when data changes (e.g., after filtering) - FIXED VERSION
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [safeData.length, totalPages, currentPage]);

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems: safeData.length,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    reset,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: Math.min(currentPage * itemsPerPage, safeData.length)
  };
}