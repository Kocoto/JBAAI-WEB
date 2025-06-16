import apiClient from "../../../shared/services/api/apiClient";
import { GetRequestResponse } from "../types/request.types";

/**
 * Fetches pending upgrade requests with pagination
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Promise containing the paginated request data
 */
const getRequestsByStatus = async (
  status: string,
  page: number = 1,
  limit: number = 10
): Promise<GetRequestResponse> => {
  try {
    // Construct the API endpoint URL with query parameters
    const endpoint = `/api/v1/upgrade-request/get-by-status/${status}`;
    const queryParams = `?page=${page}&limit=${limit}`;
    const fullUrl = `${endpoint}${queryParams}`;

    // Make the API request
    const response = await apiClient.get(fullUrl);

    // Log the response data for debugging
    // console.log("Pending requests response:", response.data);

    // Return the response data
    return response.data;
  } catch (error) {
    // Log any errors that occur during the request
    console.error("Error fetching pending requests:", error);
    throw error;
  }
};

const acceptRequest = async (
  requestId: string
): Promise<GetRequestResponse> => {
  try {
    const endpoint = `/api/v1/upgrade-request/${requestId}/assign-seller`;
    const response = await apiClient.put(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error accepting request:", error);
    throw error;
  }
};

const getRequestsById = async (): Promise<GetRequestResponse> => {
  try {
    const endpoint = `/api/v1/upgrade-request/get-by-seller-id/reviewing`;
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error accepting request:", error);
    throw error;
  }
};

const approveRequest = async (requestId: string) => {
  try {
    const endpoint = `/api/v1/upgrade-request/${requestId}/approve`;
    const response = await apiClient.post(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error accepting request:", error);
    throw error;
  }
};

export const RequestService = {
  getRequestsByStatus,
  approveRequest,
  getRequestsById,
  acceptRequest,
};
