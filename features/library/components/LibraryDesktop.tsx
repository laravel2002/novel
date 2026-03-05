import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { IconClock, IconEye, IconStar, IconBook2 } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";

export interface LibraryViewProps {
  readingHistory: any[];
  bookmarks: any[];
  waitlist: any[];
  completed: any[];
}

export function LibraryDesktop({
  readingHistory,
  bookmarks,
  waitlist,
  completed,
}: LibraryViewProps) {
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

      <Tabs defaultValue="history" className="w-full">
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

        <TabsContent value="history" className="space-y-4">
          {readingHistory.length === 0 ? (
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
              {readingHistory.map((item) => (
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
                        className="hover:text-primary transition-colors"
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
                          href={`/truyen/${item.Story.slug}/chuong-${item.Chapter.chapterNum}`}
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

        <TabsContent value="bookmarks" className="space-y-4">
          {bookmarks.length === 0 ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {bookmarks.map((story) => (
                <div
                  key={story.id}
                  className="group flex flex-col items-start bg-card transition-shadow hover:shadow-md rounded-xl p-3 border"
                >
                  <Link
                    href={`/truyen/${story.slug}`}
                    className="w-full relative aspect-[2/3] mb-4 rounded-lg overflow-hidden bg-muted shadow-sm block"
                  >
                    <Badge className="absolute top-2 left-2 z-10 bg-black/60 hover:bg-black/60 text-white backdrop-blur-sm border-none">
                      {story.status === "COMPLETED"
                        ? "Đã Hoàn Thành"
                        : "Đang Ra"}
                    </Badge>
                    <Image
                      src={getImageUrl(story.coverUrl)}
                      alt={story.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    />
                  </Link>
                  <Link href={`/truyen/${story.slug}`} className="w-full">
                    <h3 className="font-bold text-base leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {story.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-auto w-full mb-1">
                    <span className="flex items-center gap-1">
                      <IconStar className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                      {story.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconEye className="w-3.5 h-3.5" />
                      {story.views}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground w-full">
                    Lưu từ{" "}
                    {formatDistanceToNow(new Date(story.bookmarkedAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="waitlist" className="space-y-4">
          {waitlist.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Không có truyện nào đang chờ đọc.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {waitlist.map((story) => (
                <div
                  key={story.id}
                  className="group flex flex-col items-start bg-card transition-shadow hover:shadow-md rounded-xl p-3 border"
                >
                  <Link
                    href={`/truyen/${story.slug}`}
                    className="w-full relative aspect-[2/3] mb-4 rounded-lg overflow-hidden bg-muted shadow-sm block"
                  >
                    <Badge className="absolute top-2 left-2 z-10 bg-black/60 text-white backdrop-blur-sm border-none">
                      Chờ Đọc
                    </Badge>
                    <Image
                      src={getImageUrl(story.coverUrl)}
                      alt={story.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 20vw"
                    />
                  </Link>
                  <Link href={`/truyen/${story.slug}`} className="w-full">
                    <h3 className="font-bold text-base leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
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
            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Bạn chưa đọc xong truyện nào.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {completed.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col bg-card/60 border rounded-xl overflow-hidden shadow-sm min-h-36 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div className="flex gap-4 p-4 h-full">
                    <Link
                      href={`/truyen/${item.Story.slug}`}
                      className="shrink-0"
                    >
                      <div className="relative w-20 h-28 rounded-md overflow-hidden bg-muted grayscale group-hover:grayscale-0 transition-all">
                        <Image
                          src={getImageUrl(item.Story.coverUrl)}
                          alt={item.Story.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex flex-col flex-1 py-1 overflow-hidden">
                      <Link
                        href={`/truyen/${item.Story.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        <h3 className="font-bold line-clamp-2 text-sm mb-1">
                          {item.Story.title}
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
                          <IconClock className="w-3 h-3" /> Cập nhật lần cuối:{" "}
                          {formatDistanceToNow(new Date(item.updatedAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                      </div>
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
