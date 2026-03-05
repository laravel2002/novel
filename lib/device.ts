import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export type DeviceType = "mobile" | "tablet" | "desktop";

// Điểm neo Breakpoint dùng chung cho Tailwind và JS (tối ưu hóa thiết kế Mobile-first)
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

/**
 * Trình phân tích chuỗi User Agent được tối ưu hiệu năng để phát hiện loại thiết bị.
 */
export function getDeviceTypeFromString(ua: string): DeviceType {
  const isMobile = /mobile/i.test(ua);
  const isTablet = /ipad|tablet/i.test(ua);

  // Ưu tiên check Tablet trước vì một số định danh tablet có đi kèm chữ mobile
  if (isTablet) return "tablet";
  if (isMobile) return "mobile";

  // Mặc định cho Desktop / Bot / Unknown
  return "desktop";
}

/**
 * Gọi hàm này bên trong Server Components (e.g., page, layout)
 * bằng cách truyền `headers()` từ next/headers
 */
export function getDeviceTypeFromHeaders(
  headersList: ReadonlyHeaders,
): DeviceType {
  const userAgentStr = headersList.get("user-agent") || "";
  return getDeviceTypeFromString(userAgentStr);
}
