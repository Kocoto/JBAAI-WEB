import { useState } from "react";
import {
  ApiError,
  franchise,
  FranchiseListResponse,
} from "../types/franchise.types";

interface FranchiseListState {
  data: franchise[];
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
  const [franchiseList, setFranchiseList] = useState<{
    [key: string]: FranchiseListResponse;
  }>({});
  // State để track xem đã load lần đầu chưa
  const [isInitialized, setIsInitialized] = useState(false);
};
