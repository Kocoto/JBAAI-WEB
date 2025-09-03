// src/features/admin/types/franchise.types.ts

/**
 * User information associated with franchise
 */
export interface FranchiseUser {
  _id: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "seller" | "franchise";
  status: "active" | "inactive" | string;
  verify: boolean;
  language: string;
  discount: boolean;
  isSubscription: boolean;
  emailNotificationsEnabled: boolean;
  isPayment: boolean;
  isHideScore: boolean;
  type: string;
  optionEmail: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  franchiseName: string;
}

/**
 * User trial quota ledger entry
 */
export interface UserTrialQuotaLedger {
  _id: string;
  sourceCampaignId?: string;
  sourceParentLedgerEntryId?: string;
  allocatedByUserId: string;
  totalAllocated: number;
  consumedByOwnInvites: number;
  allocatedToChildren: number;
  status: "active" | "exhausted" | "expired" | "paused";
  createdAt: string;
  updatedAt: string;
  originalCampaignStartDate?: string;
  originalCampaignEndDate?: string;
}

/**
 * Main franchise entity
 */
export interface Franchise {
  _id: string;

  // 👇 thêm để fix lỗi TS2339
  id?: string;
  status?: "active" | "inactive";

  userId: FranchiseUser;
  parentId: string | null;
  franchiseLevel: number;
  ancestorPath: string[];
  userTrialQuotaLedger: UserTrialQuotaLedger[];
  totalActiveQuota: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Franchise hierarchy node for tree structure
 */
export interface FranchiseHierarchyNode {
  _id: string;
  franchiseName: string;
  email: string;
  phone: string;
  level: number;
  totalActiveQuota: number;
  children: FranchiseHierarchyNode[];
  statistics?: {
    totalChildren: number;
    totalDescendants: number;
    totalQuotaAllocated: number;
    totalQuotaConsumed: number;
  };
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
 * Franchise list filters
 */
export interface FranchiseListFilters {
  page?: number;
  limit?: number;
  status?: "active" | "inactive";
  level?: number;
  search?: string;
  parentId?: string;
}

/**
 * Response from GET /api/v1/admin/franchises
 */
export interface FranchiseListResponse {
  franchises: Franchise[];
  Pagination?: Pagination;
  error?: ApiError;
}

/**
 * Response from GET /api/v1/admin/franchises/:userId/hierarchy
 */
export interface FranchiseHierarchyResponse {
  data: FranchiseHierarchyNode;
  statistics: {
    totalFranchises: number;
    byLevel: Record<number, number>;
    totalActiveQuota: number;
  };
  error?: ApiError;
}

/**
 * Franchise statistics
 */
export interface FranchiseStatistics {
  totalFranchises: number;
  activeFranchises: number;
  inactiveFranchises: number;
  franchisesByLevel: Record<number, number>;
  totalQuotaDistributed: number;
  totalQuotaConsumed: number;
  growthRate: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

/**
 * Response from franchise statistics endpoint
 */
export interface FranchiseStatisticsResponse {
  data: FranchiseStatistics;
  error?: ApiError;
}
