export interface Request {
  _id: string;
  userId: string;
  phone: string;
  email: string;
  fullname: string;
  role: "user" | "franchise";
  address: string;
  franchiseName?: string;
  status: "pending" | "approved" | "rejected" | "reviewing"; // 👈 thêm reviewing nếu dùng ở hook
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Pagination {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  total: number;
  totalPages: number;
}

export interface GetRequestResponse {
  data: Request[];
  pagination?: Pagination; // 👈 camelCase
}

export interface ApiError {
  message: string;
  statusCode: number;
}
