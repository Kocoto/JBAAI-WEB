// src/features/admin/services/adminUserUpdate.ts

/**
 * Khớp PUT /api/v1/admin/users/:userId (`adminUpdateUserSchema` ở backend):
 * chỉ nhận các trường dưới đây, cần ít nhất một trường.
 * Trường lạ, null hoặc chuỗi rỗng đều trả 400 cho cả request.
 */
export type AdminUserUpdatePayload = {
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  type?: string;
};

export type AdminUserField = keyof AdminUserUpdatePayload;

export type EditableAdminUser = {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status?: string;
  type?: string;
};

const ROW_KEY_BY_FIELD: Record<AdminUserField, keyof EditableAdminUser> = {
  username: "fullName",
  email: "email",
  phone: "phone",
  role: "role",
  status: "status",
  type: "type",
};

// API không nhận "" và cũng không có cách nào khác để xóa các trường này.
const NOT_CLEARABLE: AdminUserField[] = ["email", "phone", "type"];

/**
 * So dòng lúc mở form với giá trị lúc lưu, chỉ giữ trường đã đổi.
 * Giữ nguyên dữ liệu cũ sai chuẩn (username quá dài, tài khoản không có SĐT...) thì không bị chặn khi sửa trường khác.
 * `cleared`: trường đang có giá trị mà admin xóa trắng, không đưa vào payload.
 */
export function buildAdminUserUpdate(
  original: EditableAdminUser,
  updated: EditableAdminUser
): { payload: AdminUserUpdatePayload; cleared: AdminUserField[] } {
  const payload: AdminUserUpdatePayload = {};
  const cleared: AdminUserField[] = [];

  for (const field of Object.keys(ROW_KEY_BY_FIELD) as AdminUserField[]) {
    const rowKey = ROW_KEY_BY_FIELD[field];
    const next = (updated[rowKey] ?? "").trim();
    if (next === (original[rowKey] ?? "").trim()) continue;

    if (!next && NOT_CLEARABLE.includes(field)) cleared.push(field);
    else payload[field] = next;
  }

  return { payload, cleared };
}

type ApiErrorBody = {
  code?: string;
  message?: string;
  errors?: { path?: string; message?: string }[];
};

/** 400 VALIDATION_ERROR: `message` chỉ là "Dữ liệu không hợp lệ", lý do cụ thể nằm ở `errors[].message`. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: ApiErrorBody }; message?: string };
  const data = err?.response?.data;

  if (data?.code === "VALIDATION_ERROR" && Array.isArray(data.errors)) {
    const reasons = data.errors.map((e) => e?.message).filter(Boolean);
    if (reasons.length > 0) return reasons.join("; ");
  }

  return data?.message || err?.message || fallback;
}
