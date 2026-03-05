import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconEye, IconList, IconStarFilled } from "@tabler/icons-react";
import { cn, getImageUrl } from "@/lib/utils";
import { ReadNowButton } from "@/features/story/components/shared/ReadNowButton";
import { BookmarkButton } from "@/features/story/components/shared/BookmarkButton";
import { BackButton } from "@/components/shared/BackButton";
import dynamic from "next/dynamic";

const ChapterList = dynamic(
  () => import("@/features/chapter/components/ChapterList"),
);
const RatingBox = dynamic(
  () =>
    import("@/features/story/components/shared/RatingBox").then(
      (mod) => mod.RatingBox,
    ),
  { ssr: false },
);
const NominationBox = dynamic(
  () =>
    import("@/features/story/components/shared/NominationBox").then(
      (mod) => mod.NominationBox,
    ),
  { ssr: false },
);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StoryDetailMobileProps {
  story: any;
  slug: string;
  firstChapterNum: number | undefined;
  initialBookmarked: boolean;
  userRatingScore: number | null;
  nominatedToday: boolean;
  remainingNominations: number;
  totalNominations: number;
  isLoggedIn: boolean;
  topFans: any[];
  comments: any[];
}

export function StoryDetailMobile({
  story,
  slug,
  firstChapterNum,
  initialBookmarked,
  userRatingScore,
  nominatedToday,
  remainingNominations,
  totalNominations,
  isLoggedIn,
  topFans,
  comments,
}: StoryDetailMobileProps) {
  return (
    <div className="md:hidden flex flex-col min-h-screen bg-background pb-safe">
      {/* Mobile Hero Header */}
      <div className="relative w-full text-white bg-slate-950 overflow-hidden">
        {/* Background Blurred Image */}
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(story.coverUrl)}
            alt="Background"
            fill
            className="object-cover blur-2xl scale-125 opacity-60 saturate-150"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/20" />
        </div>

        <div className="relative z-10 px-4 pt-14 pb-8 flex flex-col items-center">
          <div className="absolute top-4 left-4">
            <BackButton className="bg-black/20 backdrop-blur-md border-border/20 text-white hover:bg-black/40" />
          </div>

          <div className="w-32 aspect-[2/3] relative rounded-lg shadow-2xl border border-white/20 overflow-hidden mt-4">
            <Image
              src={getImageUrl(story.coverUrl)}
              alt={story.title}
              fill
              className="object-cover"
              priority
              sizes="128px"
            />
          </div>

          <h1 className="mt-5 text-2xl font-heading font-black text-center leading-tight drop-shadow-md text-white line-clamp-3">
            {story.title}
          </h1>

          <div className="mt-2 text-[13px] text-white/80 font-medium text-center truncate w-full px-6">
            {story.author || "Đang cập nhật"}
          </div>

          <div className="flex items-center justify-center gap-4 mt-3 text-xs font-semibold text-white/90">
            <div className="flex items-center gap-1">
              <IconStarFilled className="w-3.5 h-3.5 text-yellow-400" />
              <span>{story.rating}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-1">
              <IconList className="w-3.5 h-3.5 opacity-80" />
              <span>{story.totalChapters} Chương</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-1">
              <IconEye className="w-3.5 h-3.5 opacity-80" />
              <span>
                {story.views > 1000
                  ? `${(story.views / 1000).toFixed(1)}K`
                  : story.views}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 mt-4">
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] px-2 py-0 border-none",
                story.status === "COMPLETED"
                  ? "bg-green-500/20 text-green-300"
                  : "bg-primary/20 text-primary-foreground",
              )}
            >
              {story.status === "COMPLETED" ? "Đã Hoàn Thành" : "Đang Ra"}
            </Badge>
            {story.categories.slice(0, 3).map((category: any) => (
              <Badge
                key={category.id}
                variant="outline"
                className="border-white/20 text-white/80 text-[10px] px-2 py-0 bg-black/20 backdrop-blur-sm"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8 flex-1">
        {/* Giới thiệu */}
        <section>
          <h3 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary rounded-full" />
            Giới Thiệu
          </h3>
          <div className="prose dark:prose-invert max-w-none text-muted-foreground font-serif text-[15px] leading-relaxed line-clamp-5 relative">
            <p className="whitespace-pre-line m-0">
              {story.description || "Chưa có mô tả cho truyện này."}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
          </div>
          <button className="text-primary text-sm font-semibold mt-2 hover:underline w-full text-center">
            Xem thêm
          </button>
        </section>

        {/* Action Widgets */}
        <div className="grid grid-cols-2 gap-3">
          <RatingBox
            storyId={story.id}
            currentRating={story.rating}
            userRating={userRatingScore}
            isLoggedIn={isLoggedIn}
          />
          <NominationBox
            storyId={story.id}
            totalNominations={totalNominations}
            hasNominatedToday={nominatedToday}
            remainingToday={remainingNominations}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Danh sách chương */}
        <section>
          <h3 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary rounded-full" />
            Danh Sách Chương
          </h3>
          <div className="bg-muted/30 rounded-2xl p-3 border border-border/50">
            <ChapterList
              initialChapters={story.chapters.slice(0, 20)}
              slug={slug}
              totalChapters={story.totalChapters}
              storyId={story.id}
            />
          </div>
        </section>

        {/* Top Fans */}
        <section>
          <h3 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary rounded-full" />
            Top Fans
          </h3>
          <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar snap-x">
            {topFans.map((fan, index) => (
              <div
                key={index}
                className="flex flex-col items-center min-w-[72px] snap-center bg-muted/40 p-2 rounded-xl border border-border/50"
              >
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-background">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/80 to-primary text-white font-bold">
                      {fan.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-md",
                      index === 0
                        ? "bg-yellow-400 text-yellow-900"
                        : index === 1
                          ? "bg-slate-300 text-slate-800"
                          : index === 2
                            ? "bg-orange-500 text-white"
                            : "bg-muted text-muted-foreground border border-border",
                    )}
                  >
                    {index + 1}
                  </div>
                </div>
                <span className="text-[10px] font-semibold mt-2 w-full text-center truncate">
                  {fan.name.split(" ")[0]}
                </span>
                <span className="text-[9px] font-bold text-muted-foreground mt-0.5">
                  {fan.score}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/90 backdrop-blur-xl border-t border-border/50 flex gap-3 z-40 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="flex-1">
          <ReadNowButton
            storySlug={slug}
            firstChapterNum={firstChapterNum}
            className="w-full h-12 text-[15px] rounded-xl shadow-lg shadow-primary/20"
          />
        </div>
        <div className="w-14">
          <BookmarkButton
            storyId={story.id}
            initialBookmarked={initialBookmarked}
            className="w-full h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Spacer to prevent content from hiding behind sticky bar */}
      <div className="h-20" />
    </div>
  );
}
