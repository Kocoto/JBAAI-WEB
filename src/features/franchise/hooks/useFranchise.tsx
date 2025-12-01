// src/features/franchise/hooks/useFranchise.ts
import { useState, useCallback, useRef } from "react";
import { franchiseService } from "../services/franchiseService";
import {
  InvitationCode,
  AllocateQuotaPayload,
  ApiError,
} from "../types/franchise.type";

const INVITATION_CACHE_KEY = "franchise_invitation_codes_cache_v2";

type InvitationCodesState = {
  data: InvitationCode[];
  loading: boolean; // dùng khi lần đầu fetch mà chưa có data
  refreshing: boolean; // dùng khi đã có data và đang cập nhật nền
  error: ApiError | null;
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
};

function readCache(): InvitationCode[] | null {
  try {
    const raw = localStorage.getItem(INVITATION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.data)
      ? (parsed.data as InvitationCode[])
      : null;
  } catch {
    return null;
  }
}

function writeCache(data: InvitationCode[]) {
  try {
    localStorage.setItem(
      INVITATION_CACHE_KEY,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {
    // ignore
  }
}

export const useFranchise = () => {
  const cacheData = readCache();

  const [invitationCodes, setInvitationCodes] = useState<InvitationCodesState>({
    data: cacheData ?? [],
    loading: false, // ❗ KHÔNG auto loading lần 1
    refreshing: false,
    error: null,
    page: 1,
    limit: 10,
    total: cacheData?.length ?? 0,
    totalPages: 1,
  });

  // Đọc token một lần
  const tokenRef = useRef<string>(
    localStorage.getItem("franchise_token") ||
      localStorage.getItem("accessToken") ||
      ""
  );

  // ❗ Chỉ gọi hàm này khi bạn CHỦ ĐỘNG gọi (bấm refresh / sau activeCode)
  const fetchInvitationCodes = useCallback(async (page = 1, limit = 10) => {
    setInvitationCodes((prev) => ({
      ...prev,
      loading: prev.data.length === 0, // lần đầu chưa có data -> show spinner
      refreshing: prev.data.length > 0, // đã có data -> chỉ báo "đang cập nhật"
      error: null,
    }));

    try {
      const res = await franchiseService.getMyInvitationCodes(page, limit, {
        Authorization: `Bearer ${tokenRef.current}`,
      });

      const data = res.data ?? [];

      writeCache(data);

      setInvitationCodes({
        data,
        loading: false,
        refreshing: false,
        error: null,
        page: res.page ?? page,
        limit,
        total: res.total ?? data.length ?? 0,
        totalPages: res.totalPages ?? 1,
      });
    } catch (error) {
      setInvitationCodes((prev) => ({
        ...prev,
        loading: false,
        refreshing: false,
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
      // không phá UI
    }
  }, []);

  const activeCode = useCallback(async () => {
    try {
      const res = await franchiseService.activeCode();
      return res;
    } catch {
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

  return {
    invitationCodes,
    fetchInvitationCodes,
    createStandardCode,
    fetchFranchiseDetails,
    activeCode,
    allocateQuota,
  };
};
