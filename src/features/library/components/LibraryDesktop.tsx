"use client";

import { useState, useTransition, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Prisma } from "@/generated/prisma/client";
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
import { removeReadingHistory } from "@/features/history/services/history";
import { toggleBookmarkAction } from "@/features/library/actions/bookmark";

// 🛡️ ĐỊNH NGHĨA TYPE CHUẨN TỪ PRISMA
// 🛡️ ĐỊNH NGHĨA TYPE CHUẨN TỪ PRISMA (Đã đồng bộ với hàm service)
type ReadingHistoryType = Prisma.ReadingHistoryGetPayload<{
  include: {
    Story: {
      select: {
        id: true;
        title: true;
        slug: true;
        coverUrl: true;
        status: true;
      };
    };
    Chapter: {
      select: {
        id: true;
        title: true;
        chapterNum: true;
      };
    };
  };
}>;

type BookmarkType = Prisma.StoryGetPayload<{
  select: {
    id: true;
    slug: true;
    title: true;
    coverUrl: true;
    status: true;
    rating: true;
    views: true;
  };
}> & { bookmarkedAt?: Date };

export interface LibraryViewProps {
  userId: string;
  readingHistory: ReadingHistoryType[];
  bookmarks: BookmarkType[];
  waitlist: BookmarkType[];
  completed: BookmarkType[];
  historyTab?: React.ReactNode;
  bookmarksTab?: React.ReactNode;
  waitlistTab?: React.ReactNode;
  completedTab?: React.ReactNode;
}

export function LibraryDesktop({
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

  // 🚀 OPTIMISTIC UI STATES
  const [localHistory, setLocalHistory] = useState(initialHistory);
  const [localBookmarks, setLocalBookmarks] = useState(initialBookmarks);
  const [localWaitlist, setLocalWaitlist] = useState(initialWaitlist);
  const [localCompleted, setLocalCompleted] = useState(initialCompleted);

  // 🔄 ĐỒNG BỘ LẠI KHI PROPS THAY ĐỔI (Sau router.refresh)
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

  // --- HANDLERS ---
  const handleRemoveHistory = async (storyId: number) => {
    // 🔍 Tìm item trong history để biết thông tin truyện
    const historyItem = localHistory.find((item) => item.storyId === storyId);

    // 1. Cập nhật giao diện ngay lập tức
    setLocalHistory((prev) => prev.filter((item) => item.storyId !== storyId));

    // 🔄 Nếu truyện này ĐANG nằm trong Bookmarks, sau khi xoá History nó phải hiện ở Waitlist (Chờ đọc)
    const isBookmarked = localBookmarks.some((b) => b.id === storyId);
    if (isBookmarked && historyItem) {
      const storyData = historyItem.Story;
      // Chuyển story thô vào waitlist
      setLocalWaitlist((prev) => {
        if (prev.some((p) => p.id === storyId)) return prev;
        return [
          {
            ...storyData,
            rating: 0, // Mock hoặc giữ nguyên
            views: 0,
            bookmarkedAt: new Date(),
          },
          ...prev,
        ];
      });
    }

    // 2. Gọi API ngầm
    if (userId) {
      try {
        await removeReadingHistory(userId, storyId);
        // Không cần refresh() ngay lập tức để tránh giật lag, 
        // Sync ngầm bằng transition
        startTransition(() => {
          router.refresh();
        });
      } catch (err) {
        console.error("Lỗi khi xóa lịch sử:", err);
      }
    }
  };

  const handleToggleBookmark = async (storyId: number) => {
    // 🔍 Kiểm tra xem đang Bookmark hay Unbookmark
    const isCurrentlyBookmarked = localBookmarks.some((b) => b.id === storyId);

    // 1. Cập nhật giao diện ngay lập tức (Xóa khỏi danh sách hiện tại)
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
    <div className="container max-w-7xl mx-auto py-8 px-4 mt-16 mt-[70px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <IconBook2 className="w-8 h-8 text-primary" /> Tủ Truyện
        </h1>
        <p className="text-muted-foreground">
          Quản lý lịch sử đọc và truyện đang theo dõi của bạn
        </p>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="mb-6 h-auto flex gap-2 justify-start p-1 w-full md:w-max max-w-full">
          <TabsTrigger
            value="history"
            className="text-sm md:text-base px-4 md:px-6 shrink-0"
          >
            Đang đọc
          </TabsTrigger>
          <TabsTrigger
            value="bookmarks"
            className="text-sm md:text-base px-4 md:px-6 shrink-0"
          >
            Dấu trang
          </TabsTrigger>
          <TabsTrigger
            value="waitlist"
            className="text-sm md:text-base px-4 md:px-6 shrink-0"
          >
            Chờ đọc
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="text-sm md:text-base px-4 md:px-6 shrink-0"
          >
            Đã hoàn thành
          </TabsTrigger>
        </TabsList>

        {/* --- TAB ĐANG ĐỌC --- */}
        <TabsContent value="history" className="space-y-4">
          {historyTab ? (
            historyTab
          ) : localHistory.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Chưa có lịch sử đọc truyện nào.
              </p>
              <Link
                href="/"
                className="text-primary hover:underline mt-2 inline-block"
              >
                Khám phá truyện mới
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {localHistory.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col bg-card hover:bg-muted/50 border rounded-xl overflow-hidden transition-colors shadow-sm min-h-36"
                >
                  <div className="flex gap-4 p-4 h-full">
                    <Link
                      href={`/truyen/${item.Story.slug}`}
                      className="shrink-0"
                    >
                      <div className="relative w-20 h-28 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={getImageUrl(item.Story.coverUrl)}
                          alt={item.Story.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>
                    <div className="flex flex-col flex-1 py-1 overflow-hidden">
                      <Link
                        href={`/truyen/${item.Story.slug}`}
                        className="hover:text-primary transition-colors pr-6"
                      >
                        <h3 className="font-bold line-clamp-2 text-sm mb-1">
                          {item.Story.title}
                        </h3>
                      </Link>
                      <div className="mt-auto">
                        <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                          Đã đọc đến: Chương {item.Chapter.chapterNum}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                          <IconClock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(item.updatedAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                        <Link
                          href={`/truyen/${item.Story.slug}/chuong-${item.Chapter.chapterNum}${item.scrollPercentage ? `?scroll=${item.scrollPercentage}` : ""}`}
                          className="inline-block hover:scale-[1.02] bg-[#f97316] text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-[#ea580c] transition-all w-full text-center shadow-md shadow-orange-500/20"
                        >
                          Đọc tiếp{" "}
                          {item.scrollPercentage
                            ? `(${Math.round(item.scrollPercentage)}%)`
                            : ""}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* NÚT XÓA */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveHistory(item.storyId);
                    }}
                    className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                    title="Xóa khỏi lịch sử"
                  >
                    <IconTrash className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- TAB DẤU TRANG --- */}
        <TabsContent value="bookmarks" className="space-y-4">
          {bookmarksTab ? (
            bookmarksTab
          ) : localBookmarks.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Bạn chưa theo dõi truyện nào.
              </p>
              <Link
                href="/"
                className="text-primary hover:underline mt-2 inline-block"
              >
                Khám phá truyện mới
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {localBookmarks.map((story) => (
                <div
                  key={story.id}
                  className="group relative flex flex-col bg-card hover:bg-muted/50 border rounded-xl overflow-hidden transition-colors shadow-sm min-h-36"
                >
                  <div className="flex gap-4 p-4 h-full">
                    <Link
                      href={`/truyen/${story.slug}`}
                      className="shrink-0"
                    >
                      <div className="relative w-20 h-28 rounded-md overflow-hidden bg-muted shadow-[0_4px_10px_rgb(0,0,0,0.2)]">
                        <Badge className="absolute top-1 left-1 text-[9px] px-1 py-0 bg-black/60 text-white backdrop-blur-sm border-none z-10">
                          {story.status === "COMPLETED" ? "Full" : "Đang ra"}
                        </Badge>
                        <Image
                          src={getImageUrl(story.coverUrl)}
                          alt={story.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>
                    <div className="flex flex-col flex-1 py-1 overflow-hidden">
                      <Link
                        href={`/truyen/${story.slug}`}
                        className="hover:text-primary transition-colors pr-6"
                      >
                        <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-1">
                          {story.title}
                        </h3>
                      </Link>
                      <div className="mt-auto">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mb-1.5 opacity-80">
                          <span className="flex items-center gap-1">
                            <IconStar className="w-3.5 h-3.5 fill-[#f97316] text-[#f97316]" />
                            {story.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <IconEye className="w-3.5 h-3.5" />
                            {story.views}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-3 flex items-center gap-1 opacity-80">
                          <IconClock className="w-3.5 h-3.5" />
                          {story.bookmarkedAt ? formatDistanceToNow(new Date(story.bookmarkedAt), {
                            addSuffix: true,
                            locale: vi,
                          }) : "Đã lưu"}
                        </p>
                        <Link
                          href={`/truyen/${story.slug}`}
                          className="inline-block hover:scale-[1.02] bg-[#f97316] text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-[#ea580c] transition-all w-full text-center shadow-md shadow-orange-500/20"
                        >
                          Đọc truyện
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* NÚT HỦY THEO DÕI */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleBookmark(story.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                    title="Bỏ theo dõi"
                  >
                    <IconBookmarkOff className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- TAB CHỜ ĐỌC --- */}
        <TabsContent value="waitlist" className="space-y-4">
          {waitlistTab ? (
            waitlistTab
          ) : localWaitlist.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Không có truyện nào đang chờ đọc.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {localWaitlist.map((story) => (
                <div
                  key={story.id}
                  className="group relative flex flex-col bg-card hover:bg-muted/50 border rounded-xl overflow-hidden transition-colors shadow-sm min-h-36"
                >
                  <div className="flex gap-4 p-4 h-full">
                    <Link
                      href={`/truyen/${story.slug}`}
                      className="shrink-0"
                    >
                      <div className="relative w-20 h-28 rounded-md overflow-hidden bg-muted shadow-[0_4px_10px_rgb(0,0,0,0.2)]">
                        <Badge className="absolute top-1 left-1 text-[9px] px-1 py-0 bg-black/60 text-white backdrop-blur-sm border-none z-10">
                          Chờ đọc
                        </Badge>
                        <Image
                          src={getImageUrl(story.coverUrl)}
                          alt={story.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>
                    <div className="flex flex-col flex-1 py-1 overflow-hidden">
                      <Link
                        href={`/truyen/${story.slug}`}
                        className="hover:text-primary transition-colors pr-6"
                      >
                        <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-1">
                          {story.title}
                        </h3>
                      </Link>
                      <div className="mt-auto">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mb-1.5 opacity-80">
                          <span className="flex items-center gap-1">
                            <IconStar className="w-3.5 h-3.5 fill-[#f97316] text-[#f97316]" />
                            {story.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <IconEye className="w-3.5 h-3.5" />
                            {story.views}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-3 flex items-center gap-1 opacity-80">
                          <IconClock className="w-3.5 h-3.5" />
                          {story.bookmarkedAt ? formatDistanceToNow(new Date(story.bookmarkedAt), {
                            addSuffix: true,
                            locale: vi,
                          }) : "Đã lưu"}
                        </p>
                        <Link
                          href={`/truyen/${story.slug}`}
                          className="inline-block hover:scale-[1.02] bg-[#f97316] text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-[#ea580c] transition-all w-full text-center shadow-md shadow-orange-500/20"
                        >
                          Đọc truyện
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* NÚT HỦY CHỜ ĐỌC */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleBookmark(story.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                    title="Xóa khỏi danh sách"
                  >
                    <IconBookmarkOff className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- TAB ĐÃ HOÀN THÀNH --- */}
        <TabsContent value="completed" className="space-y-4">
          {completedTab ? (
            completedTab
          ) : localCompleted.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Bạn chưa đọc xong truyện nào.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {localCompleted.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col bg-card hover:bg-muted/50 border rounded-xl overflow-hidden shadow-sm min-h-36 opacity-90 hover:opacity-100 transition-all"
                >
                  <div className="flex gap-4 p-4 h-full">
                    <Link
                      href={`/truyen/${item.slug}`}
                      className="shrink-0"
                    >
                      <div className="relative w-20 h-28 rounded-md overflow-hidden bg-muted group-hover:shadow-[0_4px_10px_rgb(0,0,0,0.15)] transition-all">
                        <Image
                          src={getImageUrl(item.coverUrl)}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>
                    <div className="flex flex-col flex-1 py-1 overflow-hidden">
                      <Link
                        href={`/truyen/${item.slug}`}
                        className="hover:text-primary transition-colors pr-6"
                      >
                        <h3 className="font-bold line-clamp-2 text-sm mb-1">
                          {item.title}
                        </h3>
                      </Link>
                      <div className="mt-auto">
                        <Badge
                          variant="outline"
                          className="mb-2 bg-green-500/10 text-green-600 border-green-200"
                        >
                          Hoàn Thành
                        </Badge>
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                          <IconClock className="w-3 h-3" /> Cập nhật:{" "}
                          {item.bookmarkedAt ? formatDistanceToNow(new Date(item.bookmarkedAt), {
                            addSuffix: true,
                            locale: vi,
                          }) : "Đã lưu"}
                        </p>
                        <Link
                          href={`/truyen/${item.slug}`}
                          className="inline-flex items-center justify-center gap-1 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full w-full transition-colors"
                        >
                          <IconRefresh className="w-3 h-3" /> Đọc lại
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* NÚT BỎ THEO DÕI */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleBookmark(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                    title="Bỏ theo dõi"
                  >
                    <IconBookmarkOff className="w-5 h-5" />
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
