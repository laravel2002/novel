import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { IconClock, IconEye, IconStar, IconBook2 } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";
import type { LibraryViewProps } from "./LibraryDesktop";

export function LibraryMobile({
  readingHistory,
  bookmarks,
  waitlist,
  completed,
}: LibraryViewProps) {
  return (
    <div className="w-full px-4 py-6 mt-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
          <IconBook2 className="w-6 h-6 text-primary" /> Tủ Truyện
        </h1>
        <p className="text-sm text-muted-foreground">
          Quản lý lịch sử đọc và truyện đang theo dõi
        </p>
      </div>

      <Tabs defaultValue="history" className="w-full">
        {/* Mobile Tabs Scrollable */}
        <div className="w-full overflow-x-auto pb-2 mb-4 scrollbar-none">
          <TabsList className="h-auto flex gap-1 justify-start p-1 w-max">
            <TabsTrigger
              value="history"
              className="text-xs px-4 py-2 shrink-0 rounded-full"
            >
              Đang đọc
            </TabsTrigger>
            <TabsTrigger
              value="bookmarks"
              className="text-xs px-4 py-2 shrink-0 rounded-full"
            >
              Dấu trang
            </TabsTrigger>
            <TabsTrigger
              value="waitlist"
              className="text-xs px-4 py-2 shrink-0 rounded-full"
            >
              Chờ đọc
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-xs px-4 py-2 shrink-0 rounded-full"
            >
              Đã xong
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="history" className="space-y-4">
          {readingHistory.length === 0 ? (
            <div className="text-center py-10 bg-muted/20 border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">Chưa có lịch sử.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {readingHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-card p-3 border rounded-xl shadow-sm"
                >
                  <Link
                    href={`/truyen/${item.Story.slug}`}
                    className="shrink-0"
                  >
                    <div className="relative w-16 h-24 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={getImageUrl(item.Story.coverUrl)}
                        alt={item.Story.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>
                  <div className="flex flex-col flex-1 py-1">
                    <Link href={`/truyen/${item.Story.slug}`}>
                      <h3 className="font-bold line-clamp-2 text-sm">
                        {item.Story.title}
                      </h3>
                    </Link>
                    <div className="mt-auto pt-2">
                      <p className="text-[11px] text-muted-foreground mb-2">
                        Chương {item.Chapter.chapterNum}
                      </p>
                      <Link
                        href={`/truyen/${item.Story.slug}/chuong-${item.Chapter.chapterNum}`}
                        className="inline-block bg-primary text-primary-foreground text-[11px] font-semibold px-4 py-1.5 rounded-full w-full text-center active:scale-95 transition-transform"
                      >
                        Đọc tiếp
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="text-center py-10 bg-muted/20 border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">
                Bạn chưa theo dõi truyện nào.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {bookmarks.map((story) => (
                <div key={story.id} className="flex flex-col gap-1">
                  <Link
                    href={`/truyen/${story.slug}`}
                    className="w-full relative aspect-[2/3] rounded-lg overflow-hidden bg-muted"
                  >
                    <Badge className="absolute top-1 left-1 text-[9px] px-1 py-0 bg-black/60 text-white border-none">
                      {story.status === "COMPLETED" ? "Full" : "Đang ra"}
                    </Badge>
                    <Image
                      src={getImageUrl(story.coverUrl)}
                      alt={story.title}
                      fill
                      className="object-cover"
                      sizes="50vw"
                    />
                  </Link>
                  <Link href={`/truyen/${story.slug}`}>
                    <h3 className="font-bold text-xs leading-tight line-clamp-2 mt-1">
                      {story.title}
                    </h3>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="waitlist" className="space-y-4">
          {waitlist.length === 0 ? (
            <div className="text-center py-10 bg-muted/20 border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">
                Không có truyện chờ.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {waitlist.map((story) => (
                <div key={story.id} className="flex flex-col gap-1">
                  <Link
                    href={`/truyen/${story.slug}`}
                    className="w-full relative aspect-[2/3] rounded-lg overflow-hidden bg-muted"
                  >
                    <Image
                      src={getImageUrl(story.coverUrl)}
                      alt={story.title}
                      fill
                      className="object-cover"
                      sizes="50vw"
                    />
                  </Link>
                  <Link href={`/truyen/${story.slug}`}>
                    <h3 className="font-bold text-xs leading-tight line-clamp-2 mt-1">
                      {story.title}
                    </h3>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completed.length === 0 ? (
            <div className="text-center py-10 bg-muted/20 border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">
                Chưa xong truyện nào.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {completed.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-card p-3 border rounded-xl shadow-sm opacity-80"
                >
                  <Link
                    href={`/truyen/${item.Story.slug}`}
                    className="shrink-0"
                  >
                    <div className="relative w-16 h-24 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={getImageUrl(item.Story.coverUrl)}
                        alt={item.Story.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>
                  <div className="flex flex-col flex-1 py-1">
                    <Link href={`/truyen/${item.Story.slug}`}>
                      <h3 className="font-bold line-clamp-2 text-sm">
                        {item.Story.title}
                      </h3>
                    </Link>
                    <div className="mt-auto pt-2">
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-sm border border-green-100">
                        Đã Hoàn Thành
                      </span>
                    </div>
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
