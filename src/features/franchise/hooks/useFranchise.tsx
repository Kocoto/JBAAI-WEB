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

  /** Gọi API lấy danh sách mã mời — endpoint giống Postman: /api/v1/franchise/me/invitation-codes */
  const fetchInvitationCodes = useCallback(async (page = 1, limit = 10) => {
    setInvitationCodes((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const token =
        localStorage.getItem("franchise_token") ||
        localStorage.getItem("accessToken") ||
        "";
      const res = await franchiseService.getMyInvitationCodes(page, limit, {
        Authorization: `Bearer ${token}`,
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

  /** Tạo mã mời 1/3/12 tháng */
  const createStandardCode = useCallback(
    async (type: "one_month" | "three_months" | "one_year", qty = 1) => {
      const token =
        localStorage.getItem("franchise_token") ||
        localStorage.getItem("accessToken") ||
        "";
      try {
        const res = await franchiseService.createStandardCode(type, qty, {
          Authorization: `Bearer ${token}`,
        });
        await fetchInvitationCodes();
        return { success: true, data: res.data };
      } catch (error) {
        return { success: false, error: error as ApiError };
      }
    },
    [fetchInvitationCodes]
  );

  /** Giữ tương thích UI cũ */
  const fetchFranchiseDetails = useCallback(async () => {
    try {
      await franchiseService.getMyFranchiseDetails();
    } catch {
      // noop: chỉ để đảm bảo UI cũ không lỗi
    }
  }, []);

  /** Giữ tương thích UI cũ: kích hoạt code */
  const activeCode = useCallback(async () => {
    try {
      const res = await franchiseService.activeCode();
      return res;
    } catch (e) {
      return { success: false };
    }
  }, []);

  /** ✅ THÊM: Allocate quota vào endpoint /api/v1/franchise/me/quota */
  const allocateQuota = useCallback(async (payload: AllocateQuotaPayload) => {
    const token =
      localStorage.getItem("franchise_token") ||
      localStorage.getItem("accessToken") ||
      "";
    try {
      const res = await franchiseService.allocateQuota(payload, {
        Authorization: `Bearer ${token}`,
      });
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }, []);

  useEffect(() => {
    fetchInvitationCodes(1, 10);
  }, [fetchInvitationCodes]);

  return {
    invitationCodes,
    fetchInvitationCodes,
    createStandardCode,
    // tương thích các màn cũ
    fetchFranchiseDetails,
    activeCode,
    // ✅ trả về thêm allocateQuota
    allocateQuota,
  };
};
