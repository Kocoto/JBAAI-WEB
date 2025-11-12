// src/types/franchise.type.ts

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

/* ========= Invitation Codes (phù hợp BE mới & cũ) ========= */

export type InvitationCodeStatus =
  | "active"
  | "used"
  | "expired"
  | "inactive"
  | "deleted"
  | string;

export type InvitationCodeType =
  | "USER_TRIAL"
  | "FRANCHISE_HIERARCHY"
  | "USER_TRIAL_STANDARD_ONE_MONTH"
  | "USER_TRIAL_STANDARD_THREE_MONTHS"
  | "USER_TRIAL_STANDARD_ONE_YEAR"
  | "RANDOM"
  | string;

export interface InvitedUser {
  _id: string;
  username: string;
  email: string;
}

export interface InvitationStatistics {
  totalCumulativeUses: number;
  actualUsageCount: number;
  lastUsedDate: string | null;
  lastInvitedUser: InvitedUser | null;
}

export interface CurrentLedgerInfo {
  ledgerId: string;
  totalAllocated: number;
  consumedByOwnInvites: number;
  allocatedToChildren: number;
  availableQuota: number;
  status: "active" | "inactive" | string;
  // đôi khi BE thêm các field ngày:
  originalCampaignEndDate?: string;
  endDate?: string;
}

/** Invitation code — hợp nhất BE mới & cũ */
export interface InvitationCode {
  _id: string;
  code: string;

  /** BE mới: định danh gói 1m/3m/1y */
  packageId?: string;

  /** ✅ Thêm để hỗ trợ tìm kiếm theo prefix (BE có thể trả về) */
  prefixCode?: string;

  /** BE cũ/khác: xác định nhóm */
  codeType?: InvitationCodeType | { _id?: string; key?: string; name?: string };

  status: InvitationCodeStatus;

  /** Một số BE đặt usage ở top-level */
  totalCumulativeUses?: number;

  /** Phần thống kê chuẩn (khớp payload Postman) */
  statistics?: InvitationStatistics;

  /** Thông tin ledger hiện tại (khớp payload Postman) */
  currentLedgerInfo?: CurrentLedgerInfo | null;

  userId?: string;
  createdAt: string;
  updatedAt: string;

  // các biến thể khác nhau của BE (giữ optional để không phá chỗ khác)
  expiresAt?: string;
  endDate?: string;
  campaign?: {
    codeTypeId?: string;
    codeType?: { _id?: string; key?: string; name?: string } | string;
    endDate?: string;
  };
  package?: { _id?: string; id?: string; name?: string } | null;
  codePackageId?: string;
  standardPackageId?: string;
  planId?: string;
  pricingPackageId?: string;
}

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

export interface AllocateQuotaPayload {
  childFranchiseUserId: string;
  amountToAllocate: number;
  sourceLedgerEntryId: string;
}

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

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: ApiError;
}
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
export interface Pagination {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  total: number;
  totalPages: number;
}
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

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
