export interface franchise {
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
  userTrialQuotaLedger: any[];
  totalActiveQuota: number;
  createdAt: string;
  updatedAt: string;
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
  data: franchise[];
  Pagination?: Pagination;
  error?: ApiError;
}
