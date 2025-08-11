// franchiseService.ts

import apiClient from "@/shared/services/api/apiClient";
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
  ApiResponse,
  PaginatedResponse,
  ChildFranchise,
  ApiDetailResponse,
} from "../types/franchise.type";

/**
 * Service class for handling all franchise-related API calls
 */
class FranchiseService {
  private readonly basePath = "/api/v1/franchise";

  /**
   * Get current franchise details
   * @returns Promise<ApiResponse<FranchiseDetails>>
   */
  async getMyFranchiseDetails(): Promise<ApiResponse<ApiDetailResponse>> {
    try {
      const response = await apiClient.get(`${this.basePath}/me/details`);
      console.log("sssssssssssss: ", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching franchise details:", error);
      throw error;
    }
  }

  /**
   * Get current franchise quota information
   * @returns Promise<ApiResponse<QuotaInfo>>
   */
  async getMyQuota(): Promise<ApiResponse<QuotaInfo>> {
    try {
      const response = await apiClient.get(`${this.basePath}/me/quota`);
      return response.data;
    } catch (error) {
      console.error("Error fetching quota:", error);
      throw error;
    }
  }

  /**
   * Get current franchise statistics
   * @returns Promise<ApiResponse<FranchiseStatistics>>
   */
  async getMyStatistics(): Promise<ApiResponse<FranchiseStatistics>> {
    try {
      const response = await apiClient.get(`${this.basePath}/me/statistics`);
      return response.data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  }

  /**
   * Get invitation codes for current franchise
   * @returns Promise<ApiResponse<InvitationCode[]>>
   */
  async getMyInvitationCodes(): Promise<ApiResponse<InvitationCode[]>> {
    try {
      const response = await apiClient.get(
        `${this.basePath}/me/invitation-codes`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching invitation codes:", error);
      throw error;
    }
  }

  /**
   * Get user trial quota ledger
   * @param status - Filter by status (active, inactive, expired)
   * @param rootCampaignId - Filter by campaign ID
   * @returns Promise<ApiResponse<UserTrialQuotaLedger[]>>
   */
  async getMyUserTrialQuotaLedger(
    status?: "active" | "inactive" | "expired",
    rootCampaignId?: string
  ): Promise<ApiResponse<UserTrialQuotaLedger[]>> {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (rootCampaignId) params.append("rootCampaignId", rootCampaignId);

      const queryString = params.toString();
      const endpoint = queryString
        ? `${this.basePath}/me/user-trial-quota-ledger?${queryString}`
        : `${this.basePath}/me/user-trial-quota-ledger`;

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching quota ledger:", error);
      throw error;
    }
  }

  /**
   * Allocate quota to child franchise
   * @param payload - Allocation details
   * @returns Promise<ApiResponse<AllocationHistory>>
   */
  async allocateQuotaToChild(
    payload: AllocateQuotaPayload
  ): Promise<ApiResponse<AllocationHistory>> {
    try {
      const response = await apiClient.post(
        `${this.basePath}/manage-children-quota/allocate`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error allocating quota:", error);
      throw error;
    }
  }

  /**
   * Revoke quota allocation from child
   * @param ledgerEntryId - The ledger entry ID to revoke
   * @returns Promise<ApiResponse<{ message: string }>>
   */
  async revokeQuotaFromChild(
    ledgerEntryId: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.put(
        `${this.basePath}/manage-children-quota/revoke-allocation/${ledgerEntryId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error revoking quota:", error);
      throw error;
    }
  }

  /**
   * Get allocation history for a specific child
   * @param childFranchiseUserId - Child franchise user ID
   * @returns Promise<ApiResponse<AllocationHistory[]>>
   */
  async getChildAllocationHistory(
    childFranchiseUserId: string
  ): Promise<ApiResponse<AllocationHistory[]>> {
    try {
      const response = await apiClient.get(
        `${this.basePath}/manage-children-quota/allocation-history/child/${childFranchiseUserId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching allocation history:", error);
      throw error;
    }
  }

  /**
   * Get my trial performance
   * @returns Promise<ApiResponse<TrialPerformance>>
   */
  async getMyTrialPerformance(): Promise<ApiResponse<TrialPerformance>> {
    try {
      const response = await apiClient.get(
        `${this.basePath}/reports/my-trial-performance`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching trial performance:", error);
      throw error;
    }
  }

  /**
   * Get children trial performance summary
   * @returns Promise<ApiResponse<ChildPerformanceSummary[]>>
   */
  async getChildrenTrialPerformanceSummary(): Promise<
    ApiResponse<ChildPerformanceSummary[]>
  > {
    try {
      const response = await apiClient.get(
        `${this.basePath}/reports/children-trial-performance-summary`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching children performance summary:", error);
      throw error;
    }
  }

  /**
   * Get single child trial performance
   * @param childFranchiseUserId - Child franchise user ID
   * @returns Promise<ApiResponse<TrialPerformance>>
   */
  async getChildTrialPerformance(
    childFranchiseUserId: string
  ): Promise<ApiResponse<TrialPerformance>> {
    try {
      const response = await apiClient.get(
        `${this.basePath}/reports/child-trial-performance/${childFranchiseUserId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching child performance:", error);
      throw error;
    }
  }

  /**
   * Get full hierarchy performance
   * @param campaignId - Optional campaign ID filter
   * @returns Promise<ApiResponse<HierarchyPerformance>>
   */
  async getFullHierarchyPerformance(
    campaignId?: string
  ): Promise<ApiResponse<HierarchyPerformance>> {
    try {
      const endpoint = campaignId
        ? `${this.basePath}/reports/full-hierarchy-performance/${campaignId}`
        : `${this.basePath}/reports/full-hierarchy-performance`;

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching hierarchy performance:", error);
      throw error;
    }
  }

  /**
   * Get quota utilization report
   * @returns Promise<ApiResponse<QuotaUtilization>>
   */
  async getQuotaUtilization(): Promise<ApiResponse<QuotaUtilization>> {
    try {
      const response = await apiClient.get(
        `${this.basePath}/reports/quota-utilization`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching quota utilization:", error);
      throw error;
    }
  }

  /**
   * Get child franchises (direct children)
   * @returns Promise<ApiResponse<ChildFranchise[]>>
   */
  async getChildFranchises(): Promise<ApiResponse<ChildFranchise[]>> {
    try {
      const response = await apiClient.get(`${this.basePath}/me/children`);
      return response.data;
    } catch (error) {
      console.error("Error fetching child franchises:", error);
      throw error;
    }
  }

  /**
   * Search franchises in hierarchy
   * @param searchTerm - Search term (name, email, phone)
   * @returns Promise<ApiResponse<ChildFranchise[]>>
   */
  async searchFranchisesInHierarchy(
    searchTerm: string
  ): Promise<ApiResponse<ChildFranchise[]>> {
    try {
      const response = await apiClient.get(
        `${this.basePath}/me/search-hierarchy?q=${encodeURIComponent(
          searchTerm
        )}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching franchises:", error);
      throw error;
    }
  }

  /**
   * Generate new invitation code
   * @param campaignId - Campaign ID for the invitation
   * @returns Promise<ApiResponse<InvitationCode>>
   */
  async generateInvitationCode(
    campaignId: string
  ): Promise<ApiResponse<InvitationCode>> {
    try {
      const response = await apiClient.post(
        `${this.basePath}/me/generate-invitation`,
        {
          campaignId,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating invitation code:", error);
      throw error;
    }
  }

  /**
   * Get franchise hierarchy tree
   * @returns Promise<ApiResponse<ChildFranchise>>
   */
  async getMyHierarchyTree(): Promise<ApiResponse<ChildFranchise>> {
    try {
      const response = await apiClient.get(
        `${this.basePath}/me/hierarchy-tree`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching hierarchy tree:", error);
      throw error;
    }
  }

  /**
   * Export franchise data to Excel
   * @param type - Export type (performance, quota, hierarchy)
   * @returns Promise<Blob>
   */
  async exportToExcel(
    type: "performance" | "quota" | "hierarchy"
  ): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `${this.basePath}/reports/export/${type}`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error exporting data:", error);
      throw error;
    }
  }

  /**
   * Validate invitation code
   * @param code - Invitation code to validate
   * @returns Promise<ApiResponse<{ valid: boolean; message: string }>>
   */
  async validateInvitationCode(
    code: string
  ): Promise<ApiResponse<{ valid: boolean; message: string }>> {
    try {
      const response = await apiClient.post(
        `${this.basePath}/validate-invitation`,
        {
          code,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error validating invitation code:", error);
      throw error;
    }
  }

  async activeCode() {
    try {
      const response = await apiClient.post(`${this.basePath}/code/active`);
      return response.data;
    } catch (error) {
      console.error("Error active code:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const franchiseService = new FranchiseService();
