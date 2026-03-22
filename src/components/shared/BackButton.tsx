"use client";

import { useRouter } from "next/navigation";
import { IconChevronLeft } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  fallbackPath?: string;
}

export function BackButton({ className, fallbackPath = "/" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Kiểm tra xem có lịch sử trình duyệt không
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackPath);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        "inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-300 backdrop-blur-md border border-white/10 shadow-sm hover:scale-105",
        className,
      )}
      title="Quay lại"
    >
      <IconChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
  );
}
