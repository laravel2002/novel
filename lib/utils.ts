import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null || isNaN(num)) return "0";

  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }

  return new Intl.NumberFormat("vi-VN").format(num);
}

export function removeAccents(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}
/**
 * Chuẩn hóa chuỗi tiếng Việt về định dạng chuẩn (NFC), xóa ký tự rác và đồng bộ dấu xuống dòng
 */
export function normalizeVietnameseText(text?: string | null): string {
  if (!text) return "";

  return (
    text
      // 1. Chuẩn hóa về Unicode dựng sẵn (NFC - Chuẩn chung cho tiếng Việt)
      .normalize("NFC")

      // 2. Xóa các ký tự "tàng hình" (Zero-width spaces) thường sinh ra khi cào web
      .replace(/[\u200B-\u200D\uFEFF]/g, "")

      // 3. Đồng bộ hóa các kiểu xuống dòng (Windows \r\n hoặc Mac \r) về một chuẩn duy nhất là \n
      .replace(/\r\n?/g, "\n")

      // 4. (Tùy chọn) Xóa các khoảng trắng thừa ở đầu và cuối chuỗi
      .trim()
  );
}

/**
 * Lấy đường dẫn ảnh cover đầy đủ (thêm domain https://www.tiemtruyenchu.com nếu là ảnh cấu hình đường dẫn tương đối)
 */
export function getImageUrl(url?: string | null): string {
  if (!url) return "https://placehold.co/400x600/png";
  if (url.startsWith("http")) return url;
  return `https://www.tiemtruyenchu.com${url.startsWith("/") ? "" : "/"}${url}`;
}
