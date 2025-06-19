import apiClient from "../../../shared/services/api/apiClient";
import { FranchiseListResponse } from "../types/franchise.types";

const getFranchiseList = async (
  page: number = 1,
  limit: number = 10,
  level?: number
): Promise<FranchiseListResponse> => {
  try {
    const endpoint = `/api/v1/admin/franchises`;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // if (status) {
    //   params.append("status", status);
    // }

    if (level !== undefined) {
      params.append("level", level.toString());
    }

    const response = await apiClient.get(`${endpoint}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching franchise list:", error);
    throw error;
  }
};

export const FranchiseService = {
  getFranchiseList,
};
