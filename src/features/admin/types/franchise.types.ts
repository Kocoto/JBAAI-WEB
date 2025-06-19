export interface Franchise {
  _id: string;
  userId: {
    _id: string;
    username: string;
    password: string;
    email: string;
    phone: string;
    role: string;
    status: string;
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
  };
  parentId: string | null;
  franchiseLevel: number;
  ancestorPath: any[];
  userTrialQuotaLedger: UserTrialQuotaLedger[];
  totalActiveQuota: number;
  createdAt: string;
  updatedAt: string;
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

export interface Pagination {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  total: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface FranchiseListResponse {
  data: Franchise[];
  Pagination?: Pagination;
  error?: ApiError;
}
