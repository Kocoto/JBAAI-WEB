import { useEffect, useState } from "react";
import {
  ApiError,
  Franchise,
  FranchiseListResponse,
} from "../types/franchise.types";
import { FranchiseService } from "../services/franchiseService";

interface FranchiseListState {
  data: Franchise[];
  loading: boolean;
  error: ApiError | null;
  page: number;
  limit: number;
  total: number;
}

const initialListState: FranchiseListState = {
  data: [],
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  total: 0,
};
export const useAdminFranchise = () => {
  const [franchiseList, setFranchiseList] =
    useState<FranchiseListState>(initialListState);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchFranchiseList = async (level?: number) => {
    setFranchiseList((prev) => ({
      ...prev,
      loading: true,
    }));
    try {
      const response = await FranchiseService.getFranchiseList(
        franchiseList.page,
        franchiseList.limit,
        level
      );
      const total = response.Pagination?.total || response.data.length;
      setFranchiseList((prev) => ({
        ...prev,
        data: response.data,
        loading: false,
        error: null,
        total: total,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      setFranchiseList((prev) => ({
        ...prev,
        loading: false,
        error: apiError,
      }));
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      fetchFranchiseList();
      setIsInitialized(true);
    }
  }, [isInitialized, fetchFranchiseList]);

  return {
    franchiseList,

    fetchFranchiseList,

    isLoading: franchiseList.loading,

    isError: franchiseList.error !== null,
  };
};
