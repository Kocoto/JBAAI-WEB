// src/features/admin/services/franchiseService.ts

import apiClient from "../../../shared/services/api/apiClient";
import {
  Franchise,
  FranchiseListResponse,
  FranchiseHierarchyResponse,
  FranchiseStatisticsResponse,
  FranchiseListFilters,
} from "../types/franchise.types";

/**
 * Franchise Service - Handles all franchise-related API calls
 */
class FranchiseServiceClass {
  private readonly basePath = "/api/v1/admin/franchises";

  /**
   * Get list of franchises with filters and pagination
   * @param filters - Optional filters for the franchise list
   * @returns Promise<FranchiseListResponse>
   */
  async getFranchiseList(
    filters?: FranchiseListFilters
  ): Promise<FranchiseListResponse> {
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
      if (filters?.level !== undefined) {
        params.append("level", filters.level.toString());
      }
      if (filters?.search) {
        params.append("search", filters.search);
      }
      if (filters?.parentId) {
        params.append("parentId", filters.parentId);
      }

      const queryString = params.toString();
      const endpoint = queryString
        ? `${this.basePath}?${queryString}`
        : this.basePath;

      const response = await apiClient.get(endpoint);
      // console.log(
      //   "🚀 ~ file: franchiseService.ts:64 ~ FranchiseServiceClass ~ getFranchiseList ~ response:",
      //   response.data
      // );
      return response.data.data;
    } catch (error: any) {
      console.error(
        "Error fetching franchise list:",
        error.response.data.message
      );
      throw error;
    }
  }

  /**
   * Get franchise by ID
   * @param franchiseId - The franchise ID
   * @returns Promise<Franchise>
   */
  async getFranchiseById(franchiseId: string): Promise<Franchise> {
    try {
      const response = await apiClient.get<{ data: Franchise }>(
        `${this.basePath}/${franchiseId}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error(
        "Error fetching franchise by ID:",
        error.response.data.message
      );
      throw error;
    }
  }

  /**
   * Get franchise hierarchy for a specific user
   * @param userId - The user ID of the franchise owner
   * @returns Promise<FranchiseHierarchyResponse>
   */
  async getFranchiseHierarchy(
    userId: string
  ): Promise<FranchiseHierarchyResponse> {
    try {
      const response = await apiClient.get<FranchiseHierarchyResponse>(
        `${this.basePath}/${userId}/hierarchy`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching franchise hierarchy:",
        error.response.data.message
      );
      throw error;
    }
  }

  /**
   * Get franchise statistics
   * @returns Promise<FranchiseStatisticsResponse>
   */
  async getFranchiseStatistics(): Promise<FranchiseStatisticsResponse> {
    try {
      const response = await apiClient.get<FranchiseStatisticsResponse>(
        `${this.basePath}/statistics`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching franchise statistics:",
        error.response.data.message
      );
      throw error;
    }
  }

  /**
   * Update franchise status
   * @param franchiseId - The franchise ID
   * @param status - New status
   * @returns Promise<Franchise>
   */
  async updateFranchiseStatus(
    franchiseId: string,
    status: "active" | "inactive"
  ): Promise<Franchise> {
    try {
      const response = await apiClient.patch<{ data: Franchise }>(
        `${this.basePath}/${franchiseId}/status`,
        { status }
      );
      return response.data.data;
    } catch (error: any) {
      console.error(
        "Error updating franchise status:",
        error.response.data.message
      );
      throw error;
    }
  }

  /**
   * Get franchises by parent ID
   * @param parentId - The parent franchise ID
   * @returns Promise<FranchiseListResponse>
   */
  async getFranchisesByParentId(
    parentId: string
  ): Promise<FranchiseListResponse> {
    return this.getFranchiseList({ parentId });
  }

  /**
   * Get franchises by level
   * @param level - The franchise level
   * @param filters - Additional filters
   * @returns Promise<FranchiseListResponse>
   */
  async getFranchisesByLevel(
    level: number,
    filters?: Omit<FranchiseListFilters, "level">
  ): Promise<FranchiseListResponse> {
    return this.getFranchiseList({ ...filters, level });
  }

  /**
   * Search franchises
   * @param searchTerm - Search term for franchise name, email, or phone
   * @param filters - Additional filters
   * @returns Promise<FranchiseListResponse>
   */
  async searchFranchises(
    searchTerm: string,
    filters?: Omit<FranchiseListFilters, "search">
  ): Promise<FranchiseListResponse> {
    return this.getFranchiseList({ ...filters, search: searchTerm });
  }

  /**
   * Get franchise quota details
   * @param franchiseId - The franchise ID
   * @returns Promise<any>
   */
  async getFranchiseQuotaDetails(franchiseId: string): Promise<any> {
    try {
      const response = await apiClient.get(
        `${this.basePath}/${franchiseId}/quota-details`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching franchise quota details:",
        error.response.data.message
      );
      throw error;
    }
  }
}

// Export singleton instance
export const FranchiseService = new FranchiseServiceClass();
