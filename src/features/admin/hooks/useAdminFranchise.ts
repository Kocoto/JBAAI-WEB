// src/features/admin/hooks/useAdminFranchise.ts

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApiError,
  Franchise,
  FranchiseListResponse,
  FranchiseHierarchyResponse,
  FranchiseStatisticsResponse,
  FranchiseListFilters,
  FranchiseHierarchyNode,
  FranchiseStatistics,
} from "../types/franchise.types";
import { FranchiseService } from "../services/franchiseService";

/**
 * State interface for franchise list
 */
interface FranchiseListState {
  data: Franchise[];
  loading: boolean;
  error: ApiError | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * State interface for franchise hierarchy
 */
interface FranchiseHierarchyState {
  data: FranchiseHierarchyNode | null;
  statistics: {
    totalFranchises: number;
    byLevel: Record<number, number>;
    totalActiveQuota: number;
  } | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * State interface for franchise statistics
 */
interface FranchiseStatisticsState {
  data: FranchiseStatistics | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Initial state for franchise list
 */
const initialListState: FranchiseListState = {
  data: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

/**
 * Initial state for franchise hierarchy
 */
const initialHierarchyState: FranchiseHierarchyState = {
  data: null,
  statistics: null,
  loading: false,
  error: null,
};

/**
 * Initial state for franchise statistics
 */
const initialStatisticsState: FranchiseStatisticsState = {
  data: null,
  loading: false,
  error: null,
};

/**
 * Custom hook for managing franchise operations
 */
export const useAdminFranchise = () => {
  const navigate = useNavigate();

  // State management
  const [franchiseList, setFranchiseList] =
    useState<FranchiseListState>(initialListState);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(
    null
  );
  const [franchiseHierarchy, setFranchiseHierarchy] =
    useState<FranchiseHierarchyState>(initialHierarchyState);
  const [franchiseStatistics, setFranchiseStatistics] =
    useState<FranchiseStatisticsState>(initialStatisticsState);
  const [filters, setFilters] = useState<FranchiseListFilters>({
    page: 1,
    limit: 10,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Fetch franchise list with filters
   */
  const fetchFranchiseList = useCallback(
    async (customFilters?: FranchiseListFilters) => {
      setFranchiseList((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const currentFilters = customFilters || filters;
        const response = await FranchiseService.getFranchiseList(
          currentFilters
        );

        setFranchiseList({
          data: response.data,
          loading: false,
          error: null,
          pagination: {
            page: response.Pagination?.currentPage || currentFilters.page || 1,
            limit: currentFilters.limit || 10,
            total: response.Pagination?.total || response.data.length,
            totalPages: response.Pagination?.totalPages || 1,
            hasNextPage: response.Pagination?.hasNextPage || false,
            hasPrevPage: response.Pagination?.hasPrevPage || false,
          },
        });
      } catch (error) {
        const apiError = error as ApiError;
        setFranchiseList((prev) => ({
          ...prev,
          loading: false,
          error: apiError,
        }));
      }
    },
    [filters]
  );

  /**
   * Fetch franchise by ID
   */
  const fetchFranchiseById = useCallback(async (franchiseId: string) => {
    try {
      const franchise = await FranchiseService.getFranchiseById(franchiseId);
      setSelectedFranchise(franchise);
      return franchise;
    } catch (error) {
      console.error("Error fetching franchise:", error);
      throw error;
    }
  }, []);

  /**
   * Fetch franchise hierarchy
   */
  const fetchFranchiseHierarchy = useCallback(async (userId: string) => {
    setFranchiseHierarchy((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await FranchiseService.getFranchiseHierarchy(userId);
      setFranchiseHierarchy({
        data: response.data,
        statistics: response.statistics,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setFranchiseHierarchy((prev) => ({
        ...prev,
        loading: false,
        error: apiError,
      }));
    }
  }, []);

  /**
   * Fetch franchise statistics
   */
  const fetchFranchiseStatistics = useCallback(async () => {
    setFranchiseStatistics((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await FranchiseService.getFranchiseStatistics();
      setFranchiseStatistics({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setFranchiseStatistics((prev) => ({
        ...prev,
        loading: false,
        error: apiError,
      }));
    }
  }, []);

  /**
   * Update franchise status
   */
  const updateFranchiseStatus = useCallback(
    async (franchiseId: string, status: "active" | "inactive") => {
      try {
        await FranchiseService.updateFranchiseStatus(franchiseId, status);
        // Refresh the list after status update
        await fetchFranchiseList();
        return true;
      } catch (error) {
        console.error("Error updating franchise status:", error);
        return false;
      }
    },
    [fetchFranchiseList]
  );

  /**
   * Search franchises
   */
  const searchFranchises = useCallback(
    async (searchTerm: string) => {
      const searchFilters: FranchiseListFilters = {
        ...filters,
        search: searchTerm,
        page: 1, // Reset to first page on search
      };
      setFilters(searchFilters);
      await fetchFranchiseList(searchFilters);
    },
    [filters, fetchFranchiseList]
  );

  /**
   * Filter by level
   */
  const filterByLevel = useCallback(
    async (level: number | undefined) => {
      const levelFilters: FranchiseListFilters = {
        ...filters,
        level,
        page: 1, // Reset to first page on filter
      };
      setFilters(levelFilters);
      await fetchFranchiseList(levelFilters);
    },
    [filters, fetchFranchiseList]
  );

  /**
   * Filter by status
   */
  const filterByStatus = useCallback(
    async (status: "active" | "inactive" | undefined) => {
      const statusFilters: FranchiseListFilters = {
        ...filters,
        status,
        page: 1, // Reset to first page on filter
      };
      setFilters(statusFilters);
      await fetchFranchiseList(statusFilters);
    },
    [filters, fetchFranchiseList]
  );

  /**
   * Pagination handlers
   */
  const goToPage = useCallback(
    async (page: number) => {
      const pageFilters: FranchiseListFilters = { ...filters, page };
      setFilters(pageFilters);
      await fetchFranchiseList(pageFilters);
    },
    [filters, fetchFranchiseList]
  );

  const goToNextPage = useCallback(async () => {
    if (franchiseList.pagination.hasNextPage) {
      await goToPage(franchiseList.pagination.page + 1);
    }
  }, [franchiseList.pagination, goToPage]);

  const goToPrevPage = useCallback(async () => {
    if (franchiseList.pagination.hasPrevPage) {
      await goToPage(franchiseList.pagination.page - 1);
    }
  }, [franchiseList.pagination, goToPage]);

  const changePageSize = useCallback(
    async (limit: number) => {
      const sizeFilters: FranchiseListFilters = { ...filters, limit, page: 1 };
      setFilters(sizeFilters);
      await fetchFranchiseList(sizeFilters);
    },
    [filters, fetchFranchiseList]
  );

  /**
   * Clear filters
   */
  const clearFilters = useCallback(async () => {
    const defaultFilters: FranchiseListFilters = { page: 1, limit: 10 };
    setFilters(defaultFilters);
    await fetchFranchiseList(defaultFilters);
  }, [fetchFranchiseList]);

  /**
   * Navigate to franchise detail
   */
  const navigateToFranchiseDetail = useCallback(
    (franchiseId: string) => {
      navigate(`/admin/franchises/${franchiseId}`);
    },
    [navigate]
  );

  /**
   * Navigate to franchise hierarchy
   */
  const navigateToFranchiseHierarchy = useCallback(
    (userId: string) => {
      navigate(`/admin/franchises/${userId}/hierarchy`);
    },
    [navigate]
  );

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await Promise.all([fetchFranchiseList(), fetchFranchiseStatistics()]);
  }, [fetchFranchiseList, fetchFranchiseStatistics]);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    if (!isInitialized) {
      fetchFranchiseList();
      setIsInitialized(true);
    }
  }, [isInitialized, fetchFranchiseList]);

  return {
    // State
    franchiseList: franchiseList.data || [], // Ensure always return array
    selectedFranchise,
    franchiseHierarchy: franchiseHierarchy.data,
    franchiseStatistics: franchiseStatistics.data,
    pagination: franchiseList.pagination,
    filters,

    // Loading states
    isLoading: franchiseList.loading,
    isLoadingHierarchy: franchiseHierarchy.loading,
    isLoadingStatistics: franchiseStatistics.loading,

    // Error states
    error: franchiseList.error,
    hierarchyError: franchiseHierarchy.error,
    statisticsError: franchiseStatistics.error,

    // Actions
    fetchFranchiseList,
    fetchFranchiseById,
    fetchFranchiseHierarchy,
    fetchFranchiseStatistics,
    updateFranchiseStatus,
    searchFranchises,
    filterByLevel,
    filterByStatus,
    clearFilters,
    refreshData,

    // Pagination actions
    goToPage,
    goToNextPage,
    goToPrevPage,
    changePageSize,

    // Navigation actions
    navigateToFranchiseDetail,
    navigateToFranchiseHierarchy,

    // Setters
    setSelectedFranchise,
    setFilters,
  };
};
