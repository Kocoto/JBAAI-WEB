// src/features/admin/hooks/useAdminPackage.ts

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApiError,
  Package,
  PackageStatistics,
  PackageListFilters,
  CreatePackagePayload,
  UpdatePackagePayload,
  PackageType,
} from "../types/package.types";
import { PackageService } from "../services/packageService";

/**
 * State interface for package list
 */
interface PackageListState {
  data: Package[];
  loading: boolean;
  error: ApiError | null;
  filteredData: Package[];
}

/**
 * State interface for package statistics
 */
interface PackageStatisticsState {
  data: PackageStatistics | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Initial state for package list
 */
const initialListState: PackageListState = {
  data: [],
  loading: false,
  error: null,
  filteredData: [],
};

/**
 * Initial state for package statistics
 */
const initialStatisticsState: PackageStatisticsState = {
  data: null,
  loading: false,
  error: null,
};

/**
 * Custom hook for managing package operations
 */
export const useAdminPackage = () => {
  const navigate = useNavigate();

  // State management
  const [packageList, setPackageList] =
    useState<PackageListState>(initialListState);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packageStatistics, setPackageStatistics] =
    useState<PackageStatisticsState>(initialStatisticsState);
  const [filters, setFilters] = useState<PackageListFilters>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Fetch package list with filters
   */
  const fetchPackageList = useCallback(
    async (customFilters?: PackageListFilters) => {
      setPackageList((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const currentFilters = customFilters || filters;
        const response = await PackageService.getPackageList(currentFilters);

        console.log("Package list response:", response);

        setPackageList({
          data: response.data || [],
          filteredData: response.data || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        const apiError = error as ApiError;
        setPackageList((prev) => ({
          ...prev,
          loading: false,
          error: apiError,
        }));
      }
    },
    [filters]
  );

  /**
   * Fetch packages by type
   */
  const fetchPackagesByType = useCallback(async (type: PackageType) => {
    setPackageList((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await PackageService.getPackagesByType(type);

      setPackageList({
        data: response.data || [],
        filteredData: response.data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setPackageList((prev) => ({
        ...prev,
        loading: false,
        error: apiError,
      }));
    }
  }, []);

  /**
   * Create new package
   */
  const createPackage = useCallback(
    async (payload: CreatePackagePayload) => {
      setIsCreating(true);
      try {
        const response = await PackageService.createPackage(payload);
        // Refresh the list after creation
        await fetchPackageList();
        return response.data;
      } catch (error) {
        console.error("Error creating package:", error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [fetchPackageList]
  );

  /**
   * Fetch package by ID
   */
  const fetchPackageById = useCallback(async (packageId: string) => {
    try {
      const response = await PackageService.getPackageById(packageId);
      setSelectedPackage(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching package:", error);
      throw error;
    }
  }, []);

  /**
   * Update package
   */
  const updatePackage = useCallback(
    async (packageId: string, payload: UpdatePackagePayload) => {
      setIsUpdating(true);
      try {
        const response = await PackageService.updatePackage(packageId, payload);
        // Update selected package if it's the same
        if (selectedPackage?._id === packageId) {
          setSelectedPackage(response.data);
        }
        // Refresh the list
        await fetchPackageList();
        return response.data;
      } catch (error) {
        console.error("Error updating package:", error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedPackage, fetchPackageList]
  );

  /**
   * Delete package
   */
  const deletePackage = useCallback(
    async (packageId: string) => {
      setIsDeleting(true);
      try {
        await PackageService.deletePackage(packageId);
        // Clear selected package if it's the deleted one
        if (selectedPackage?._id === packageId) {
          setSelectedPackage(null);
        }
        // Refresh the list
        await fetchPackageList();
        return true;
      } catch (error) {
        console.error("Error deleting package:", error);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [selectedPackage, fetchPackageList]
  );

  /**
   * Toggle package status
   */
  const togglePackageStatus = useCallback(
    async (packageId: string, status: boolean) => {
      try {
        const response = await PackageService.togglePackageStatus(
          packageId,
          status
        );
        // Update selected package if it's the same
        if (selectedPackage?._id === packageId) {
          setSelectedPackage(response.data);
        }
        // Refresh the list
        await fetchPackageList();
        return response.data;
      } catch (error) {
        console.error("Error toggling package status:", error);
        throw error;
      }
    },
    [selectedPackage, fetchPackageList]
  );

  /**
   * Fetch package statistics
   */
  const fetchPackageStatistics = useCallback(async () => {
    setPackageStatistics((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await PackageService.getPackageStatistics();
      setPackageStatistics({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setPackageStatistics((prev) => ({
        ...prev,
        loading: false,
        error: apiError,
      }));
    }
  }, []);

  /**
   * Search packages
   */
  const searchPackages = useCallback(
    async (searchTerm: string) => {
      const searchFilters: PackageListFilters = {
        ...filters,
        search: searchTerm,
      };
      setFilters(searchFilters);
      await fetchPackageList(searchFilters);
    },
    [filters, fetchPackageList]
  );

  /**
   * Filter by type
   */
  const filterByType = useCallback(
    async (type?: PackageType) => {
      const typeFilters: PackageListFilters = { ...filters, type };
      setFilters(typeFilters);
      await fetchPackageList(typeFilters);
    },
    [filters, fetchPackageList]
  );

  /**
   * Filter by status
   */
  const filterByStatus = useCallback(
    async (status?: boolean) => {
      const statusFilters: PackageListFilters = { ...filters, status };
      setFilters(statusFilters);
      await fetchPackageList(statusFilters);
    },
    [filters, fetchPackageList]
  );

  /**
   * Filter by price range
   */
  const filterByPriceRange = useCallback(
    async (minPrice?: number, maxPrice?: number) => {
      const priceFilters: PackageListFilters = {
        ...filters,
        minPrice,
        maxPrice,
      };
      setFilters(priceFilters);
      await fetchPackageList(priceFilters);
    },
    [filters, fetchPackageList]
  );

  /**
   * Clear filters
   */
  const clearFilters = useCallback(async () => {
    setFilters({});
    await fetchPackageList({});
  }, [fetchPackageList]);

  /**
   * Navigate to package detail
   */
  const navigateToPackageDetail = useCallback(
    (packageId: string) => {
      navigate(`/admin/packages/${packageId}`);
    },
    [navigate]
  );

  /**
   * Navigate to create package
   */
  const navigateToCreatePackage = useCallback(() => {
    navigate("/admin/packages/new");
  }, [navigate]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await Promise.all([fetchPackageList(), fetchPackageStatistics()]);
  }, [fetchPackageList, fetchPackageStatistics]);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    if (!isInitialized) {
      fetchPackageList();
      setIsInitialized(true);
    }
  }, [isInitialized, fetchPackageList]);

  /**
   * Client-side filtering
   */
  useEffect(() => {
    let filtered = [...packageList.data];

    if (filters.type) {
      filtered = filtered.filter((pkg) => pkg.type === filters.type);
    }
    if (filters.status !== undefined) {
      filtered = filtered.filter((pkg) => pkg.status === filters.status);
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((pkg) => pkg.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((pkg) => pkg.price <= filters.maxPrice!);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(searchLower) ||
          pkg.description.toLowerCase().includes(searchLower)
      );
    }

    setPackageList((prev) => ({ ...prev, filteredData: filtered }));
  }, [packageList.data, filters]);

  return {
    // State
    packageList: packageList.filteredData,
    allPackages: packageList.data,
    selectedPackage,
    packageStatistics: packageStatistics.data,
    filters,

    // Loading states
    isLoadingPackages: packageList.loading,
    isLoadingStatistics: packageStatistics.loading,
    isCreating,
    isUpdating,
    isDeleting,

    // Error states
    error: packageList.error,
    statisticsError: packageStatistics.error,

    // CRUD actions
    createPackage,
    fetchPackageList,
    fetchPackageById,
    fetchPackagesByType,
    updatePackage,
    deletePackage,
    togglePackageStatus,

    // Data fetching actions
    fetchPackageStatistics,

    // Filter actions
    searchPackages,
    filterByType,
    filterByStatus,
    filterByPriceRange,
    clearFilters,

    // Navigation actions
    navigateToPackageDetail,
    navigateToCreatePackage,

    // Utility actions
    refreshData,

    // Setters
    setSelectedPackage,
    setFilters,
  };
};
