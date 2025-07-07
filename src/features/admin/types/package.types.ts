// src/features/admin/types/package.types.ts

/**
 * Package type enum
 */
export type PackageType = "standard" | "premium";

/**
 * Package location enum
 */
export type PackageLocation =
  | "VN"
  | "US"
  | "UK"
  | "AU"
  | "CA"
  | "DE"
  | "FR"
  | "JP"
  | "KR"
  | "SG";

/**
 * Package status
 */
export type PackageStatus = boolean;

/**
 * Main package entity
 */
export interface Package {
  _id: string;
  name: string;
  price: number;
  description: string;
  duration: number; // days
  type: PackageType;
  location: PackageLocation;
  discount: number;
  status: PackageStatus;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

/**
 * Package creation payload
 */
export interface CreatePackagePayload {
  name: string;
  price: number;
  description: string;
  duration: number;
  type: PackageType;
  location: PackageLocation;
  discount: number;
  status: boolean;
}

/**
 * Package update payload
 */
export interface UpdatePackagePayload {
  name?: string;
  price?: number;
  description?: string;
  duration?: number;
  type?: PackageType;
  location?: PackageLocation;
  discount?: number;
  status?: boolean;
}

/**
 * Package filters for listing
 */
export interface PackageListFilters {
  page?: number;
  limit?: number;
  type?: PackageType;
  location?: PackageLocation;
  status?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

/**
 * Package by type payload
 */
export interface GetPackageByTypePayload {
  type: PackageType;
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
 * Response from GET /api/v1/package (all packages)
 */
export interface PackageListResponse {
  data: Package[];
  error?: ApiError;
}

/**
 * Response from POST /api/v1/package/get-by-type
 */
export interface PackageByTypeResponse {
  data: Package[];
  error?: ApiError;
}

/**
 * Response from POST /api/v1/package/:id
 */
export interface PackageDetailResponse {
  data: Package;
  error?: ApiError;
}

/**
 * Response from POST /api/v1/package/create
 */
export interface CreatePackageResponse {
  data: Package;
  message: string;
  error?: ApiError;
}

/**
 * Response from PUT /api/v1/package/:id
 */
export interface UpdatePackageResponse {
  data: Package;
  message: string;
  error?: ApiError;
}

/**
 * Response from DELETE /api/v1/package/:id
 */
export interface DeletePackageResponse {
  message: string;
  error?: ApiError;
}

/**
 * Package statistics
 */
export interface PackageStatistics {
  totalPackages: number;
  activePackages: number;
  inactivePackages: number;
  packagesByType: {
    standard: number;
    premium: number;
  };
  packagesByLocation: Record<PackageLocation, number>;
  averagePrice: number;
  totalRevenue: number;
}

/**
 * Response from package statistics endpoint
 */
export interface PackageStatisticsResponse {
  data: PackageStatistics;
  error?: ApiError;
}
