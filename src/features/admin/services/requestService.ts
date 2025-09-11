import apiClient from "../../../shared/services/api/apiClient";
import {
  GetRequestResponse,
  Pagination,
  Request,
} from "../types/request.types";

/**
 * Fetches upgrade requests with pagination
 * CSR: mặc định lấy 20 record/lần để DataGrid tự phân trang ở client
 * @param status - request status filter
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 20)
 */
const getRequestsByStatus = async (
  status: string,
  page: number = 1,
  limit: number = 20
): Promise<GetRequestResponse> => {
  try {
    const endpoint = `/api/v1/upgrade-request/get-by-status/${status}`;
    const queryParams = `?page=${page}&limit=${limit}`;
    const fullUrl = `${endpoint}${queryParams}`;

    const response = await apiClient.get(fullUrl);

    // 👇 Backend trả về { data, Pagination }
    const { data, Pagination } = response.data as {
      data: Request[];
      Pagination?: Pagination;
    };

    return {
      data,
      pagination: Pagination, // 👈 map sang camelCase
    };
  } catch (error: any) {
    handleError("fetching requests by status", error);
    throw error;
  }
};

/**
 * Assigns a seller to a request
 */
const acceptRequest = async (
  requestId: string
): Promise<GetRequestResponse> => {
  try {
    const endpoint = `/api/v1/upgrade-request/${requestId}/assign-seller`;
    const response = await apiClient.put(endpoint);

    const { data, Pagination } = response.data as {
      data: Request[];
      Pagination?: Pagination;
    };

    return {
      data,
      pagination: Pagination,
    };
  } catch (error: any) {
    handleError("accepting request", error);
    throw error;
  }
};

/**
 * Fetches requests by seller id (status = reviewing)
 */
const getRequestsById = async (): Promise<GetRequestResponse> => {
  try {
    const endpoint = `/api/v1/upgrade-request/get-by-seller-id/reviewing`;
    const response = await apiClient.get(endpoint);

    const { data, Pagination } = response.data as {
      data: Request[];
      Pagination?: Pagination;
    };

    return {
      data,
      pagination: Pagination,
    };
  } catch (error: any) {
    handleError("fetching requests by ID", error);
    throw error;
  }
};

/**
 * Approves a request
 */
const approveRequest = async (
  requestId: string
): Promise<GetRequestResponse> => {
  try {
    const endpoint = `/api/v1/upgrade-request/${requestId}/approve`;
    const response = await apiClient.post(endpoint);

    const { data, Pagination } = response.data as {
      data: Request[];
      Pagination?: Pagination;
    };

    return {
      data,
      pagination: Pagination,
    };
  } catch (error: any) {
    handleError("approving request", error);
    throw error;
  }
};

/**
 * Helper function to handle API errors
 */
function handleError(action: string, error: any) {
  const message =
    error?.response?.data?.message || error.message || "Unknown error";
  console.error(`Error ${action}:`, message);
}

export const RequestService = {
  getRequestsByStatus,
  approveRequest,
  getRequestsById,
  acceptRequest,
};
