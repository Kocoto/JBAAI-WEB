// src/features/admin/hooks/useAdminRequest.ts

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
  limit: 10,
  total: 0,
};

/**
 * Custom hook để quản lý nhiều danh sách request với các status khác nhau
 *
 * @returns Object chứa state và các functions để quản lý requests
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
    async (status: RequestStatus, page: number = 1, limit: number = 10) => {
      // Set loading state cho status cụ thể
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

        // Giả sử API trả về total count, nếu không thì tính bằng length
        const total = response.data?.length || 0;
        console.log(`Đây là response của ${status}, ${total}`, response.data);

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
        console.log(`Đây là state của ${status}`, requestsState);
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
   * Hàm fetch tất cả 3 danh sách cùng lúc
   */
  const fetchAllRequests = useCallback(async () => {
    // Fetch song song để tối ưu performance
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
      // Reset về trang 1 khi thay đổi limit
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
        // Refresh pending list sau khi accept
        await refreshRequestList("pending");
        await refreshRequestList("reviewing");
        // Có thể cần refresh các list khác tùy vào business logic
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
        // Refresh các list liên quan
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
      // Tìm trong tất cả các danh sách
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
    // useEffect này sẽ chạy mỗi khi `requestsState` thay đổi
    console.log("STATE ĐÃ ĐƯỢC CẬP NHẬT:", requestsState);
  }, [requestsState]); // Mảng phụ thuộc là requestsState
  // /**
  //  * Optional: Auto-refresh mỗi 30 giây
  //  */
  // useEffect(() => {
  //   if (!isInitialized) return;

  //   const interval = setInterval(() => {
  //     fetchAllRequests();
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, [isInitialized, fetchAllRequests]);

  return {
    // State cho từng danh sách
    pendingRequests: requestsState.pending,
    approvedRequests: requestsState.approved,
    rejectedRequests: requestsState.rejected,
    reviewingRequests: requestsState.reviewing,

    // Functions để thao tác
    fetchAllRequests,
    refreshRequestList,
    changePageForStatus,
    changeLimitForStatus,
    acceptRequest,
    approveRequest,
    getRequestById,

    // Loading states
    isLoadingAny:
      requestsState.pending.loading ||
      requestsState.approved.loading ||
      requestsState.rejected.loading ||
      requestsState.reviewing.loading,

    // Error states
    hasAnyError:
      !!requestsState.pending.error ||
      !!requestsState.approved.error ||
      !!requestsState.rejected.error ||
      !!requestsState.reviewing.error,
  };
};
