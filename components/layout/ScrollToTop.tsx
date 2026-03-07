"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
    <Button
      onClick={scrollToTop}
      aria-label="Quay lại đầu trang"
      variant="ghost"
    >
      <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
    </Button>
  );
}
