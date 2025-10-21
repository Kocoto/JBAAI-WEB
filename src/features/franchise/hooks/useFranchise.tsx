import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { franchiseService } from "../services/franchiseService";
import {
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
  ApiDetailResponse,
} from "../types/franchise.type";

interface FranchiseDetailsState {
  data: ApiDetailResponse | null;
  loading: boolean;
  error: ApiError | null;
}
interface QuotaState {
  data: QuotaInfo | null;
  loading: boolean;
  error: ApiError | null;
}
interface StatisticsState {
  data: FranchiseStatistics | null;
  loading: boolean;
  error: ApiError | null;
}
interface InvitationCodesState {
  data: InvitationCode[];
  loading: boolean;
  error: ApiError | null;
}
interface QuotaLedgerState {
  data: UserTrialQuotaLedger[];
  loading: boolean;
  error: ApiError | null;
}
interface ChildFranchisesState {
  data: ChildFranchise[];
  loading: boolean;
  error: ApiError | null;
}
interface PerformanceState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

const hasToken = () =>
  !!(
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("franchise_token") ||
    localStorage.getItem("jwt")
  );

export const useFranchise = () => {
  const navigate = useNavigate();

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
  >({ data: null, loading: false, error: null });
  const [childrenPerformance, setChildrenPerformance] = useState<
    PerformanceState<ChildPerformanceSummary[]>
  >({ data: null, loading: false, error: null });
  const [hierarchyPerformance, setHierarchyPerformance] = useState<
    PerformanceState<HierarchyPerformance>
  >({ data: null, loading: false, error: null });
  const [quotaUtilization, setQuotaUtilization] = useState<
    PerformanceState<QuotaUtilization>
  >({ data: null, loading: false, error: null });
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchFranchiseDetails = useCallback(async () => {
    setFranchiseDetails((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getMyFranchiseDetails();
      setFranchiseDetails({ data: response.data, loading: false, error: null });
    } catch (error) {
      setFranchiseDetails({
        data: null,
        loading: false,
        error: error as ApiError,
      });
    }
  }, []);

  const fetchQuota = useCallback(async () => {
    setQuota((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getMyQuota();
      setQuota({ data: response.data, loading: false, error: null });
    } catch (error) {
      setQuota({ data: null, loading: false, error: error as ApiError });
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    setStatistics((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getMyStatistics();
      setStatistics({ data: response.data, loading: false, error: null });
    } catch (error) {
      setStatistics({ data: null, loading: false, error: error as ApiError });
    }
  }, []);

  const fetchInvitationCodes = useCallback(async () => {
    setInvitationCodes((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getMyInvitationCodes();
      setInvitationCodes({
        data: response.data ?? [],
        loading: false,
        error: null,
      });
    } catch (error) {
      setInvitationCodes({
        data: [],
        loading: false,
        error: error as ApiError,
      });
    }
  }, []);

  const fetchQuotaLedger = useCallback(
    async (status?: "active" | "inactive" | "expired", campaignId?: string) => {
      setQuotaLedger((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await franchiseService.getMyUserTrialQuotaLedger(
          status,
          campaignId
        );
        setQuotaLedger({ data: response.data, loading: false, error: null });
      } catch (error) {
        setQuotaLedger({ data: [], loading: false, error: error as ApiError });
      }
    },
    []
  );

  const fetchChildFranchises = useCallback(async () => {
    setChildFranchises((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getChildFranchises();
      setChildFranchises({ data: response.data, loading: false, error: null });
    } catch (error) {
      setChildFranchises({
        data: [],
        loading: false,
        error: error as ApiError,
      });
    }
  }, []);

  const fetchMyPerformance = useCallback(async () => {
    setMyPerformance((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getMyTrialPerformance();
      setMyPerformance({ data: response.data, loading: false, error: null });
    } catch (error) {
      setMyPerformance({
        data: null,
        loading: false,
        error: error as ApiError,
      });
    }
  }, []);

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
      setChildrenPerformance({
        data: null,
        loading: false,
        error: error as ApiError,
      });
    }
  }, []);

  const fetchChildPerformance = useCallback(async (childUserId: string) => {
    try {
      const response = await franchiseService.getChildTrialPerformance(
        childUserId
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }, []);

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
      setHierarchyPerformance({
        data: null,
        loading: false,
        error: error as ApiError,
      });
    }
  }, []);

  const fetchQuotaUtilization = useCallback(async () => {
    setQuotaUtilization((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await franchiseService.getQuotaUtilization();
      setQuotaUtilization({ data: response.data, loading: false, error: null });
    } catch (error) {
      setQuotaUtilization({
        data: null,
        loading: false,
        error: error as ApiError,
      });
    }
  }, []);

  // Actions
  const allocateQuota = useCallback(
    async (payload: AllocateQuotaPayload) => {
      try {
        const response = await franchiseService.allocateQuotaToChild(payload);
        await Promise.all([fetchQuota(), fetchQuotaLedger()]);
        return { success: true, data: response.data as AllocationHistory };
      } catch (error) {
        return { success: false, error: error as ApiError };
      }
    },
    [fetchQuota, fetchQuotaLedger]
  );

  const revokeQuota = useCallback(
    async (ledgerEntryId: string) => {
      try {
        const response = await franchiseService.revokeQuotaFromChild(
          ledgerEntryId
        );
        await Promise.all([fetchQuota(), fetchQuotaLedger()]);
        return { success: true, message: response.data.message };
      } catch (error) {
        return { success: false, error: error as ApiError };
      }
    },
    [fetchQuota, fetchQuotaLedger]
  );

  const generateInvitationCode = useCallback(
    async (campaignId: string) => {
      try {
        const response = await franchiseService.generateInvitationCode(
          campaignId
        );
        await fetchInvitationCodes();
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error as ApiError };
      }
    },
    [fetchInvitationCodes]
  );

  const createStandardOneMonth = useCallback(
    async (qty = 1) => {
      try {
        const res = await franchiseService.createStandardCode("one_month", qty);
        await fetchInvitationCodes();
        return { success: true, data: res.data };
      } catch (error) {
        return { success: false, error: error as ApiError };
      }
    },
    [fetchInvitationCodes]
  );

  const createStandardThreeMonths = useCallback(
    async (qty = 1) => {
      try {
        const res = await franchiseService.createStandardCode(
          "three_months",
          qty
        );
        await fetchInvitationCodes();
        return { success: true, data: res.data };
      } catch (error) {
        return { success: false, error: error as ApiError };
      }
    },
    [fetchInvitationCodes]
  );

  const createStandardOneYear = useCallback(
    async (qty = 1) => {
      try {
        const res = await franchiseService.createStandardCode("one_year", qty);
        await fetchInvitationCodes();
        return { success: true, data: res.data };
      } catch (error) {
        return { success: false, error: error as ApiError };
      }
    },
    [fetchInvitationCodes]
  );

  const createStandardById = useCallback(
    async (codeTypeId: string, qty = 1) => {
      try {
        const res = await franchiseService.createStandardCodeById(
          codeTypeId,
          qty
        );
        await fetchInvitationCodes();
        return { success: true, data: res.data };
      } catch (error) {
        return { success: false, error: error as ApiError };
      }
    },
    [fetchInvitationCodes]
  );

  const validateInvitationCode = useCallback(async (code: string) => {
    try {
      const response = await franchiseService.validateInvitationCode(code);
      return {
        success: true,
        valid: response.data.valid,
        message: response.data.message,
      };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }, []);

  const activeCode = useCallback(async () => {
    try {
      const response = await franchiseService.activeCode();
      await fetchInvitationCodes();
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }, [fetchInvitationCodes]);

  const initializeData = useCallback(async () => {
    if (isInitialized) return;
    if (!hasToken()) return;
    setIsInitialized(true);
    await Promise.all([
      fetchFranchiseDetails(),
      fetchQuota(),
      fetchStatistics(),
      fetchInvitationCodes(),
    ]);
  }, [
    isInitialized,
    fetchFranchiseDetails,
    fetchQuota,
    fetchStatistics,
    fetchInvitationCodes,
  ]);

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

    // Fetchers
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

    // Actions
    allocateQuota,
    revokeQuota,
    generateInvitationCode,
    createStandardOneMonth,
    createStandardThreeMonths,
    createStandardOneYear,
    createStandardById,
    validateInvitationCode,
    activeCode,

    // Utils
    refreshAllData,
  };
};
