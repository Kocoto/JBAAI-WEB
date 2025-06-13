import apiClient from "../../../shared/services/api/apiClient";
import { GetRequestResponse } from "../types/request.types";

/**
 * Fetches pending upgrade requests with pagination
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Promise containing the paginated request data
 */
const getRequestsPending = async (
  page: number = 1,
  limit: number = 10
): Promise<GetRequestResponse> => {
  try {
    // Construct the API endpoint URL with query parameters
    const endpoint = `/api/v1/upgrade-request/get-by-status/pending/`;
    const queryParams = `?page=${page}&limit=${limit}`;
    const fullUrl = `${endpoint}${queryParams}`;

    // Make the API request
    const response = await apiClient.get(fullUrl);

    // Log the response data for debugging
    console.log("Pending requests response:", response.data);

    // Return the response data
    return response.data;
  } catch (error) {
    // Log any errors that occur during the request
    console.error("Error fetching pending requests:", error);
    throw error;
  }
};

export const RequestService = {
  getRequestsPending,
};
