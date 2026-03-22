// Xóa dòng import type { NextConfig } đi cho nhẹ nợ

/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- 1. CẤU HÌNH HÌNH ẢNH ---
  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "www.tiemtruyenchu.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  // --- 2. TỐI ƯU HIỆU SUẤT ---
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "lucide-react"],
  },

  // Tôi tạm thời comment dòng này lại vì nó không phải config chuẩn của Next.js
  // Nếu web bạn chạy dev bị lỗi CORS thì hãy mở ra nhé
  // allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],

  // --- 3. HACK TỐC ĐỘ BUILD TRÊN VERCEL ---
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
