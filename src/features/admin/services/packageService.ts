// src/features/admin/services/packageService.ts

import apiClient from "@/shared/services/api/apiClient";
import {
  Package,
  PackageListResponse,
  PackageByTypeResponse,
  PackageDetailResponse,
  CreatePackagePayload,
  CreatePackageResponse,
  UpdatePackagePayload,
  UpdatePackageResponse,
  DeletePackageResponse,
  PackageStatisticsResponse,
  PackageListFilters,
  GetPackageByTypePayload,
  PackageType,
} from "../types/package.types";

/**
 * Package Service - Handles all package-related API calls
 */
class PackageServiceClass {
  private readonly basePath = "/api/v1/package";

  /**
   * Get all packages
   * Note: This endpoint determines location based on IP
   * @param filters - Optional filters for the package list
   * @returns Promise<PackageListResponse>
   */
  async getPackageList(
    filters?: PackageListFilters
  ): Promise<PackageListResponse> {
    try {
      // Note: Based on postman collection, this endpoint uses POST method without body
      const response = await apiClient.post<PackageListResponse>(this.basePath);

      // Apply client-side filtering if needed
      let filteredData = response.data.data || [];

      if (filters) {
        if (filters.type) {
          filteredData = filteredData.filter(
            (pkg) => pkg.type === filters.type
          );
        }
        if (filters.status !== undefined) {
          filteredData = filteredData.filter(
            (pkg) => pkg.status === filters.status
          );
        }
        if (filters.minPrice !== undefined) {
          filteredData = filteredData.filter(
            (pkg) => pkg.price >= filters.minPrice!
          );
        }
        if (filters.maxPrice !== undefined) {
          filteredData = filteredData.filter(
            (pkg) => pkg.price <= filters.maxPrice!
          );
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(
            (pkg) =>
              pkg.name.toLowerCase().includes(searchLower) ||
              pkg.description.toLowerCase().includes(searchLower)
          );
        }
      }

      return {
        ...response.data,
        data: filteredData,
      };
    } catch (error: any) {
      console.error("Error getting package list:", error);
      throw error;
    }
  }

  /**
   * Get packages by type
   * @param type - Package type (standard or premium)
   * @returns Promise<PackageByTypeResponse>
   */
  async getPackagesByType(type: PackageType): Promise<PackageByTypeResponse> {
    try {
      const payload: GetPackageByTypePayload = { type };
      const response = await apiClient.post<PackageByTypeResponse>(
        `${this.basePath}/get-by-type`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error("Error getting packages by type:", error);
      throw error;
    }
  }

  /**
   * Get package by ID
   * @param packageId - Package ID
   * @returns Promise<PackageDetailResponse>
   */
  async getPackageById(packageId: string): Promise<PackageDetailResponse> {
    try {
      // Based on postman collection, this uses POST method
      const response = await apiClient.post<PackageDetailResponse>(
        `${this.basePath}/${packageId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error getting package by ID:", error);
      throw error;
    }
  }

  /**
   * Create a new package (requires authentication)
   * @param payload - Package creation data
   * @returns Promise<CreatePackageResponse>
   */
  async createPackage(
    payload: CreatePackagePayload
  ): Promise<CreatePackageResponse> {
    try {
      console.log("Creating package with payload:", payload);
      const response = await apiClient.post<CreatePackageResponse>(
        `${this.basePath}/create`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error creating package:",
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }

  /**
   * Update an existing package
   * @param packageId - Package ID to update
   * @param payload - Update data
   * @returns Promise<UpdatePackageResponse>
   */
  async updatePackage(
    packageId: string,
    payload: UpdatePackagePayload
  ): Promise<UpdatePackageResponse> {
    try {
      console.log(`Updating package ${packageId} with payload:`, payload);
      const response = await apiClient.put<UpdatePackageResponse>(
        `${this.basePath}/${packageId}`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error updating package:",
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }

  /**
   * Delete a package
   * @param packageId - Package ID to delete
   * @returns Promise<DeletePackageResponse>
   */
  async deletePackage(packageId: string): Promise<DeletePackageResponse> {
    try {
      const response = await apiClient.delete<DeletePackageResponse>(
        `${this.basePath}/${packageId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error deleting package:", error);
      throw error;
    }
  }

  /**
   * Get package statistics
   * @returns Promise<PackageStatisticsResponse>
   */
  async getPackageStatistics(): Promise<PackageStatisticsResponse> {
    try {
      const response = await apiClient.get<PackageStatisticsResponse>(
        `${this.basePath}/statistics`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error getting package statistics:", error);
      throw error;
    }
  }

  /**
   * Toggle package status (activate/deactivate)
   * @param packageId - Package ID
   * @param status - New status
   * @returns Promise<UpdatePackageResponse>
   */
  async togglePackageStatus(
    packageId: string,
    status: boolean
  ): Promise<UpdatePackageResponse> {
    try {
      return await this.updatePackage(packageId, { status });
    } catch (error: any) {
      console.error("Error toggling package status:", error);
      throw error;
    }
  }

  /**
   * Bulk update packages
   * @param packageIds - Array of package IDs
   * @param payload - Update data
   * @returns Promise<UpdatePackageResponse[]>
   */
  async bulkUpdatePackages(
    packageIds: string[],
    payload: UpdatePackagePayload
  ): Promise<UpdatePackageResponse[]> {
    try {
      const updatePromises = packageIds.map((id) =>
        this.updatePackage(id, payload)
      );
      return await Promise.all(updatePromises);
    } catch (error: any) {
      console.error("Error bulk updating packages:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const PackageService = new PackageServiceClass();
