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

    const response = await apiClient.get(url, {
      headers: {
        "Cache-Control": "no-cache",
        page: String(page),
        limit: String(limit),
        ...(extraHeaders || {}),
      },
    });

    const body = response.data as any;

    const list: InvitationCode[] = Array.isArray(body?.data?.data)
      ? body.data.data
      : Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.results)
      ? body.results
      : Array.isArray(body)
      ? body
      : [];

    const pag = body?.data?.pagination ??
      body?.pagination ?? {
        total: body?.data?.totalDocs ?? body?.total ?? list.length ?? 0,
        page: body?.data?.page ?? body?.page ?? page,
        limit,
        totalPages:
          body?.data?.totalPages ??
          body?.totalPages ??
          Math.max(1, Math.ceil((body?.total ?? list.length ?? 0) / limit)),
      };

    return {
      data: list,
      total: Number(pag.total) || list.length || 0,
      page: Number(pag.page) || page,
      limit: Number(pag.limit) || limit,
      totalPages: Number(pag.totalPages) || 1,
    };
  }

  /**
   * Tìm mã theo prefixCode
   * GET /api/v1/franchise/code/find-by-prefix?prefix=MH
   */
  async findCodesByPrefix(
    prefix: string,
    extraHeaders?: Record<string, string>
  ): Promise<InvitationCode[]> {
    const params = new URLSearchParams();
    params.set("prefix", prefix);
    params.set("ts", String(Date.now()));

    const url = `${this.basePath}/code/find-by-prefix?${params.toString()}`;
    this.log("GET", url);

    const response = await apiClient.get(url, {
      headers: {
        "Cache-Control": "no-cache",
        ...(extraHeaders || {}),
      },
    });

    const body = response.data as any;
    const list: InvitationCode[] = Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body)
      ? body
      : [];

    return list;
  }

  /**
   * Tạo mã mời chuẩn (1/3/12 tháng).
   * Có prefixCode (tùy chọn), không giới hạn max ở FE.
   */
  async createStandardCode(
    type: "one_month" | "three_months" | "one_year",
    qty = 1,
    extraHeaders?: Record<string, string>,
    prefixCode?: string
  ): Promise<{ success?: boolean; data: InvitationCode[] }> {
    const url = `${this.basePath}/code/create-standard`;

    const safeQty = Math.max(1, Math.floor(qty || 0));

    const payload: Record<string, any> = {
      codeType: type,
      numberInvitationCodes: String(safeQty),
    };
    if (prefixCode && prefixCode.trim()) {
      payload.prefixCode = prefixCode.trim();
    }

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

  /** (Nếu BE cần theo id) cũng hỗ trợ prefixCode, không giới hạn max */
  async createStandardCodeById(
    codeTypeId: string,
    qty = 1,
    extraHeaders?: Record<string, string>,
    prefixCode?: string
  ): Promise<{ success?: boolean; data: InvitationCode[] }> {
    const url = `${this.basePath}/code/create-standard`;

    const safeQty = Math.max(1, Math.floor(qty || 0));

    const payload: Record<string, any> = {
      codeTypeId,
      numberInvitationCodes: String(safeQty),
    };
    if (prefixCode && prefixCode.trim()) {
      payload.prefixCode = prefixCode.trim();
    }
 
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
  ) {
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

  async allocateQuotaToChild(payload: AllocateQuotaPayload) {
    const url = `${this.basePath}/manage-children-quota/allocate`;
    this.log("POST", url, payload);
    const response = await apiClient.post(url, payload);
    return response.data;
  }

  async revokeQuotaFromChild(ledgerEntryId: string) {
    const url = `${this.basePath}/manage-children-quota/revoke-allocation/${ledgerEntryId}`;
    this.log("PUT", url);
    const response = await apiClient.put(url);
    return response.data;
  }

  async getMyTrialPerformance() {
    const url = `${
      this.basePath
    }/reports/my-trial-performance?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  async getChildrenTrialPerformanceSummary() {
    const url = `${
      this.basePath
    }/reports/children-trial-performance-summary?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  async getQuotaUtilization() {
    const url = `${this.basePath}/reports/quota-utilization?ts=${Date.now()}`;
    this.log("GET", url); 
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  async validateInvitationCode(code: string) {
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

  async allocateQuota(
    payload: AllocateQuotaPayload,
    extraHeaders?: Record<string, string>
  ) {
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
