"use client";

import { useReadingProgress } from "@/lib/contexts/ReadingProgressContext";
import { useBookmark } from "@/lib/contexts/BookmarkContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { IconClock, IconBook2 } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { getImageUrl } from "@/lib/utils";

export function GuestLibrary() {
  const { progress } = useReadingProgress();
  const { bookmarks } = useBookmark();

  // Chuyển đổi object progress thành mảng để render
  const historyArray = Object.entries(progress)
    .map(([slug, data]) => ({
      slug,
      ...data,
    }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 mt-16 mt-[70px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <IconBook2 className="w-8 h-8 text-primary" /> Tủ Truyện (Máy Khách)
        </h1>
        <p className="text-muted-foreground">
          Quản lý lịch sử đọc và truyện đang theo dõi được lưu trên trình duyệt
          của bạn. Nên đăng nhập để đồng bộ qua các thiết bị.
        </p>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="mb-6 h-12">
          <TabsTrigger value="history" className="text-base px-6 h-10">
            Lịch sử đọc
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="text-base px-6 h-10">
            Đang theo dõi
          </TabsTrigger>
        </TabsList>

        {/* Tab Lịch sử đọc */}
        <TabsContent value="history" className="space-y-4">
          {historyArray.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Chưa có lịch sử đọc truyện nào trên thiết bị này.
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
              {historyArray.map((item) => (
                <div
                  key={item.slug}
                  className="group relative flex flex-col bg-card hover:bg-muted/50 border rounded-xl overflow-hidden transition-colors shadow-sm min-h-36"
                >
                  {/* Hiển thị tiến độ kiểu mỏng dưới đáy thumbnail hoặc header */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${item.scrollPercentage || 0}%` }}
                    />
                  </div>
                  <div className="flex gap-4 p-4 h-full">
                    <Link href={`/truyen/${item.slug}`} className="shrink-0">
                      <div className="relative w-20 h-28 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={getImageUrl(item.coverUrl)}
                          alt={item.storyTitle || "Đang tải"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>
                    <div className="flex flex-col flex-1 py-1 overflow-hidden">
                      <Link
                        href={`/truyen/${item.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        <h3 className="font-bold line-clamp-2 text-sm mb-1">
                          {item.storyTitle || "Đang tải"}
                        </h3>
                      </Link>

                      <div className="mt-auto">
                        <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                          Đã đọc đến: Chương {item.chapterNum}
                        </p>
                        {item.updatedAt && (
                          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                            <IconClock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(item.updatedAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </p>
                        )}

                        <Link
                          href={`/truyen/${item.slug}/chuong-${item.chapterNum}`}
                          className="inline-block bg-primary text-primary-foreground text-xs font-medium px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors w-full text-center"
                        >
                          Đọc tiếp{" "}
                          {item.scrollPercentage
                            ? `(${Math.round(item.scrollPercentage)}%)`
                            : ""}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Truyện đánh dấu (Bookmarked) */}
        <TabsContent value="bookmarks" className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Bạn chưa theo dõi truyện nào trên thiết bị này.
              </p>
              <Link
                href="/"
                className="text-primary hover:underline mt-2 inline-block"
              >
                Khám phá truyện mới
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="relative flex flex-col p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                >
                  <Link
                    href={`/truyen/${bookmark.storySlug}`}
                    className="font-bold hover:text-primary mb-1 line-clamp-2"
                  >
                    {bookmark.storyTitle}
                  </Link>
                  <Link
                    href={`/truyen/${bookmark.storySlug}/chuong-${bookmark.chapterNum}`}
                    className="text-sm text-muted-foreground hover:text-primary mb-3"
                  >
                    {bookmark.chapterTitle}
                  </Link>
                  <div className="mt-auto text-xs text-muted-foreground flex items-center gap-1">
                    <IconClock className="w-3.5 h-3.5" />
                    Lưu từ{" "}
                    {formatDistanceToNow(new Date(bookmark.timestamp), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
