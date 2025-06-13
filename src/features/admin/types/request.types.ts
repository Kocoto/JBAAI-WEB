export interface Request {
  _id: string;
  userId: string;
  phone: string;
  email: string;
  fullname: string;
  role: "user" | "franchise";
  address: string;
  franchiseName?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetRequestResponse {
  requests: Request[];
}

export interface ApiError {
  message: string;
  statusCode: number;
}
