// src/features/admin/hooks/useAdminCampaign.ts

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApiError,
  Campaign,
  CampaignListResponse,
  CampaignStatistics,
  CampaignPerformanceSummary,
  CampaignListFilters,
  CreateCampaignPayload,
  UpdateCampaignPayload,
  CAMPAIGN_STATUS,
} from "../types/campaign.types";
import { CampaignService } from "../services/campaignService";

/**
 * State interface for campaign list
 */
interface CampaignListState {
  data: Campaign[];
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
 * State interface for campaign statistics
 */
interface CampaignStatisticsState {
  data: CampaignStatistics | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * State interface for campaign performance
 */
interface CampaignPerformanceState {
  data: CampaignPerformanceSummary | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Initial state for campaign list
 */
const initialListState: CampaignListState = {
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
 * Initial state for campaign statistics
 */
const initialStatisticsState: CampaignStatisticsState = {
  data: null,
  loading: false,
  error: null,
};

/**
 * Initial state for campaign performance
 */
const initialPerformanceState: CampaignPerformanceState = {
  data: null,
  loading: false,
  error: null,
};

/**
 * Custom hook for managing campaign operations
 */
export const useAdminCampaign = () => {
  const navigate = useNavigate();

  // State management
  const [campaignList, setCampaignList] =
    useState<CampaignListState>(initialListState);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [campaignStatistics, setCampaignStatistics] =
    useState<CampaignStatisticsState>(initialStatisticsState);
  const [campaignPerformance, setCampaignPerformance] =
    useState<CampaignPerformanceState>(initialPerformanceState);
  const [filters, setFilters] = useState<CampaignListFilters>({
    page: 1,
    limit: 10,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Fetch campaign list with filters
   */
  const fetchCampaignList = useCallback(
    async (customFilters?: CampaignListFilters) => {
      setCampaignList((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const currentFilters = customFilters || filters;
        const response = await CampaignService.getCampaignList(currentFilters);

        setCampaignList({
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
        setCampaignList((prev) => ({
          ...prev,
          loading: false,
          error: apiError,
        }));
      }
    },
    [filters]
  );

  /**
   * Create new campaign
   */
  const createCampaign = useCallback(
    async (payload: CreateCampaignPayload) => {
      setIsCreating(true);
      try {
        const response = await CampaignService.createCampaign(payload);
        // Refresh the list after creation
        await fetchCampaignList();
        return response.data;
      } catch (error) {
        console.error("Error creating campaign:", error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [fetchCampaignList]
  );

  /**
   * Fetch campaign by ID
   */
  const fetchCampaignById = useCallback(async (campaignId: string) => {
    try {
      const response = await CampaignService.getCampaignById(campaignId);
      setSelectedCampaign(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching campaign:", error);
      throw error;
    }
  }, []);

  /**
   * Update campaign
   */
  const updateCampaign = useCallback(
    async (campaignId: string, payload: UpdateCampaignPayload) => {
      setIsUpdating(true);
      try {
        const response = await CampaignService.updateCampaign(
          campaignId,
          payload
        );
        // Update selected campaign if it's the same
        if (selectedCampaign?._id === campaignId) {
          setSelectedCampaign(response.data);
        }
        // Refresh the list
        await fetchCampaignList();
        return response.data;
      } catch (error) {
        console.error("Error updating campaign:", error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedCampaign, fetchCampaignList]
  );

  /**
   * Change campaign status
   */
  const changeCampaignStatus = useCallback(
    async (
      campaignId: string,
      status: (typeof CAMPAIGN_STATUS)[keyof typeof CAMPAIGN_STATUS]
    ) => {
      try {
        const response = await CampaignService.changeCampaignStatus(
          campaignId,
          status
        );
        // Update selected campaign if it's the same
        if (selectedCampaign?._id === campaignId) {
          setSelectedCampaign(response.data);
        }
        // Refresh the list
        await fetchCampaignList();
        return response.data;
      } catch (error) {
        console.error("Error changing campaign status:", error);
        throw error;
      }
    },
    [selectedCampaign, fetchCampaignList]
  );

  /**
   * Delete campaign
   */
  const deleteCampaign = useCallback(
    async (campaignId: string) => {
      setIsDeleting(true);
      try {
        await CampaignService.deleteCampaign(campaignId);
        // Clear selected campaign if it's the deleted one
        if (selectedCampaign?._id === campaignId) {
          setSelectedCampaign(null);
        }
        // Refresh the list
        await fetchCampaignList();
        return true;
      } catch (error) {
        console.error("Error deleting campaign:", error);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [selectedCampaign, fetchCampaignList]
  );

  /**
   * Fetch campaign statistics
   */
  const fetchCampaignStatistics = useCallback(async () => {
    setCampaignStatistics((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await CampaignService.getCampaignStatistics();
      setCampaignStatistics({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setCampaignStatistics((prev) => ({
        ...prev,
        loading: false,
        error: apiError,
      }));
    }
  }, []);

  /**
   * Fetch campaign performance summary
   */
  const fetchCampaignPerformance = useCallback(async (campaignId: string) => {
    setCampaignPerformance((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await CampaignService.getCampaignPerformanceSummary(
        campaignId
      );
      setCampaignPerformance({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setCampaignPerformance((prev) => ({
        ...prev,
        loading: false,
        error: apiError,
      }));
    }
  }, []);

  /**
   * Search campaigns
   */
  const searchCampaigns = useCallback(
    async (searchTerm: string) => {
      const searchFilters: CampaignListFilters = {
        ...filters,
        search: searchTerm,
        page: 1, // Reset to first page on search
      };
      setFilters(searchFilters);
      await fetchCampaignList(searchFilters);
    },
    [filters, fetchCampaignList]
  );

  /**
   * Filter by status
   */
  const filterByStatus = useCallback(
    async (
      status: (typeof CAMPAIGN_STATUS)[keyof typeof CAMPAIGN_STATUS] | undefined
    ) => {
      const statusFilters: CampaignListFilters = {
        ...filters,
        status,
        page: 1, // Reset to first page on filter
      };
      setFilters(statusFilters);
      await fetchCampaignList(statusFilters);
    },
    [filters, fetchCampaignList]
  );

  /**
   * Filter by franchise owner
   */
  const filterByFranchiseOwner = useCallback(
    async (franchiseOwnerId: string | undefined) => {
      const ownerFilters: CampaignListFilters = {
        ...filters,
        franchiseOwnerId,
        page: 1, // Reset to first page on filter
      };
      setFilters(ownerFilters);
      await fetchCampaignList(ownerFilters);
    },
    [filters, fetchCampaignList]
  );

  /**
   * Filter by date range
   */
  const filterByDateRange = useCallback(
    async (startDate?: string, endDate?: string) => {
      const dateFilters: CampaignListFilters = {
        ...filters,
        startDate,
        endDate,
        page: 1, // Reset to first page on filter
      };
      setFilters(dateFilters);
      await fetchCampaignList(dateFilters);
    },
    [filters, fetchCampaignList]
  );

  /**
   * Pagination handlers
   */
  const goToPage = useCallback(
    async (page: number) => {
      const pageFilters: CampaignListFilters = { ...filters, page };
      setFilters(pageFilters);
      await fetchCampaignList(pageFilters);
    },
    [filters, fetchCampaignList]
  );

  const goToNextPage = useCallback(async () => {
    if (campaignList.pagination.hasNextPage) {
      await goToPage(campaignList.pagination.page + 1);
    }
  }, [campaignList.pagination, goToPage]);

  const goToPrevPage = useCallback(async () => {
    if (campaignList.pagination.hasPrevPage) {
      await goToPage(campaignList.pagination.page - 1);
    }
  }, [campaignList.pagination, goToPage]);

  const changePageSize = useCallback(
    async (limit: number) => {
      const sizeFilters: CampaignListFilters = { ...filters, limit, page: 1 };
      setFilters(sizeFilters);
      await fetchCampaignList(sizeFilters);
    },
    [filters, fetchCampaignList]
  );

  /**
   * Clear filters
   */
  const clearFilters = useCallback(async () => {
    const defaultFilters: CampaignListFilters = { page: 1, limit: 10 };
    setFilters(defaultFilters);
    await fetchCampaignList(defaultFilters);
  }, [fetchCampaignList]);

  /**
   * Quick status actions
   */
  const activateCampaign = useCallback(
    async (campaignId: string) => {
      return changeCampaignStatus(campaignId, CAMPAIGN_STATUS.ACTIVE);
    },
    [changeCampaignStatus]
  );

  const deactivateCampaign = useCallback(
    async (campaignId: string) => {
      return changeCampaignStatus(campaignId, CAMPAIGN_STATUS.INACTIVE);
    },
    [changeCampaignStatus]
  );

  const expireCampaign = useCallback(
    async (campaignId: string) => {
      return changeCampaignStatus(campaignId, CAMPAIGN_STATUS.EXPIRED);
    },
    [changeCampaignStatus]
  );

  /**
   * Navigate to campaign detail
   */
  const navigateToCampaignDetail = useCallback(
    (campaignId: string) => {
      navigate(`/admin/campaigns/${campaignId}`);
    },
    [navigate]
  );

  /**
   * Navigate to create campaign
   */
  const navigateToCreateCampaign = useCallback(() => {
    navigate("/admin/campaigns/create");
  }, [navigate]);

  /**
   * Navigate to campaign performance
   */
  const navigateToCampaignPerformance = useCallback(
    (campaignId: string) => {
      navigate(`/admin/campaigns/${campaignId}/performance`);
    },
    [navigate]
  );

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await Promise.all([fetchCampaignList(), fetchCampaignStatistics()]);
  }, [fetchCampaignList, fetchCampaignStatistics]);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    if (!isInitialized) {
      fetchCampaignList();
      setIsInitialized(true);
    }
  }, [isInitialized, fetchCampaignList]);

  return {
    // State
    campaignList: campaignList.data,
    selectedCampaign,
    campaignStatistics: campaignStatistics.data,
    campaignPerformance: campaignPerformance.data,
    pagination: campaignList.pagination,
    filters,

    // Loading states
    isLoading: campaignList.loading,
    isLoadingStatistics: campaignStatistics.loading,
    isLoadingPerformance: campaignPerformance.loading,
    isCreating,
    isUpdating,
    isDeleting,

    // Error states
    error: campaignList.error,
    statisticsError: campaignStatistics.error,
    performanceError: campaignPerformance.error,

    // CRUD actions
    createCampaign,
    fetchCampaignList,
    fetchCampaignById,
    updateCampaign,
    changeCampaignStatus,
    deleteCampaign,

    // Data fetching actions
    fetchCampaignStatistics,
    fetchCampaignPerformance,

    // Filter actions
    searchCampaigns,
    filterByStatus,
    filterByFranchiseOwner,
    filterByDateRange,
    clearFilters,

    // Status actions
    activateCampaign,
    deactivateCampaign,
    expireCampaign,

    // Pagination actions
    goToPage,
    goToNextPage,
    goToPrevPage,
    changePageSize,

    // Navigation actions
    navigateToCampaignDetail,
    navigateToCreateCampaign,
    navigateToCampaignPerformance,

    // Utility actions
    refreshData,

    // Setters
    setSelectedCampaign,
    setFilters,
  };
};
