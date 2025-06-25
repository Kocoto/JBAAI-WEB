// useFranchise.ts

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { franchiseService } from "../services/franchiseService";
import {
  FranchiseDetails,
  QuotaInfo,
  FranchiseStatistics,
  InvitationCode,
  UserTrialQuotaLedger,
  AllocateQuotaPayload,
  AllocationHistory,
  TrialPerformance,
  ChildPerformanceSummary,
  HierarchyPerformance,
  QuotaUtilization,
  ChildFranchise,
  ApiError,
} from "../types/franchise.type";

/**
 * State interface for franchise details
 */
interface FranchiseDetailsState {
  data: FranchiseDetails | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * State interface for quota info
 */
interface QuotaState {
  data: QuotaInfo | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * State interface for statistics
 */
interface StatisticsState {
  data: FranchiseStatistics | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * State interface for invitation codes
 */
interface InvitationCodesState {
  data: InvitationCode[];
  loading: boolean;
  error: ApiError | null;
}

/**
 * State interface for quota ledger
 */
interface QuotaLedgerState {
  data: UserTrialQuotaLedger[];
  loading: boolean;
  error: ApiError | null;
}

/**
 * State interface for child franchises
 */
interface ChildFranchisesState {
  data: ChildFranchise[];
  loading: boolean;
  error: ApiError | null;
}

/**
 * State interface for performance metrics
 */
interface PerformanceState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Custom hook for managing franchise operations
 */
export const useFranchise = () => {
  const navigate = useNavigate();

  // State management
  const [franchiseDetails, setFranchiseDetails] =
    useState<FranchiseDetailsState>({
      data: null,
      loading: false,
      error: null,
    });

  const [quota, setQuota] = useState<QuotaState>({
    data: null,
    loading: false,
    error: null,
  });

  const [statistics, setStatistics] = useState<StatisticsState>({
    data: null,
    loading: false,
    error: null,
  });

  const [invitationCodes, setInvitationCodes] = useState<InvitationCodesState>({
    data: [],
    loading: false,
    error: null,
  });

  const [quotaLedger, setQuotaLedger] = useState<QuotaLedgerState>({
    data: [],
    loading: false,
    error: null,
  });

  const [childFranchises, setChildFranchises] = useState<ChildFranchisesState>({
    data: [],
    loading: false,
    error: null,
  });

  const [myPerformance, setMyPerformance] = useState<
    PerformanceState<TrialPerformance>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const [childrenPerformance, setChildrenPerformance] = useState<
    PerformanceState<ChildPerformanceSummary[]>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const [hierarchyPerformance, setHierarchyPerformance] = useState<
    PerformanceState<HierarchyPerformance>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const [quotaUtilization, setQuotaUtilization] = useState<
    PerformanceState<QuotaUtilization>
  >({
    data: null,
    loading: false,
    error: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Fetch franchise details
   */
  const fetchFranchiseDetails = useCallback(async () => {
    setFranchiseDetails((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getMyFranchiseDetails();
      setFranchiseDetails({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setFranchiseDetails({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, []);

  /**
   * Fetch quota information
   */
  const fetchQuota = useCallback(async () => {
    setQuota((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getMyQuota();
      setQuota({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setQuota({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, []);

  /**
   * Fetch statistics
   */
  const fetchStatistics = useCallback(async () => {
    setStatistics((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getMyStatistics();
      setStatistics({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setStatistics({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, []);

  /**
   * Fetch invitation codes
   */
  const fetchInvitationCodes = useCallback(async () => {
    setInvitationCodes((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getMyInvitationCodes();
      setInvitationCodes({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setInvitationCodes({
        data: [],
        loading: false,
        error: apiError,
      });
    }
  }, []);

  /**
   * Fetch quota ledger
   */
  const fetchQuotaLedger = useCallback(
    async (status?: "active" | "inactive" | "expired", campaignId?: string) => {
      setQuotaLedger((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await franchiseService.getMyUserTrialQuotaLedger(
          status,
          campaignId
        );
        setQuotaLedger({
          data: response.data,
          loading: false,
          error: null,
        });
      } catch (error) {
        const apiError = error as ApiError;
        setQuotaLedger({
          data: [],
          loading: false,
          error: apiError,
        });
      }
    },
    []
  );

  /**
   * Fetch child franchises
   */
  const fetchChildFranchises = useCallback(async () => {
    setChildFranchises((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getChildFranchises();
      setChildFranchises({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setChildFranchises({
        data: [],
        loading: false,
        error: apiError,
      });
    }
  }, []);

  /**
   * Allocate quota to child
   */
  const allocateQuota = useCallback(
    async (payload: AllocateQuotaPayload) => {
      try {
        const response = await franchiseService.allocateQuotaToChild(payload);
        // Refresh quota and ledger after allocation
        await Promise.all([fetchQuota(), fetchQuotaLedger()]);
        return { success: true, data: response.data };
      } catch (error) {
        const apiError = error as ApiError;
        return { success: false, error: apiError };
      }
    },
    [fetchQuota, fetchQuotaLedger]
  );

  /**
   * Revoke quota from child
   */
  const revokeQuota = useCallback(
    async (ledgerEntryId: string) => {
      try {
        const response = await franchiseService.revokeQuotaFromChild(
          ledgerEntryId
        );
        // Refresh quota and ledger after revocation
        await Promise.all([fetchQuota(), fetchQuotaLedger()]);
        return { success: true, message: response.data.message };
      } catch (error) {
        const apiError = error as ApiError;
        return { success: false, error: apiError };
      }
    },
    [fetchQuota, fetchQuotaLedger]
  );

  /**
   * Generate invitation code
   */
  const generateInvitationCode = useCallback(
    async (campaignId: string) => {
      try {
        const response = await franchiseService.generateInvitationCode(
          campaignId
        );
        // Refresh invitation codes list
        await fetchInvitationCodes();
        return { success: true, data: response.data };
      } catch (error) {
        const apiError = error as ApiError;
        return { success: false, error: apiError };
      }
    },
    [fetchInvitationCodes]
  );

  /**
   * Fetch my trial performance
   */
  const fetchMyPerformance = useCallback(async () => {
    setMyPerformance((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getMyTrialPerformance();
      setMyPerformance({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setMyPerformance({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, []);

  /**
   * Fetch children performance summary
   */
  const fetchChildrenPerformance = useCallback(async () => {
    setChildrenPerformance((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response =
        await franchiseService.getChildrenTrialPerformanceSummary();
      setChildrenPerformance({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setChildrenPerformance({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, []);

  /**
   * Fetch single child performance
   */
  const fetchChildPerformance = useCallback(async (childUserId: string) => {
    try {
      const response = await franchiseService.getChildTrialPerformance(
        childUserId
      );
      return { success: true, data: response.data };
    } catch (error) {
      const apiError = error as ApiError;
      return { success: false, error: apiError };
    }
  }, []);

  /**
   * Fetch hierarchy performance
   */
  const fetchHierarchyPerformance = useCallback(async (campaignId?: string) => {
    setHierarchyPerformance((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));
    try {
      const response = await franchiseService.getFullHierarchyPerformance(
        campaignId
      );
      setHierarchyPerformance({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setHierarchyPerformance({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, []);

  /**
   * Fetch quota utilization
   */
  const fetchQuotaUtilization = useCallback(async () => {
    setQuotaUtilization((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getQuotaUtilization();
      setQuotaUtilization({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setQuotaUtilization({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, []);

  /**
   * Search franchises in hierarchy
   */
  const searchFranchises = useCallback(async (searchTerm: string) => {
    try {
      const response = await franchiseService.searchFranchisesInHierarchy(
        searchTerm
      );
      return { success: true, data: response.data };
    } catch (error) {
      const apiError = error as ApiError;
      return { success: false, error: apiError };
    }
  }, []);

  /**
   * Export data to Excel
   */
  const exportToExcel = useCallback(
    async (type: "performance" | "quota" | "hierarchy") => {
      try {
        const blob = await franchiseService.exportToExcel(type);
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `franchise-${type}-${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { success: true };
      } catch (error) {
        const apiError = error as ApiError;
        return { success: false, error: apiError };
      }
    },
    []
  );

  /**
   * Validate invitation code
   */
  const validateInvitationCode = useCallback(async (code: string) => {
    try {
      const response = await franchiseService.validateInvitationCode(code);
      return {
        success: true,
        valid: response.data.valid,
        message: response.data.message,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return { success: false, error: apiError };
    }
  }, []);

  /**
   * Initialize all data on mount
   */
  const initializeData = useCallback(async () => {
    if (isInitialized) return;

    setIsInitialized(true);
    // Fetch essential data in parallel
    await Promise.all([
      fetchFranchiseDetails(),
      fetchQuota(),
      fetchStatistics(),
    ]);
  }, [isInitialized, fetchFranchiseDetails, fetchQuota, fetchStatistics]);

  /**
   * Refresh all data
   */
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchFranchiseDetails(),
      fetchQuota(),
      fetchStatistics(),
      fetchInvitationCodes(),
      fetchQuotaLedger(),
      fetchChildFranchises(),
    ]);
  }, [
    fetchFranchiseDetails,
    fetchQuota,
    fetchStatistics,
    fetchInvitationCodes,
    fetchQuotaLedger,
    fetchChildFranchises,
  ]);

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return {
    // States
    franchiseDetails,
    quota,
    statistics,
    invitationCodes,
    quotaLedger,
    childFranchises,
    myPerformance,
    childrenPerformance,
    hierarchyPerformance,
    quotaUtilization,

    // Data fetching functions
    fetchFranchiseDetails,
    fetchQuota,
    fetchStatistics,
    fetchInvitationCodes,
    fetchQuotaLedger,
    fetchChildFranchises,
    fetchMyPerformance,
    fetchChildrenPerformance,
    fetchChildPerformance,
    fetchHierarchyPerformance,
    fetchQuotaUtilization,

    // Action functions
    allocateQuota,
    revokeQuota,
    generateInvitationCode,
    searchFranchises,
    exportToExcel,
    validateInvitationCode,

    // Utility functions
    refreshAllData,
  };
};
