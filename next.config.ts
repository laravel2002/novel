import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // --- 1. CẤU HÌNH HÌNH ẢNH (Tối ưu Image Component) ---
  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "www.tiemtruyenchu.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // --- 2. CẤU HÌNH TỐI ƯU HIỆU SUẤT (Load package nhanh hơn) ---
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "lucide-react"],
  },
  turbopack: {},

  // --- 3. CẤU HÌNH BẢO MẬT & MÔI TRƯỜNG DEV ---
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],

  // --- 4. HACK TỐC ĐỘ BUILD TRÊN VERCEL (Bỏ qua check lỗi chậm chạp) ---
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
