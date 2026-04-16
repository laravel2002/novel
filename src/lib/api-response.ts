import { NextResponse } from 'next/server';

// ============================================================
// Interfaces
// ============================================================

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
  nextCursor?: string | number | null;
}

export interface ResponseMetadata {
  timestamp: string;
  version: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  error: unknown | null;
  metadata: ResponseMetadata;
  pagination?: PaginationMeta;
}

// ============================================================
// Helper: Tạo metadata mặc định
// ============================================================

function createDefaultMetadata(version: string = "v1"): ResponseMetadata {
  return {
    timestamp: new Date().toISOString(),
    version,
  };
}

// ============================================================
// Response Builders (Legacy - giữ cho backward compat)
// ============================================================

/**
 * Trả về response thành công.
 * 
 * LƯU Ý: Đây là API cũ, giữ lại cho backward compatibility.
 * Các route mới nên dùng `apiHandler()` từ `@/lib/api-handler.ts`.
 */
export function sendSuccess<T>(
  data: T,
  message: string = 'Success',
  status: number = 200,
  pagination?: PaginationMeta
) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    error: null,
    metadata: createDefaultMetadata(),
  };
  
  if (pagination) {
    response.pagination = pagination;
  }

  return NextResponse.json(response, { status });
}

/**
 * Trả về response lỗi.
 * 
 * LƯU Ý: Đây là API cũ, giữ lại cho backward compatibility.
 * Các route mới nên dùng `apiHandler()` từ `@/lib/api-handler.ts`.
 */
export function sendError(
  error: unknown,
  message: string = 'An error occurred',
  status: number = 500
) {
  // Tránh rò rỉ lỗi kĩ thuật từ DB (Prisma) ở môi trường production
  let errorDetail: unknown = null;
  
  if (process.env.NODE_ENV !== 'production') {
    if (error instanceof Error) {
      errorDetail = error.message;
    } else {
      errorDetail = error;
    }
  }

  const response: ApiResponse<null> = {
    success: false,
    data: null,
    message,
    error: errorDetail,
    metadata: createDefaultMetadata(),
  };

  return NextResponse.json(response, { status });
}
