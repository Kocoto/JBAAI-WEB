import { useState, useCallback, useRef } from "react";
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

type InvitationCodesState = {
  data: InvitationCode[];
  loading: boolean;
  error: ApiError | null;
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
};

export const useFranchise = () => {
  const navigate = useNavigate();

  const [invitationCodes, setInvitationCodes] = useState<InvitationCodesState>({
    data: [],
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // ✅ Đọc token 1 lần (giảm truy cập localStorage lặp lại)
  const tokenRef = useRef<string>(
    localStorage.getItem("franchise_token") ||
      localStorage.getItem("accessToken") ||
      ""
  );

  // ✅ Gọi API lấy danh sách mã mời (để consumer tự điều khiển thời điểm gọi → tránh trùng)
  const fetchInvitationCodes = useCallback(async (page = 1, limit = 10) => {
    setInvitationCodes((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await franchiseService.getMyInvitationCodes(page, limit, {
        Authorization: `Bearer ${tokenRef.current}`,
      });

      setInvitationCodes({
        data: res.data ?? [],
        loading: false,
        error: null,
        page: res.page ?? page,
        limit,
        total: res.total ?? res.data?.length ?? 0,
        totalPages: res.totalPages ?? 1,
      });
    } catch (error) {
      setInvitationCodes((prev) => ({
        ...prev,
        loading: false,
        error: error as ApiError,
      }));
    }
  }, []);

  const createStandardCode = useCallback(
    async (type: "one_month" | "three_months" | "one_year", qty = 1) => {
      try {
        const res = await franchiseService.createStandardCode(type, qty, {
          Authorization: `Bearer ${tokenRef.current}`,
        });
        await fetchInvitationCodes();
        return { success: true, data: res.data };
      } catch (error) {
        return { success: false, error: error as ApiError };
      }
    },
    [fetchInvitationCodes]
  );

  const fetchFranchiseDetails = useCallback(async () => {
    try {
      await franchiseService.getMyFranchiseDetails();
    } catch {
      // noop
    }
  }, []);

  const activeCode = useCallback(async () => {
    try {
      const res = await franchiseService.activeCode();
      return res;
    } catch (e) {
      return { success: false };
    }
  }, []);

  const allocateQuota = useCallback(async (payload: AllocateQuotaPayload) => {
    try {
      const res = await franchiseService.allocateQuota(payload, {
        Authorization: `Bearer ${tokenRef.current}`,
      });
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }, []);

  // ❌ ĐÃ LOẠI BỎ useEffect auto-fetch để tránh gọi đúp
  return {
    invitationCodes,
    fetchInvitationCodes,
    createStandardCode,
    fetchFranchiseDetails,
    activeCode,
    allocateQuota,
  };
};
