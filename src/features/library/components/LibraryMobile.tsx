"use client";

import { useState, useTransition, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  IconClock,
  IconEye,
  IconStar,
  IconBook2,
  IconTrash,
  IconBookmarkOff,
  IconRefresh,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";
import type { LibraryViewProps } from "./LibraryDesktop";
import { removeReadingHistory } from "@/features/history/services/history";
import { toggleBookmarkAction } from "@/features/library/actions/bookmark";
import { Button } from "@/components/ui/button";
import { ReactNode, Suspense } from "react";

export function LibraryMobile({
  userId,
  readingHistory: initialHistory = [],
  bookmarks: initialBookmarks = [],
  waitlist: initialWaitlist = [],
  completed: initialCompleted = [],
  activeTab = "history",
  historyTab,
  bookmarksTab,
  waitlistTab,
  completedTab,
}: LibraryViewProps & { activeTab?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Optimistic UI States
  const [localHistory, setLocalHistory] = useState(initialHistory);
  const [localBookmarks, setLocalBookmarks] = useState(initialBookmarks);
  const [localWaitlist, setLocalWaitlist] = useState(initialWaitlist);
  const [localCompleted, setLocalCompleted] = useState(initialCompleted);

  // 🔄 ĐỒNG BỘ LẠI KHI PROPS THAY ĐỔI
  useEffect(() => {
    setLocalHistory(initialHistory);
  }, [initialHistory]);

  useEffect(() => {
    setLocalBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  useEffect(() => {
    setLocalWaitlist(initialWaitlist);
  }, [initialWaitlist]);

  useEffect(() => {
    setLocalCompleted(initialCompleted);
  }, [initialCompleted]);

  // --- Handlers ---
  const handleRemoveHistory = async (storyId: number) => {
    // 🔍 Tìm item trong history để biết thông tin truyện
    const historyItem = localHistory.find((item) => item.storyId === storyId);

    // 1. Optimistic Update
    setLocalHistory((prev) => prev.filter((item) => item.storyId !== storyId));

    // 🔄 Nếu truyện đang được bookmark, đẩy lại vào waitlist (Chờ đọc)
    const isBookmarked = localBookmarks.some((b) => b.id === storyId);
    if (isBookmarked && historyItem) {
      const storyData = historyItem.Story;
      setLocalWaitlist((prev) => {
        if (prev.some((p) => p.id === storyId)) return prev;
        return [
          {
            ...storyData,
            rating: 0,
            views: 0,
            bookmarkedAt: new Date(),
          },
          ...prev,
        ];
      });
    }

    // 2. API Call
    if (userId) {
      try {
        await removeReadingHistory(userId, storyId);
        startTransition(() => {
          router.refresh();
        });
      } catch (err) {
        console.error("Lỗi khi xóa lịch sử:", err);
      }
    }
  };

  const handleToggleBookmark = async (storyId: number) => {
    // 1. Optimistic Update
    setLocalBookmarks((prev) => prev.filter((item) => item.id !== storyId));
    setLocalWaitlist((prev) => prev.filter((item) => item.id !== storyId));
    setLocalCompleted((prev) => prev.filter((item) => item.id !== storyId));

    // 2. Gọi Server Action
    try {
      const res = await toggleBookmarkAction(storyId);
      
      if (!res.success) {
        console.error("Lỗi khi hủy theo dõi:", res.error);
      }
      // Khong can router.refresh() vi server action da co revalidatePath
    } catch (e) {
      console.error("Lỗi khi hủy theo dõi:", e);
    }
  };

  return (
    <div className="w-full px-4 py-6 mt-16 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
          <IconBook2 className="w-6 h-6 text-primary" /> Tủ Truyện
        </h1>
        <p className="text-sm text-muted-foreground">
          Quản lý lịch sử đọc và truyện đang theo dõi
        </p>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        {/* Mobile Tabs Scrollable */}
        <div className="w-full overflow-x-auto pb-2 mb-4 scrollbar-none">
          <TabsList className="h-auto flex gap-1 justify-start p-1 w-max bg-secondary/20">
            <TabsTrigger
              value="history"
              className="text-xs px-4 py-2 shrink-0 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              Đang đọc
            </TabsTrigger>
            <TabsTrigger
              value="bookmarks"
              className="text-xs px-4 py-2 shrink-0 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              Dấu trang
            </TabsTrigger>
            <TabsTrigger
              value="waitlist"
              className="text-xs px-4 py-2 shrink-0 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              Chờ đọc
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-xs px-4 py-2 shrink-0 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              Đã hoàn thành
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- ĐANG ĐỌC (HISTORY) --- */}
        <TabsContent value="history" className="space-y-4 outline-none">
          {historyTab ? (
            historyTab
          ) : localHistory.length === 0 ? (
            <EmptyState message="Chưa có lịch sử đọc truyện nào." />
          ) : (
            <div className="flex flex-col gap-3">
              {localHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-card p-3 border border-border/50 rounded-xl shadow-sm relative active:scale-[0.98] transition-all"
                >
                  <Link
                    href={`/truyen/${item.Story.slug}`}
                    className="shrink-0"
                  >
                    <div className="relative w-16 h-24 rounded-md overflow-hidden bg-muted shadow-sm">
                      <Image
                        src={getImageUrl(item.Story.coverUrl)}
                        alt={item.Story.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </Link>
                  <div className="flex flex-col flex-1 py-0.5">
                    <Link href={`/truyen/${item.Story.slug}`} className="pr-8">
                      <h3 className="font-bold line-clamp-2 text-sm leading-snug">
                        {item.Story.title}
                      </h3>
                    </Link>
                    <div className="mt-auto pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[11px] font-medium text-primary">
                          Chương {item.Chapter.chapterNum}
                        </p>
                        <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                          <IconClock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(item.updatedAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                      </div>

                      {/* Percent line / Progress Bar */}
                      {typeof item.scrollPercentage === "number" && (
                        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${Math.max(5, item.scrollPercentage)}%`,
                            }}
                          />
                        </div>
                      )}

                      <Link
                        href={`/truyen/${item.Story.slug}/chuong-${item.Chapter.chapterNum}${item.scrollPercentage ? `?scroll=${item.scrollPercentage}` : ""}`}
                        className="inline-flex flex-1 items-center justify-center hover:scale-[1.02] bg-[#f97316] text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-all w-full shadow-md shadow-orange-500/20"
                      >
                        Đọc tiếp{" "}
                        {item.scrollPercentage && item.scrollPercentage > 0
                          ? `${Math.round(item.scrollPercentage)}%`
                          : ""}
                      </Link>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveHistory(item.storyId);
                    }}
                    className="absolute top-2 right-2 p-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- DẤU TRANG --- */}
        <TabsContent value="bookmarks" className="space-y-4 outline-none">
          {bookmarksTab ? (
            bookmarksTab
          ) : localBookmarks.length === 0 ? (
            <EmptyState message="Bạn chưa theo dõi truyện nào." />
          ) : (
            <div className="flex flex-col gap-3">
              {localBookmarks.map((story) => (
                <div
                  key={story.id}
                  className="flex gap-3 bg-card p-3 border border-border/50 rounded-xl shadow-sm relative active:scale-[0.98] transition-all"
                >
                  <Link
                    href={`/truyen/${story.slug}`}
                    className="shrink-0"
                  >
                    <div className="relative w-16 h-24 rounded-md overflow-hidden bg-muted shadow-[0_4px_10px_rgb(0,0,0,0.2)]">
                      <Badge className="absolute top-1 left-1 text-[9px] px-1 py-0 bg-black/60 text-white backdrop-blur-sm border-none z-10">
                        {story.status === "COMPLETED" ? "Full" : "Đang ra"}
                      </Badge>
                      <Image
                        src={getImageUrl(story.coverUrl)}
                        alt={story.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </Link>
                  <div className="flex flex-col flex-1 py-0.5">
                    <Link href={`/truyen/${story.slug}`} className="pr-8">
                      <h3 className="font-bold line-clamp-2 text-sm leading-snug">
                        {story.title}
                      </h3>
                    </Link>
                    <div className="mt-auto pt-2">
                      <div className="flex items-center justify-between mb-1.5 opacity-80">
                        <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                          <IconClock className="w-3 h-3" />
                          {story.bookmarkedAt ? formatDistanceToNow(new Date(story.bookmarkedAt), {
                            addSuffix: true,
                            locale: vi,
                          }) : "Đã lưu"}
                        </span>
                      </div>

                      <Link
                        href={`/truyen/${story.slug}`}
                        className="inline-flex flex-1 items-center justify-center hover:scale-[1.02] bg-[#f97316] text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-all w-full shadow-md shadow-orange-500/20"
                      >
                        Đọc truyện
                      </Link>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleBookmark(story.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <IconBookmarkOff className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- CHỜ ĐỌC --- */}
        <TabsContent value="waitlist" className="space-y-4 outline-none">
          {waitlistTab ? (
            waitlistTab
          ) : localWaitlist.length === 0 ? (
            <EmptyState message="Không có truyện nào đang chờ đọc." />
          ) : (
            <div className="flex flex-col gap-3">
              {localWaitlist.map((story) => (
                <div
                  key={story.id}
                  className="flex gap-3 bg-card p-3 border border-border/50 rounded-xl shadow-sm relative active:scale-[0.98] transition-all"
                >
                  <Link
                    href={`/truyen/${story.slug}`}
                    className="shrink-0"
                  >
                    <div className="relative w-16 h-24 rounded-md overflow-hidden bg-muted shadow-[0_4px_10px_rgb(0,0,0,0.2)]">
                      <Badge className="absolute top-1 left-1 text-[9px] px-1 py-0 bg-black/60 text-white backdrop-blur-sm border-none z-10">
                        Chờ đọc
                      </Badge>
                      <Image
                        src={getImageUrl(story.coverUrl)}
                        alt={story.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </Link>
                  <div className="flex flex-col flex-1 py-0.5">
                    <Link href={`/truyen/${story.slug}`} className="pr-8">
                      <h3 className="font-bold line-clamp-2 text-sm leading-snug">
                        {story.title}
                      </h3>
                    </Link>
                    <div className="mt-auto pt-2">
                      <div className="flex items-center justify-between mb-1.5 opacity-80">
                        <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                          <IconClock className="w-3 h-3" />
                          {story.bookmarkedAt ? formatDistanceToNow(new Date(story.bookmarkedAt), {
                            addSuffix: true,
                            locale: vi,
                          }) : "Đã lưu"}
                        </span>
                      </div>

                      <Link
                        href={`/truyen/${story.slug}`}
                        className="inline-flex flex-1 items-center justify-center hover:scale-[1.02] bg-[#f97316] text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-all w-full shadow-md shadow-orange-500/20"
                      >
                        Đọc truyện
                      </Link>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleBookmark(story.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <IconBookmarkOff className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- ĐÃ HOÀN THÀNH --- */}
        <TabsContent value="completed" className="space-y-4 outline-none">
          {completedTab ? (
            completedTab
          ) : localCompleted.length === 0 ? (
            <EmptyState message="Chưa đọc xong truyện nào." />
          ) : (
            <div className="flex flex-col gap-4">
              {localCompleted.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-card/60 p-3 border border-border/50 rounded-xl shadow-sm relative"
                >
                  <Link
                    href={`/truyen/${item.slug}`}
                    className="shrink-0"
                  >
                    <div className="relative w-16 h-24 rounded-md overflow-hidden bg-muted grayscale shadow-sm group-hover:grayscale-0 transition-all">
                      <Image
                        src={getImageUrl(item.coverUrl)}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </Link>
                  <div className="flex flex-col flex-1 py-0.5">
                    <Link href={`/truyen/${item.slug}`} className="pr-8">
                      <h3 className="font-bold line-clamp-2 text-sm leading-snug">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="mt-auto pt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-sm border border-green-200 dark:border-green-500/20">
                          Đã Hoàn Thành
                        </span>
                      </div>
                      <Link
                        href={`/truyen/${item.slug}`}
                        className="inline-flex items-center justify-center gap-1 mt-2 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full w-full transition-colors"
                      >
                        <IconRefresh className="w-3 h-3" /> Đọc lại
                      </Link>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleBookmark(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <IconBookmarkOff className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-secondary/10 border border-border/50 rounded-xl outline-dashed outline-1 outline-border/50 outline-offset-[-4px]">
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <Link href="/kham-pha">
        <Button
          size="sm"
          className="rounded-full px-6 shadow-md font-medium text-xs"
        >
          Khám phá truyện mới
        </Button>
      </Link>
    </div>
  );
}
