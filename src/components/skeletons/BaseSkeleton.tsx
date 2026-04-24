"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BaseSkeletonProps {
  className?: string;
}

/**
 * BaseSkeleton - Thành phần nền tảng cho hiệu ứng Loading Skeleton.
 * Sử dụng framer-motion để tạo hiệu ứng "Luxury Shimmer" mượt mà.
 */
export default function BaseSkeleton({ className }: BaseSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-[#1d1d1b] isolate shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      {/* Lớp shimmer gradient - Chạy từ trái qua phải */}
      <motion.div
        className="absolute inset-0 z-10"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 1.8,
          ease: "easeInOut",
        }}
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(217, 119, 87, 0.08) 50%, transparent 100%)",
        }}
      />

      {/* Lớp nền tĩnh để tạo chiều sâu */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    </div>
  );
}
