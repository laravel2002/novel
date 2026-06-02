import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, handleOptions } from "@/lib/cors";
import type { PaginationMeta } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";

// ============================================================
// Types & Interfaces
// ============================================================

/** Metadata đính kèm mỗi response để client theo dõi */
export interface ResponseMetadata {
  timestamp: string;
  version: string;
  duration?: number; // Tính bằng ms
}

/** Cấu trúc JSON chuẩn trả về cho MỌI API endpoint */
export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  errorCode?: string; // Định danh lỗi cho App
  errorDetails?: unknown; // Chi tiết lỗi validation (nếu có)
  metadata: ResponseMetadata;
  pagination?: PaginationMeta;
}

/** Context object được inject vào mỗi handler, cung cấp các method tiện ích */
export interface ApiHandlerContext {
  /** Bật bộ nhớ đệm Cache-Control cho response */
  cache: (maxAge: number, sMaxAge?: number) => ApiHandlerContext;

  /** Trả về response thành công (HTTP 2xx) */
  success: <T>(data: T, status?: number) => NextResponse;

  /** Trả về response thành công kèm phân trang */
  paginated: <T>(data: T, pagination: PaginationMeta, status?: number) => NextResponse;

  /** Trả về response lỗi (khuyến khích throw ApiError thay vì dùng method này) */
  error: (message: string, status?: number, errorCode?: string, errorDetails?: unknown) => NextResponse;
}

/** Kiểu hàm handler mà developer viết bên trong apiHandler() */
type ApiRouteHandler = (
  req: NextRequest,
  ctx: ApiHandlerContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routeContext?: any
) => Promise<NextResponse>;

/** Options tùy chỉnh cho apiHandler */
export interface ApiHandlerOptions {
  /** Version string hiển thị trong metadata (mặc định "v1") */
  version?: string;
  /** Bật CORS headers (mặc định true) */
  cors?: boolean;
}

// ============================================================
// Helper: Parse query params thường dùng
// ============================================================

/**
 * Parse một string thành số nguyên. Trả về defaultValue nếu không hợp lệ.
 * Dùng cho các trường hợp lấy query params như ?page=1&limit=20.
 */
export function parseIntParam(
  value: string | null | undefined,
  defaultValue: number
): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) || parsed < 1 ? defaultValue : parsed;
}

/**
 * Parse pagination params phổ biến (page, limit) từ searchParams.
 * Trả về object { page, limit, skip } sẵn sàng truyền vào Prisma.
 */
export function parsePageParams(
  searchParams: URLSearchParams,
  defaults: { page?: number; limit?: number } = {}
): { page: number; limit: number; skip: number } {
  const page = parseIntParam(searchParams.get("page"), defaults.page ?? 1);
  const limit = parseIntParam(searchParams.get("limit"), defaults.limit ?? 20);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Tính toán pagination metadata từ kết quả query.
 * Giúp tạo object PaginationMeta chuẩn không phải viết lại ở mỗi route.
 */
export function buildPagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}

// ============================================================
// Core: API Handler Wrapper
// ============================================================

/**
 * Factory tạo OPTIONS handler cho CORS preflight.
 * Dùng chung cho mọi route, không cần lặp lại.
 *
 * @example
 * export const OPTIONS = createOptionsHandler();
 */
export function createOptionsHandler() {
  return function OPTIONS() {
    return handleOptions();
  };
}

/**
 * Wrapper chính cho mọi API route handler.
 *
 * Tự động xử lý:
 * - CORS headers trên MỌI response (success + error)
 * - Global try/catch với error response chuẩn
 * - Inject metadata { timestamp, version } vào response
 *
 * @example
 * export const GET = apiHandler(async (req, ctx) => {
 *   const data = await SomeService.getData();
 *   return ctx.success(data);
 * });
 *
 * export const POST = apiHandler(async (req, ctx) => {
 *   const body = await req.json();
 *   if (!body.name) return ctx.error("Thiếu trường name", 400);
 *   const result = await SomeService.create(body);
 *   return ctx.success(result, 201);
 * });
 */
export function apiHandler(handler: ApiRouteHandler, options: ApiHandlerOptions = {}) {
  const { version = "v1", cors = true } = options;

  let cacheControlHeader: string | null = null;
  let startTime = Date.now();

  // Hàm tạo metadata cho mỗi response
  const createMetadata = (): ResponseMetadata => ({
    timestamp: new Date().toISOString(),
    version,
    duration: Date.now() - startTime,
  });

  // Hàm gắn Headers (CORS, Cache) vào response
  const applyHeaders = (response: NextResponse): NextResponse => {
    if (cors) {
      const headers = corsHeaders();
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, String(value));
      }
    }
    if (cacheControlHeader) {
      response.headers.set("Cache-Control", cacheControlHeader);
    }
    return response;
  };

  // Context object cung cấp cho handler
  const ctx: ApiHandlerContext = {
    cache(maxAge: number, sMaxAge?: number) {
      const directives = [`public`, `max-age=${maxAge}`];
      if (sMaxAge) directives.push(`s-maxage=${sMaxAge}`);
      cacheControlHeader = directives.join(', ');
      return this;
    },

    success<T>(data: T, status: number = 200) {
      const body: StandardApiResponse<T> = {
        success: true,
        data,
        error: null,
        metadata: createMetadata(),
      };
      return applyHeaders(NextResponse.json(body, { status }) as NextResponse);
    },

    paginated<T>(data: T, pagination: PaginationMeta, status: number = 200) {
      const body: StandardApiResponse<T> = {
        success: true,
        data,
        error: null,
        metadata: createMetadata(),
        pagination,
      };
      return applyHeaders(NextResponse.json(body, { status }) as NextResponse);
    },

    error(message: string, status: number = 400, errorCode?: string, errorDetails?: unknown) {
      const body: StandardApiResponse<null> = {
        success: false,
        data: null,
        error: message,
        errorCode,
        errorDetails,
        metadata: createMetadata(),
      };
      return applyHeaders(NextResponse.json(body, { status }) as NextResponse);
    },
  };

  // Trả về hàm handler thực tế mà Next.js sẽ gọi
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async function wrappedHandler(req: NextRequest, routeContext?: any) {
    try {
      startTime = Date.now();
      return await handler(req, ctx, routeContext);
    } catch (error: unknown) {
      // --- Global Error Handler ---
      
      // 1. Xử lý ApiError có chủ đích
      if (error instanceof ApiError) {
        const body: StandardApiResponse<null> = {
          success: false,
          data: null,
          error: error.message,
          errorCode: error.errorCode,
          errorDetails: error.details,
          metadata: createMetadata(),
        };
        return applyHeaders(NextResponse.json(body, { status: error.statusCode }) as NextResponse);
      }

      // 2. Xử lý lỗi hệ thống (Internal Server Error)
      const errorMessage =
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định";

      console.error(`[API Error] ${req.method} ${req.nextUrl.pathname}:`, error);

      // Trong production, ẩn chi tiết lỗi kỹ thuật (Prisma, DB, v.v.)
      const clientMessage =
        process.env.NODE_ENV === "production"
          ? "Đã xảy ra lỗi hệ thống"
          : errorMessage;

      const body: StandardApiResponse<null> = {
        success: false,
        data: null,
        error: clientMessage,
        errorCode: "ERR_INTERNAL_SERVER_ERROR",
        metadata: createMetadata(),
      };
      return applyHeaders(NextResponse.json(body, { status: 500 }) as NextResponse);
    }
  };
}
