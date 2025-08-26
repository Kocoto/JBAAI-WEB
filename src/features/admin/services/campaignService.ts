// src/features/admin/services/campaignService.ts

import apiClient from "@/shared/services/api/apiClient";
import {
  CampaignListResponse,
  CampaignDetailResponse,
  CreateCampaignPayload,
  CreateCampaignResponse,
  UpdateCampaignPayload,
  UpdateCampaignResponse,
  ChangeCampaignStatusPayload,
  ChangeCampaignStatusResponse,
  DeleteCampaignResponse,
  CampaignStatisticsResponse,
  CampaignPerformanceSummaryResponse,
  CampaignListFilters,
  CAMPAIGN_STATUS,
} from "../types/campaign.types";

/**
 * Campaign Service - Handles all campaign-related API calls
 */
class CampaignServiceClass {
  private readonly basePath = "/api/v1/admin/campaigns";

  /**
   * Create a new campaign
   * @param payload - Campaign creation data
   * @returns Promise<CreateCampaignResponse>
   */
  async createCampaign(
    payload: CreateCampaignPayload
  ): Promise<CreateCampaignResponse> {
    try {
      console.log("createCampaign payload", payload);
      const response = await apiClient.post<CreateCampaignResponse>(
        this.basePath,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error("Error creating campaign:", error.response.data.message);
      throw error;
    }
  }

  /**
   * Get list of campaigns with filters and pagination
   * @param filters - Optional filters for the campaign list
   * @returns Promise<CampaignListResponse>
   */
  async getCampaignList(
    filters?: CampaignListFilters
  ): Promise<CampaignListResponse> {
    try {
      const params = new URLSearchParams();

      // Add pagination parameters
      if (filters?.page) {
        params.append("page", filters.page.toString());
      }
      if (filters?.limit) {
        params.append("limit", filters.limit.toString());
      }

      // Add filter parameters
      if (filters?.status) {
        params.append("status", filters.status);
      }
      if (filters?.franchiseOwnerId) {
        params.append("franchiseOwnerId", filters.franchiseOwnerId);
      }
      if (filters?.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters?.endDate) {
        params.append("endDate", filters.endDate);
      }
      if (filters?.search) {
        params.append("search", filters.search);
      }

      const queryString = params.toString();
      const endpoint = queryString
        ? `${this.basePath}?${queryString}`
        : this.basePath;

      const response = await apiClient.get<CampaignListResponse>(endpoint);
      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching campaign list:",
        error.response.data.message
      );
      throw error;
    }
  }

  /**
   * Get campaign by ID
   * @param campaignId - The campaign ID
   * @returns Promise<CampaignDetailResponse>
   */
  async getCampaignById(campaignId: string): Promise<CampaignDetailResponse> {
    try {
      const response = await apiClient.get<CampaignDetailResponse>(
        `${this.basePath}/${campaignId}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching campaign by ID:",
        error.response.data.message
      );
      throw error;
    }
  }

  /**
   * Update campaign
   * @param campaignId - The campaign ID
   * @param payload - Update data
   * @returns Promise<UpdateCampaignResponse>
   */
  async updateCampaign(
    campaignId: string,
    payload: UpdateCampaignPayload
  ): Promise<UpdateCampaignResponse> {
    try {
      const response = await apiClient.put<UpdateCampaignResponse>(
        `${this.basePath}/${campaignId}`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error("Error updating campaign:", error.response.data.message);
      throw error;
    }
  }

  /**
   * Change campaign status
   * @param campaignId - The campaign ID
   * @param status - New status
   * @returns Promise<ChangeCampaignStatusResponse>
   */
  async changeCampaignStatus(
    campaignId: string,
    status: (typeof CAMPAIGN_STATUS)[keyof typeof CAMPAIGN_STATUS]
  ): Promise<ChangeCampaignStatusResponse> {
    try {
      const payload: ChangeCampaignStatusPayload = { status };
      const response = await apiClient.patch<ChangeCampaignStatusResponse>(
        `${this.basePath}/${campaignId}/status`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error changing campaign status:",
        error.response.data.message
      );
      throw error;
    }
  }

  /**
   * Delete campaign (soft delete)
   * @param campaignId - The campaign ID
   * @returns Promise<DeleteCampaignResponse>
   */
  async deleteCampaign(campaignId: string): Promise<DeleteCampaignResponse> {
    try {
      const response = await apiClient.delete<DeleteCampaignResponse>(
        `${this.basePath}/${campaignId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error deleting campaign:", error.response.data.message);
      throw error;
    }
  }

  /**
   * Get campaign statistics
   * @returns Promise<CampaignStatisticsResponse>
   */
  async getCampaignStatistics(): Promise<CampaignStatisticsResponse> {
    try {
      const response = await apiClient.get<CampaignStatisticsResponse>(
        `${this.basePath}/statistics`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching campaign statistics:",
        error.response.data.message
      );
      throw error;
    }
  }

  /**
   * Get campaign performance summary
   * @param campaignId - The campaign ID
   * @returns Promise<CampaignPerformanceSummaryResponse>
   */
  async getCampaignPerformanceSummary(
    campaignId: string
  ): Promise<CampaignPerformanceSummaryResponse> {
    try {
      const response = await apiClient.get<CampaignPerformanceSummaryResponse>(
        `${this.basePath}/${campaignId}/performance-summary`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching campaign performance summary:",
        error.response.data.message
      );
      throw error;
    }
  }

  /**
   * Get active campaigns
   * @param filters - Additional filters
   * @returns Promise<CampaignListResponse>
   */
  async getActiveCampaigns(
    filters?: Omit<CampaignListFilters, "status">
  ): Promise<CampaignListResponse> {
    return this.getCampaignList({ ...filters, status: CAMPAIGN_STATUS.ACTIVE });
  }

  /**
   * Get campaigns by franchise owner
   * @param franchiseOwnerId - The franchise owner ID
   * @param filters - Additional filters
   * @returns Promise<CampaignListResponse>
   */
  async getCampaignsByFranchiseOwner(
    franchiseOwnerId: string,
    filters?: Omit<CampaignListFilters, "franchiseOwnerId">
  ): Promise<CampaignListResponse> {
    return this.getCampaignList({ ...filters, franchiseOwnerId });
  }

  /**
   * Search campaigns
   * @param searchTerm - Search term for campaign name
   * @param filters - Additional filters
   * @returns Promise<CampaignListResponse>
   */
  async searchCampaigns(
    searchTerm: string,
    filters?: Omit<CampaignListFilters, "search">
  ): Promise<CampaignListResponse> {
    return this.getCampaignList({ ...filters, search: searchTerm });
  }

  /**
   * Get campaigns by date range
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @param filters - Additional filters
   * @returns Promise<CampaignListResponse>
   */
  async getCampaignsByDateRange(
    startDate: string,
    endDate: string,
    filters?: Omit<CampaignListFilters, "startDate" | "endDate">
  ): Promise<CampaignListResponse> {
    return this.getCampaignList({ ...filters, startDate, endDate });
  }

  /**
   * Expire campaign
   * @param campaignId - The campaign ID
   * @returns Promise<ChangeCampaignStatusResponse>
   */
  async expireCampaign(
    campaignId: string
  ): Promise<ChangeCampaignStatusResponse> {
    return this.changeCampaignStatus(campaignId, CAMPAIGN_STATUS.EXPIRED);
  }

  /**
   * Activate campaign
   * @param campaignId - The campaign ID
   * @returns Promise<ChangeCampaignStatusResponse>
   */
  async activateCampaign(
    campaignId: string
  ): Promise<ChangeCampaignStatusResponse> {
    return this.changeCampaignStatus(campaignId, CAMPAIGN_STATUS.ACTIVE);
  }

  /**
   * Deactivate campaign
   * @param campaignId - The campaign ID
   * @returns Promise<ChangeCampaignStatusResponse>
   */
  async deactivateCampaign(
    campaignId: string
  ): Promise<ChangeCampaignStatusResponse> {
    return this.changeCampaignStatus(campaignId, CAMPAIGN_STATUS.INACTIVE);
  }
}

// Export singleton instance
export const CampaignService = new CampaignServiceClass();
