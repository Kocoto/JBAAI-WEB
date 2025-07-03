// src/features/admin/types/campaign.types.ts

import { FranchiseUser } from "./franchise.types";

/**
 * Campaign status enum
 */
export type CampaignStatus = "active" | "inactive" | "expired" | "deleted";

// 2. (Tùy chọn nhưng khuyên dùng) Tạo một object để dễ gọi trong code
export const CAMPAIGN_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  EXPIRED: "expired",
  DELETED: "deleted",
} as const;

/**
 * Main campaign entity
 */
export interface Campaign {
  _id: string;
  campaignName: string;
  franchiseOwnerId: FranchiseUser[];
  totalAllocated: number;
  consumedUses: number;
  totalRenewed: number;
  startDate: string;
  endDate: string;
  renewalRequirementPercentage: number;
  status: CampaignStatus;
  packageId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  deletedAt?: string;
  description?: string;
  __v?: number;
}

/**
 * Campaign creation payload
 */
export interface CreateCampaignPayload {
  campaignName: string;
  franchiseOwnerId: string;
  totalAllocated: number;
  startDate: string;
  endDate: string;
  renewalRequirement: number;
  packageId: string;
  description?: string;
}

/**
 * Campaign update payload
 */
export interface UpdateCampaignPayload {
  campaignName?: string;
  totalAllocated?: number;
  renewalRequirement?: number;
  endDate?: string;
  packageId?: string;
  description?: string;
}

/**
 * Campaign status change payload
 */
export interface ChangeCampaignStatusPayload {
  status: CampaignStatus;
}

/**
 * Campaign filters for listing
 */
export interface CampaignListFilters {
  page?: number;
  limit?: number;
  status?: CampaignStatus;
  franchiseOwnerId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Campaign statistics
 */
export interface CampaignStatistics {
  totalCampaigns: number;
  activeCampaigns: number;
  inactiveCampaigns: number;
  expiredCampaigns: number;
  totalQuotaAllocated: number;
  totalQuotaConsumed: number;
  averageRenewalRate: number;
  campaignsByStatus: Record<CampaignStatus, number>;
}

/**
 * Campaign performance metrics
 */
export interface CampaignPerformanceMetrics {
  quotaUtilization: number; // percentage
  renewalRate: number; // percentage
  averageChildAllocation: number;
  distributionEfficiency: number; // percentage
  timeToExhaustion: number; // days
}

/**
 * Campaign performance summary
 */
export interface CampaignPerformanceSummary {
  campaignId: string;
  campaignName: string;
  metrics: CampaignPerformanceMetrics;
  quotaDistribution: {
    allocated: number;
    consumed: number;
    remaining: number;
    allocatedToChildren: number;
  };
  franchisePerformance: {
    totalFranchises: number;
    activeFranchises: number;
    topPerformers: Array<{
      franchiseId: string;
      franchiseName: string;
      quotaConsumed: number;
      childrenCount: number;
    }>;
  };
  timeline: Array<{
    date: string;
    quotaConsumed: number;
    newFranchises: number;
  }>;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  total: number;
  totalPages: number;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

/**
 * Response from GET /api/v1/admin/campaigns
 */
export interface CampaignListResponse {
  data: {
    campaigns: Campaign[];
  };
  Pagination?: Pagination;
  error?: ApiError;
}

/**
 * Response from GET /api/v1/admin/campaigns/:id
 */
export interface CampaignDetailResponse {
  data: Campaign;
  error?: ApiError;
}

/**
 * Response from POST /api/v1/admin/campaigns
 */
export interface CreateCampaignResponse {
  data: Campaign;
  message: string;
  error?: ApiError;
}

/**
 * Response from PUT /api/v1/admin/campaigns/:id
 */
export interface UpdateCampaignResponse {
  data: Campaign;
  message: string;
  error?: ApiError;
}

/**
 * Response from PATCH /api/v1/admin/campaigns/:id/status
 */
export interface ChangeCampaignStatusResponse {
  data: Campaign;
  message: string;
  error?: ApiError;
}

/**
 * Response from DELETE /api/v1/admin/campaigns/:id
 */
export interface DeleteCampaignResponse {
  message: string;
  error?: ApiError;
}

/**
 * Response from GET /api/v1/admin/campaigns/statistics
 */
export interface CampaignStatisticsResponse {
  data: CampaignStatistics;
  error?: ApiError;
}

/**
 * Response from GET /api/v1/admin/campaigns/:id/performance-summary
 */
export interface CampaignPerformanceSummaryResponse {
  data: CampaignPerformanceSummary;
  error?: ApiError;
}
