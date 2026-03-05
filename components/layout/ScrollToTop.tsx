"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Theo dõi vị trí cuộn chuột
  useEffect(() => {
    const toggleVisibility = () => {
      // Hiện nút khi cuộn xuống quá 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Cleanup function để tránh memory leak
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Hàm xử lý cuộn lên đầu trang mượt mà
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Quay lại đầu trang"
      className={cn(
        "fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50 p-3 sm:p-3.5 rounded-full",
        "bg-background/70 backdrop-blur-md border border-border/50 shadow-lg",
        "text-muted-foreground hover:text-primary hover:bg-muted/50 hover:border-primary/50 hover:shadow-primary/20",
        "transition-all duration-300 ease-in-out",
        // Logic ẩn/hiện với hiệu ứng trượt và mờ
        isVisible
          ? "opacity-100 translate-y-0 visible"
          : "opacity-0 translate-y-8 invisible pointer-events-none",
      )}
    >
      <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
    </button>
  );
}
