import apiClient from "@/shared/services/api/apiClient";
import {
  FranchiseStatistics,
  InvitationCode,
  UserTrialQuotaLedger,
  AllocateQuotaPayload,
  AllocationHistory,
  TrialPerformance,
  ChildPerformanceSummary,
  HierarchyPerformance,
  QuotaUtilization,
  ApiResponse,
  ChildFranchise,
  ApiDetailResponse,
  QuotaInfo,
} from "../types/franchise.type";

class FranchiseService {
  private readonly basePath = "/api/v1/franchise";

  private readonly STANDARD_CODE_TYPE_IDS = {
    one_month: "683d1e58d70c0d6366e3d716",
    three_months: "68cbc381bd30e2a1315d2709",
    one_year: "683d2295d70c0d6366e3d741",
  } as const;

  private log(method: string, url: string, body?: unknown) {
    if (import.meta.env.MODE !== "production") {
      console.log(`[FranchiseService] ${method} ${url}`, body ?? "");
    }
  }

  // ==================== FRANCHISE INFO ====================
  async getMyFranchiseDetails(): Promise<ApiResponse<ApiDetailResponse>> {
    const url = `${this.basePath}/me/details`;
    this.log("GET", url);
    const response = await apiClient.get(url);
    return response.data;
  }

  async getMyQuota(): Promise<ApiResponse<QuotaInfo>> {
    const url = `${this.basePath}/me/quota?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  async getMyStatistics(): Promise<ApiResponse<FranchiseStatistics>> {
    const url = `${this.basePath}/me/statistics?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  // ==================== INVITATION CODES ====================

  /**
   * Lấy danh sách mã mời như Postman:
   * GET /api/v1/franchise/me/invitation-codes
   * - Trả về mảng InvitationCode (có statistics, currentLedgerInfo,...)
   * - Giữ nguyên chữ ký (page, limit, extraHeaders, packageId) để không phá chỗ khác,
   *   nhưng endpoint này KHÔNG dùng page/limit header.
   */
  async getMyInvitationCodes(
    page = 1,
    limit = 10,
    extraHeaders?: Record<string, string>,
    packageId?: string
  ): Promise<{
    data: InvitationCode[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  }> {
    const qs = new URLSearchParams();
    if (packageId) qs.set("packageId", packageId);
    qs.set("ts", String(Date.now()));

    const url = `${this.basePath}/me/invitation-codes${
      qs.toString() ? `?${qs.toString()}` : ""
    }`;
    this.log("GET", url);

    const res = await apiClient.get(url, {
      headers: {
        "Cache-Control": "no-cache",
        ...(extraHeaders || {}),
      },
    });

    const body = res.data as any;

    // Hỗ trợ cả 2 kiểu bao dữ liệu (một số BE trả {data: []}, số khác {data:{data:[]}})
    const list: InvitationCode[] = Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.data?.data)
      ? body.data.data
      : [];

    return {
      data: list,
      // endpoint này thường không phân trang -> fallback số liệu cơ bản
      total: body?.data?.totalDocs ?? list.length,
      page: body?.data?.page ?? page,
      limit,
      totalPages: body?.data?.totalPages ?? 1,
    };
  }

  /**
   * Tạo mã mời theo loại codeType (1 tháng / 3 tháng / 1 năm)
   * Header có thể thêm Authorization giống Postman
   */
  async createStandardCode(
    type: "one_month" | "three_months" | "one_year",
    qty = 1,
    extraHeaders?: Record<string, string>
  ): Promise<{ success?: boolean; data: InvitationCode[] }> {
    const url = `${this.basePath}/code/create-standard`;
    const payload = {
      codeType: type,
      numberInvitationCodes: String(Math.max(1, Math.min(1000, qty))),
    };
    this.log("POST", url, payload);
    const response = await apiClient.post(url, payload, {
      headers: {
        "Cache-Control": "no-cache",
        ...(extraHeaders || {}),
      },
    });
    const body = response.data as any;
    return {
      success: !!body?.success,
      data: Array.isArray(body?.data) ? body.data : [],
    };
  }

  /**
   * Tạo mã mời theo ID codeType
   */
  async createStandardCodeById(
    codeTypeId: string,
    qty = 1,
    extraHeaders?: Record<string, string>
  ): Promise<{ success?: boolean; data: InvitationCode[] }> {
    const url = `${this.basePath}/code/create-standard`;
    const payload = {
      codeTypeId,
      numberInvitationCodes: String(Math.max(1, Math.min(1000, qty))),
    };
    this.log("POST", url, payload);
    const response = await apiClient.post(url, payload, {
      headers: {
        "Cache-Control": "no-cache",
        ...(extraHeaders || {}),
      },
    });
    const body = response.data as any;
    return {
      success: !!body?.success,
      data: Array.isArray(body?.data) ? body.data : [],
    };
  }

  // ==================== OTHERS ====================

  async getMyUserTrialQuotaLedger(
    status?: "active" | "inactive" | "expired",
    rootCampaignId?: string
  ): Promise<ApiResponse<UserTrialQuotaLedger[]>> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (rootCampaignId) params.append("rootCampaignId", rootCampaignId);
    const qs = params.toString();
    const url = qs
      ? `${this.basePath}/me/user-trial-quota-ledger?${qs}&ts=${Date.now()}`
      : `${this.basePath}/me/user-trial-quota-ledger?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  async allocateQuotaToChild(
    payload: AllocateQuotaPayload
  ): Promise<ApiResponse<AllocationHistory>> {
    const url = `${this.basePath}/manage-children-quota/allocate`;
    this.log("POST", url, payload);
    const response = await apiClient.post(url, payload);
    return response.data;
  }

  async revokeQuotaFromChild(
    ledgerEntryId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const url = `${this.basePath}/manage-children-quota/revoke-allocation/${ledgerEntryId}`;
    this.log("PUT", url);
    const response = await apiClient.put(url);
    return response.data;
  }

  async getMyTrialPerformance(): Promise<ApiResponse<TrialPerformance>> {
    const url = `${
      this.basePath
    }/reports/my-trial-performance?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  async getChildrenTrialPerformanceSummary(): Promise<
    ApiResponse<ChildPerformanceSummary[]>
  > {
    const url = `${
      this.basePath
    }/reports/children-trial-performance-summary?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  async getQuotaUtilization(): Promise<ApiResponse<QuotaUtilization>> {
    const url = `${this.basePath}/reports/quota-utilization?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  async validateInvitationCode(
    code: string
  ): Promise<ApiResponse<{ valid: boolean; message: string }>> {
    const url = `${this.basePath}/code/validate`;
    const payload = { code };
    this.log("POST", url, payload);
    const response = await apiClient.post(url, payload);
    return response.data;
  }

  async activeCode() {
    const url = `${this.basePath}/code/active`;
    this.log("POST", url);
    const response = await apiClient.post(url);
    return response.data;
  }

  /** ✅ THÊM: Allocate quota vào endpoint /api/v1/franchise/me/quota */
  async allocateQuota(
    payload: AllocateQuotaPayload,
    extraHeaders?: Record<string, string>
  ): Promise<ApiResponse<any>> {
    const url = `${this.basePath}/me/quota`;
    this.log("POST", url, payload);
    const response = await apiClient.post(url, payload, {
      headers: {
        "Cache-Control": "no-cache",
        ...(extraHeaders || {}),
      },
    });
    return response.data;
  }
}

export const franchiseService = new FranchiseService();
export type StandardCodeType = keyof FranchiseService["STANDARD_CODE_TYPE_IDS"];
