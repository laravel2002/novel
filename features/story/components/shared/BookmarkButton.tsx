"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconLoader2,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  storyId: number;
  initialBookmarked: boolean;
  className?: string;
  style?: React.CSSProperties;
  hideText?: boolean;
}

export function BookmarkButton({
  storyId,
  initialBookmarked,
  className,
  style,
  hideText = false,
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleBookmark = async () => {
    if (!session) {
      toast.error("Vui lòng đăng nhập để lưu truyện");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/library/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storyId }),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi cập nhật tủ truyện");
      }

      const data = await response.json();
      setIsBookmarked(data.bookmarked);

      if (data.bookmarked) {
        toast.success("Đã thêm vào tủ truyện");
      } else {
        toast.success("Đã xóa khỏi tủ truyện");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      size="lg"
      className={cn(
        "w-full h-12 rounded-xl text-base font-bold transition-all subtle-border flex items-center justify-center gap-2",
        isBookmarked
          ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md"
          : "bg-background hover:bg-primary/5 hover:text-primary hover:border-primary/30",
        hideText && "px-0 w-12",
        className,
      )}
      style={style}
      onClick={handleToggleBookmark}
      disabled={isLoading}
    >
      {isLoading ? (
        <IconLoader2 className="w-5 h-5 animate-spin" />
      ) : isBookmarked ? (
        <>
          <IconBookmarkFilled className="w-5 h-5" />
          {!hideText && "Đã Lưu"}
        </>
      ) : (
        <>
          <IconBookmark className="w-5 h-5" />
          {!hideText && "Lưu Trữ"}
        </>
      )}
    </Button>
  );
}
