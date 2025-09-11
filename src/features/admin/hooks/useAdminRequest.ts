import { useState, useEffect, useCallback } from "react";
import { RequestService } from "../services/requestService";
import { Request, ApiError } from "../types/request.types";

// Định nghĩa các status có thể có
export type RequestStatus = "pending" | "approved" | "rejected" | "reviewing";

// Interface cho state của mỗi danh sách request
interface RequestListState {
  data: Request[];
  loading: boolean;
  error: ApiError | null;
  page: number;
  limit: number;
  total: number;
}

// Interface cho toàn bộ state
interface AdminRequestState {
  pending: RequestListState;
  approved: RequestListState;
  rejected: RequestListState;
  reviewing: RequestListState;
}

// Initial state cho mỗi list
const initialListState: RequestListState = {
  data: [],
  loading: false,
  error: null,
  page: 1,
  limit: 20, // mặc định CSR: 20 items / page
  total: 0,
};

/**
 * Custom hook để quản lý nhiều danh sách request với các status khác nhau
 */
export const useAdminRequest = () => {
  // State chính chứa tất cả các danh sách
  const [requestsState, setRequestsState] = useState<AdminRequestState>({
    pending: { ...initialListState },
    approved: { ...initialListState },
    rejected: { ...initialListState },
    reviewing: { ...initialListState },
  });

  // State để track xem đã load lần đầu chưa
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Hàm fetch requests cho một status cụ thể
   */
  const fetchRequestsByStatus = useCallback(
    async (status: RequestStatus, page: number = 1, limit: number = 20) => {
      setRequestsState((prev) => ({
        ...prev,
        [status]: {
          ...prev[status],
          loading: true,
          error: null,
        },
      }));

      try {
        const response = await RequestService.getRequestsByStatus(
          status,
          page,
          limit
        );

        // ✅ Lấy total từ API pagination.total
        const total = response.pagination?.total ?? response.data?.length ?? 0;

        setRequestsState((prev) => ({
          ...prev,
          [status]: {
            ...prev[status],
            data: response.data || [],
            loading: false,
            page,
            limit,
            total,
          },
        }));

        console.log(
          `STATE ${status} updated:`,
          response.data,
          "pagination:",
          response.pagination
        );
      } catch (error) {
        const apiError = error as ApiError;
        setRequestsState((prev) => ({
          ...prev,
          [status]: {
            ...prev[status],
            loading: false,
            error: apiError,
          },
        }));
      }
    },
    []
  );

  /**
   * Hàm fetch tất cả danh sách cùng lúc
   */
  const fetchAllRequests = useCallback(async () => {
    await Promise.all([
      fetchRequestsByStatus("pending"),
      fetchRequestsByStatus("approved"),
      fetchRequestsByStatus("reviewing"),
      fetchRequestsByStatus("rejected"),
    ]);
  }, [fetchRequestsByStatus]);

  /**
   * Hàm refresh một danh sách cụ thể
   */
  const refreshRequestList = useCallback(
    async (status: RequestStatus) => {
      const currentState = requestsState[status];
      await fetchRequestsByStatus(
        status,
        currentState.page,
        currentState.limit
      );
    },
    [requestsState, fetchRequestsByStatus]
  );

  /**
   * Hàm thay đổi trang cho một danh sách
   */
  const changePageForStatus = useCallback(
    async (status: RequestStatus, newPage: number) => {
      const currentState = requestsState[status];
      await fetchRequestsByStatus(status, newPage, currentState.limit);
    },
    [requestsState, fetchRequestsByStatus]
  );

  /**
   * Hàm thay đổi số lượng items per page
   */
  const changeLimitForStatus = useCallback(
    async (status: RequestStatus, newLimit: number) => {
      await fetchRequestsByStatus(status, 1, newLimit);
    },
    [fetchRequestsByStatus]
  );

  /**
   * Hàm accept request (chuyển từ pending sang reviewing)
   */
  const acceptRequest = useCallback(
    async (requestId: string) => {
      try {
        await RequestService.acceptRequest(requestId);
        await refreshRequestList("pending");
        await refreshRequestList("reviewing");
      } catch (error) {
        console.error("Error accepting request:", error);
        throw error;
      }
    },
    [refreshRequestList]
  );

  /**
   * Hàm approve request (duyệt request)
   */
  const approveRequest = useCallback(
    async (requestId: string) => {
      try {
        await RequestService.approveRequest(requestId);
        await refreshRequestList("reviewing");
        await refreshRequestList("approved");
      } catch (error) {
        console.error("Error approving request:", error);
        throw error;
      }
    },
    [refreshRequestList]
  );

  /**
   * Hàm lấy request theo ID từ state hiện tại
   */
  const getRequestById = useCallback(
    (requestId: string): Request | undefined => {
      for (const status of [
        "pending",
        "approved",
        "rejected",
        "reviewing",
      ] as RequestStatus[]) {
        const found = requestsState[status].data.find(
          (req) => req._id === requestId
        );
        if (found) return found;
      }
      return undefined;
    },
    [requestsState]
  );

  /**
   * Effect để load data lần đầu
   */
  useEffect(() => {
    if (!isInitialized) {
      fetchAllRequests();
      setIsInitialized(true);
    }
  }, [isInitialized, fetchAllRequests]);

  useEffect(() => {
    console.log("STATE UPDATED:", requestsState);
  }, [requestsState]);

  return {
    pendingRequests: requestsState.pending,
    approvedRequests: requestsState.approved,
    rejectedRequests: requestsState.rejected,
    reviewingRequests: requestsState.reviewing,

    fetchAllRequests,
    refreshRequestList,
    changePageForStatus,
    changeLimitForStatus,
    acceptRequest,
    approveRequest,
    getRequestById,

    isLoadingAny:
      requestsState.pending.loading ||
      requestsState.approved.loading ||
      requestsState.rejected.loading ||
      requestsState.reviewing.loading,

    hasAnyError:
      !!requestsState.pending.error ||
      !!requestsState.approved.error ||
      !!requestsState.rejected.error ||
      !!requestsState.reviewing.error,
  };
};
