"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconLoader2,
  IconBook,
  IconClock,
  IconCheck,
  IconTrash,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateBookmarkStatusAction } from "@/features/library/actions/bookmark";

interface BookmarkButtonProps {
  storyId: number;
  initialLibraryStatus: string | null;
  className?: string;
  style?: React.CSSProperties;
  hideText?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  READING: { label: "Đang đọc", icon: IconBook, color: "text-blue-500" },
  WAITLIST: { label: "Chờ đọc", icon: IconClock, color: "text-orange-500" },
  COMPLETED: { label: "Đã hoàn thành", icon: IconCheck, color: "text-emerald-500" },
};

export function BookmarkButton({
  storyId,
  initialLibraryStatus,
  className,
  style,
  hideText = false,
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [currentStatus, setCurrentStatus] = useState<string | null>(initialLibraryStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = async (newStatus: string | null) => {
    if (!session) {
      toast.error("Vui lòng đăng nhập để lưu truyện");
      return;
    }

    setIsLoading(true);
    // Optimistic UI update
    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    setIsOpen(false);

    try {
      const result = await updateBookmarkStatusAction(storyId, newStatus);
      if (!result.success) {
        throw new Error(result.error || "Lỗi khi cập nhật tủ truyện");
      }
      setCurrentStatus(result.status ?? null);
      if (newStatus !== null) {
        toast.success(`Đã thêm vào: ${STATUS_CONFIG[newStatus]?.label || "Tủ truyện"}`);
      } else {
        toast.success("Đã xóa khỏi tủ truyện");
      }
    } catch (error) {
      // Revert on error
      setCurrentStatus(previousStatus);
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isBookmarked = currentStatus !== null;
  const activeConfig = currentStatus ? STATUS_CONFIG[currentStatus] : null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
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
          disabled={isLoading}
        >
          {isLoading ? (
            <IconLoader2 className="w-5 h-5 animate-spin" />
          ) : isBookmarked ? (
            <>
              <IconBookmarkFilled className="w-5 h-5" />
              {!hideText && (activeConfig?.label || "Đã Lưu")}
            </>
          ) : (
            <>
              <IconBookmark className="w-5 h-5" />
              {!hideText && "Lưu Trữ"}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-lg">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium px-2 py-1.5">
          Thêm vào danh sách...
        </DropdownMenuLabel>
        
        {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
          const StatusIcon = config.icon;
          const isActive = currentStatus === statusKey;
          
          return (
            <DropdownMenuItem
              key={statusKey}
              onClick={() => handleStatusChange(statusKey)}
              className={cn(
                "flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 my-0.5 font-medium transition-colors",
                isActive ? "bg-primary/10 text-primary focus:bg-primary/15" : "focus:bg-muted"
              )}
            >
              <StatusIcon className={cn("w-4 h-4", isActive ? "text-primary" : config.color)} />
              <span>{config.label}</span>
              {isActive && <IconCheck className="w-4 h-4 ml-auto text-primary" />}
            </DropdownMenuItem>
          );
        })}
        
        {isBookmarked && (
          <>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem
              onClick={() => handleStatusChange(null)}
              className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 my-0.5 text-destructive focus:bg-destructive/10 focus:text-destructive font-medium transition-colors"
            >
              <IconTrash className="w-4 h-4" />
              <span>Bỏ theo dõi</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
