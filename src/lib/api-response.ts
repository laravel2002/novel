import { NextResponse } from 'next/server';

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
  nextCursor?: string | number | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  error: unknown | null;
  pagination?: PaginationMeta;
}

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
  };
  
  if (pagination) {
    response.pagination = pagination;
  }

  return NextResponse.json(response, { status });
}

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
  };

  return NextResponse.json(response, { status });
}
