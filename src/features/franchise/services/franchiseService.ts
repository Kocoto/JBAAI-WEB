// src/services/franchiseService.ts
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
    if (process.env.NODE_ENV !== "production") {
      console.log(`[FranchiseService] ${method} ${url}`, body ?? "");
    }
  }

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

  async getMyInvitationCodes(): Promise<ApiResponse<InvitationCode[]>> {
    const url = `${this.basePath}/me/invitation-codes?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

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

  async getChildAllocationHistory(
    childFranchiseUserId: string
  ): Promise<ApiResponse<AllocationHistory[]>> {
    const url = `${
      this.basePath
    }/manage-children-quota/allocation-history/child/${childFranchiseUserId}?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
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

  async getChildTrialPerformance(
    childFranchiseUserId: string
  ): Promise<ApiResponse<TrialPerformance>> {
    const url = `${
      this.basePath
    }/reports/child-trial-performance/${childFranchiseUserId}?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  async getFullHierarchyPerformance(
    campaignId?: string
  ): Promise<ApiResponse<HierarchyPerformance>> {
    const url = campaignId
      ? `${
          this.basePath
        }/reports/full-hierarchy-performance/${campaignId}?ts=${Date.now()}`
      : `${this.basePath}/reports/full-hierarchy-performance?ts=${Date.now()}`;
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

  async getChildFranchises(): Promise<ApiResponse<ChildFranchise[]>> {
    const url = `${this.basePath}/me/children?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  async searchFranchisesInHierarchy(
    searchTerm: string
  ): Promise<ApiResponse<ChildFranchise[]>> {
    const url = `${this.basePath}/me/search-hierarchy?q=${encodeURIComponent(
      searchTerm
    )}&ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  /** Legacy: bằng campaignId */
  async generateInvitationCode(
    campaignId: string
  ): Promise<ApiResponse<InvitationCode>> {
    const url = `${this.basePath}/me/generate-invitation`;
    const payload = { campaignId };
    this.log("POST", url, payload);
    const response = await apiClient.post(url, payload);
    return response.data;
  }

  /** NEW: create-standard trả MẢNG InvitationCode */
  async createStandardCode(
    type: "one_month" | "three_months" | "one_year"
  ): Promise<ApiResponse<InvitationCode[]>> {
    const codeTypeId = this.STANDARD_CODE_TYPE_IDS[type];
    const url = `${this.basePath}/code/create-standard`;
    const payload = { codeTypeId };
    this.log("POST", url, payload);
    const response = await apiClient.post(url, payload);
    return response.data; // data: InvitationCode[]
  }

  async createStandardCodeById(
    codeTypeId: string
  ): Promise<ApiResponse<InvitationCode[]>> {
    const url = `${this.basePath}/code/create-standard`;
    const payload = { codeTypeId };
    this.log("POST", url, payload);
    const response = await apiClient.post(url, payload);
    return response.data;
  }

  async getMyHierarchyTree(): Promise<ApiResponse<ChildFranchise>> {
    const url = `${this.basePath}/me/hierarchy-tree?ts=${Date.now()}`;
    this.log("GET", url);
    const response = await apiClient.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  }

  async exportToExcel(
    type: "performance" | "quota" | "hierarchy"
  ): Promise<Blob> {
    const url = `${this.basePath}/reports/export/${type}`;
    this.log("GET", url);
    const response = await apiClient.get(url, { responseType: "blob" });
    return response.data;
  }

  /** validate (nếu BE có) */
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
}

export const franchiseService = new FranchiseService();
export type StandardCodeType = keyof FranchiseService["STANDARD_CODE_TYPE_IDS"];
