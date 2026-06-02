/**
 * Lớp lỗi chuẩn dùng chung cho toàn bộ API.
 * 
 * Cho phép throw các lỗi có kèm theo HTTP Status code, 
 * mã định danh lỗi (errorCode) cho Mobile App xử lý, 
 * và chi tiết lỗi nếu có (details).
 */
export class ApiError extends Error {
  public statusCode: number;
  public errorCode?: string;
  public details?: unknown;

  constructor(
    message: string,
    statusCode: number = 400,
    errorCode?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;

    // Giữ nguyên stack trace của V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  // --- Các helper static hỗ trợ tạo lỗi nhanh ---

  static badRequest(message: string = 'Bad Request', errorCode: string = 'ERR_BAD_REQUEST', details?: unknown) {
    return new ApiError(message, 400, errorCode, details);
  }

  static unauthorized(message: string = 'Unauthorized', errorCode: string = 'ERR_UNAUTHORIZED') {
    return new ApiError(message, 401, errorCode);
  }

  static forbidden(message: string = 'Forbidden', errorCode: string = 'ERR_FORBIDDEN') {
    return new ApiError(message, 403, errorCode);
  }

  static notFound(message: string = 'Not Found', errorCode: string = 'ERR_NOT_FOUND') {
    return new ApiError(message, 404, errorCode);
  }

  static internal(message: string = 'Internal Server Error', errorCode: string = 'ERR_INTERNAL_SERVER_ERROR', details?: unknown) {
    return new ApiError(message, 500, errorCode, details);
  }
}
