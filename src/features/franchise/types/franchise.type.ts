// franchise.types.ts

/**
 * Base User interface for franchise
 */
export interface FranchiseUser {
  _id: string;
  username: string;
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
  franchiseName?: string;
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
 * Franchise entity with details
 */
export interface FranchiseDetails {
  _id: string;
  userId: string | FranchiseUser;
  parentId: string | null;
  franchiseLevel: number;
  ancestorPath: string[];
  userTrialQuotaLedger: UserTrialQuotaLedger[];
  totalActiveQuota: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Quota information
 */
export interface QuotaInfo {
  totalActiveQuota: number;
  quotaByLedger: Array<{
    ledgerEntryId: string;
    campaignId: string;
    campaignName: string;
    totalAllocated: number;
    consumedByOwnInvites: number;
    allocatedToChildren: number;
    available: number;
    status: string;
  }>;
}

/**
 * Statistics information
 */
export interface FranchiseStatistics {
  totalChildren: number;
  activeChildren: number;
  totalDescendants: number;
  totalQuotaAllocated: number;
  totalQuotaConsumed: number;
  conversionRate: number;
  performanceMetrics: {
    invitationsSent: number;
    trialsActivated: number;
    subscriptionsConverted: number;
  };
}

/**
 * Invitation code
 */
export interface InvitationCode {
  _id: string;
  code: string;
  codeType:
    | "USER_TRIAL"
    | "FRANCHISE_HIERARCHY"
    | "USER_TRIAL_STANDARD_ONE_MONTH"
    | "USER_TRIAL_STANDARD_THREE_MONTHS"; // <-- THÊM 2 ENUM MỚI
  createdByUserId?: string; // nếu có
  status: "active" | "used" | "expired" | "inactive"; // thêm "inactive" vì payload có
  statistics: {
    actualUsageCount: number;
    lastInvitedUser: string | null;
    lastUsedDate: string | null;
    totalCumulativeUses: number;
  };
  currentLedgerInfo: any | null;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // nếu sau này có
  endDate?: string;   // nếu sau này có
}


/**
 * Child franchise for hierarchy
 */
export interface ChildFranchise {
  _id: string;
  userId: string;
  franchiseName: string;
  email: string;
  phone: string;
  level: number;
  totalActiveQuota: number;
  status: string;
  children?: ChildFranchise[];
}

/**
 * Allocation request payload
 */
export interface AllocateQuotaPayload {
  childFranchiseUserId: string;
  amountToAllocate: number;
  sourceLedgerEntryId: string;
}

/**
 * Allocation history entry
 */
export interface AllocationHistory {
  _id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  sourceLedgerEntryId: string;
  campaignId: string;
  status: "active" | "revoked";
  createdAt: string;
  revokedAt?: string;
}

/**
 * Trial performance metrics
 */
export interface TrialPerformance {
  totalInvited: number;
  totalActivated: number;
  totalConverted: number;
  activationRate: number;
  conversionRate: number;
  byPeriod?: {
    daily: PerformanceMetric[];
    weekly: PerformanceMetric[];
    monthly: PerformanceMetric[];
  };
}

interface PerformanceMetric {
  date: string;
  invited: number;
  activated: number;
  converted: number;
}

/**
 * Child performance summary
 */
export interface ChildPerformanceSummary {
  childFranchiseUserId: string;
  franchiseName: string;
  email: string;
  level: number;
  metrics: {
    totalInvited: number;
    totalActivated: number;
    totalConverted: number;
    quotaUtilization: number;
  };
}

/**
 * Full hierarchy performance
 */
export interface HierarchyPerformance {
  franchiseId: string;
  franchiseName: string;
  level: number;
  ownPerformance: TrialPerformance;
  childrenPerformance: HierarchyPerformance[];
  aggregatedMetrics: {
    totalInvited: number;
    totalActivated: number;
    totalConverted: number;
    totalQuotaDistributed: number;
    totalQuotaConsumed: number;
  };
}

/**
 * Quota utilization report
 */
export interface QuotaUtilization {
  totalAllocated: number;
  totalConsumed: number;
  totalAvailable: number;
  utilizationRate: number;
  byLedger: Array<{
    ledgerEntryId: string;
    campaignId: string;
    campaignName: string;
    allocated: number;
    consumed: number;
    available: number;
    utilizationRate: number;
  }>;
  byChild: Array<{
    childFranchiseUserId: string;
    franchiseName: string;
    allocated: number;
    consumed: number;
    utilizationRate: number;
  }>;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: ApiError;
}

/**
 * API Error
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
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
 * List response with pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * API Detail Response
 */
export interface ApiDetailResponse {
  success: boolean;
  message: string;
  data: {
    franchiseInfo: {
      _id: string;
      userId: {
        _id: string;
        username: string;
        email: string;
        phone: string | null;
        role: string;
        status: string;
        type: string;
        franchiseName: string;
      };
      parentId: {
        _id: string;
        username: string;
        email: string;
        franchiseName: string;
      } | null;
      franchiseLevel: number;
      ancestorPath: string[];
      createdAt: string;
      updatedAt: string;
    };
    quotaInfo: {
      totalActiveQuota: number;
      activeQuotaDetails: Array<{
        ledgerId: string;
        sourceCampaignId: string;
        totalAllocated: number;
        consumedByOwnInvites: number;
        allocatedToChildren: number;
        availableQuota: number;
        status: string;
        createdAt: string;
        updatedAt: string;
      }>;
      totalLedgerEntries: number;
    };
    statistics: {
      totalInvitations: number;
      totalTrialUsers: number;
      totalRenewals: number;
      conversionRate: number;
      directChildrenCount: number;
      lastActivityDate: string | null;
    };
    activeCampaigns: Array<{
      _id: string;
      campaignName: string;
      status: string;
      startDate: string;
      endDate: string;
    }>;
  };
}
