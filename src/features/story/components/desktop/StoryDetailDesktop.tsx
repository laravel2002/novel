import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconEye,
  IconUser,
  IconList,
  IconShare,
  IconFlag,
  IconThumbUp,
  IconMessageCircle,
  IconStarFilled,
} from "@tabler/icons-react";
import { cn, getImageUrl } from "@/lib/utils";
import { ReadNowButton } from "@/features/story/components/shared/ReadNowButton";
import dynamic from "next/dynamic";
import { BookmarkButton } from "@/features/story/components/shared/BookmarkButton";

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
import { BackButton } from "@/components/shared/BackButton";
import { Suspense } from "react";
import { Await } from "@/components/shared/Await";

export function StoryDetailDesktop({
  story,
  slug,
  firstChapterNum,
  initialLibraryStatus,
  userRatingScore,
  nominatedToday,
  remainingNominations,
  totalNominations,
  isLoggedIn,
  topFans,
  comments,
  relatedStoriesPromise,
  initialChaptersPromise,
}: any) {
  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="relative w-full bg-slate-950 text-white overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(story.coverUrl)}
            alt="Background"
            fill
            className="object-cover blur-[100px] scale-110 opacity-60 saturate-150"
            priority
          />
          <div className="absolute inset-0 bg-black/50 dark:bg-black/80" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto relative z-10 px-8 py-16">
          <BackButton className="mb-6" />

          <div className="flex flex-row gap-10 lg:gap-12 items-center">
            <div className="w-56 lg:w-64 shrink-0 mx-0 group">
              <div className="aspect-[2/3] relative rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] border border-white/20 overflow-hidden transform group-hover:scale-[1.02] group-hover:-translate-y-1 transition-all duration-500">
                <Image
                  src={getImageUrl(story.coverUrl)}
                  alt={story.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 160px, 256px"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl" />
              </div>
            </div>

            <div className="flex-1 flex flex-col space-y-6 text-left">
              <div className="flex items-center justify-start gap-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider border-none shadow-sm",
                    story.status === "COMPLETED"
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : "bg-primary/20 text-primary-foreground border border-primary/30",
                  )}
                >
                  {story.status === "COMPLETED" ? "Đã Hoàn Thành" : "Đang Ra"}
                </Badge>
              </div>

              <h1 className="text-4xl lg:text-5xl font-heading font-black leading-tight drop-shadow-lg text-white">
                {story.title}
              </h1>

              <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-3 text-base text-white/80 font-medium">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-white/10 text-white">
                    <IconUser className="w-4 h-4" />
                  </div>
                  <span className="truncate max-w-xs font-semibold">
                    {story.author || "Đang cập nhật"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center justify-center gap-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold">
                    <IconStarFilled className="w-3.5 h-3.5" />
                    {story.rating}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconEye className="w-5 h-5 opacity-70" />
                  <span>
                    <strong className="text-white">
                      {story.views.toLocaleString()}
                    </strong>{" "}
                    xem
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconList className="w-5 h-5 opacity-70" />
                  <span>
                    <strong className="text-white">
                      {story.totalChapters}
                    </strong>{" "}
                    chương
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-start gap-2 pt-2">
                {story.categories?.map((category: any) => (
                  <Badge
                    key={category.id}
                    variant="outline"
                    className="border-white/20 text-white/80 hover:text-white hover:border-white/60 hover:bg-white/10 cursor-pointer text-xs transition-colors px-3 py-1 bg-black/20 backdrop-blur-sm"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-row gap-4 pt-4 w-full justify-start">
                <div className="w-auto min-w-[200px]">
                  <ReadNowButton
                    storySlug={slug}
                    firstChapterNum={firstChapterNum}
                  />
                </div>
                <div className="w-auto min-w-[220px]">
                  <BookmarkButton
                    storyId={story.id}
                    initialLibraryStatus={initialLibraryStatus}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 space-y-10">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <IconList className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-foreground">
                  Giới Thiệu
                </h2>
              </div>
              <Card className="subtle-border bg-background shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground font-serif text-lg leading-relaxed">
                    <p className="whitespace-pre-line">
                      {story.description || "Chưa có mô tả cho truyện này."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <Card className="subtle-border bg-background shadow-sm p-6">
                <Suspense
                  fallback={
                    <div className="h-64 animate-pulse bg-muted rounded-xl" />
                  }
                >
                  <Await promise={initialChaptersPromise!}>
                    {(chapters: any[]) => (
                      <ChapterList
                        initialChapters={chapters?.slice(0, 50) || []}
                        slug={slug}
                        totalChapters={story.totalChapters}
                        storyId={story.id}
                      />
                    )}
                  </Await>
                </Suspense>
              </Card>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-border/50 pb-3">
                <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                  Bình Luận{" "}
                  <span className="text-primary text-lg">
                    ({comments?.length || 0})
                  </span>
                </h2>
              </div>

              <div className="flex gap-4">
                <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    ?
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <textarea
                    className="w-full min-h-[100px] p-4 rounded-xl border border-input bg-muted/40 focus:bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/50 resize-y text-sm transition-colors shadow-inner"
                    placeholder="Chia sẻ cảm nghĩ của bạn về truyện..."
                  ></textarea>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="rounded-full px-6 font-semibold shadow-md inline-flex"
                    >
                      Gửi Bình Luận
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mt-8">
                {comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-4 group">
                    <Avatar className="w-10 h-10 border border-border shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white font-bold">
                        {comment.user[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted/30 p-4 rounded-2xl rounded-tl-sm border border-transparent group-hover:border-border transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm text-foreground">
                          {comment.user}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-5 text-xs font-semibold text-muted-foreground">
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                          <IconThumbUp className="w-4 h-4" /> Thích
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                          <IconMessageCircle className="w-4 h-4" /> Phản hồi
                        </button>
                        {comment.replies > 0 && (
                          <span className="text-primary hover:underline cursor-pointer flex items-center gap-1 before:content-['•'] before:text-border before:mr-2">
                            {comment.replies} phản hồi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-24 self-start">
            <div className="grid grid-cols-2 gap-4">
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

            <Card className="subtle-border shadow-sm overflow-hidden">
              <div className="h-12 bg-gradient-to-r from-primary/20 to-secondary/20" />
              <CardContent className="pt-0 relative px-6 pb-6">
                <div className="flex flex-col items-center -mt-6">
                  <Avatar className="w-16 h-16 border-4 border-background shadow-md">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${story.author || "User"}&background=random`}
                    />
                    <AvatarFallback className="bg-primary text-white text-xl">
                      TG
                    </AvatarFallback>
                  </Avatar>
                  <div className="mt-3 text-center">
                    <div className="font-heading font-bold text-lg text-foreground hover:text-primary cursor-pointer transition-colors">
                      {story.author || "Vô Danh"}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground mt-1 bg-muted/50 px-3 py-1 rounded-full inline-block">
                      Chủ tọa • 4 tác phẩm
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="subtle-border shadow-sm">
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-heading font-bold flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary rounded-full" />
                    Bảng Xếp Hạng Fan
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {topFans?.map((fan: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div
                      className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold shrink-0 shadow-sm",
                        index === 0
                          ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-950"
                          : index === 1
                            ? "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900"
                            : index === 2
                              ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                              : "bg-muted text-muted-foreground border border-border",
                      )}
                    >
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8 border border-border group-hover:border-primary transition-colors">
                      <AvatarFallback className="text-[10px] bg-background text-foreground font-semibold">
                        {fan.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {fan.name}
                    </div>
                    <div className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      {fan.score}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 rounded-xl font-semibold hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all subtle-border"
              >
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <IconShare className="w-4 h-4 text-primary" />
                </div>
                Chia sẻ truyện
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 rounded-xl font-semibold text-muted-foreground hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all subtle-border"
              >
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center group-hover:bg-red-100">
                  <IconFlag className="w-4 h-4" />
                </div>
                Báo cáo vi phạm
              </Button>
            </div>

            <div className="pt-2">
              <h3 className="font-heading font-bold mb-4 text-base flex items-center gap-2">
                <span className="w-2 h-6 bg-secondary rounded-full" />
                Cùng Thể Loại
              </h3>
              <Suspense
                fallback={
                  <div className="h-48 animate-pulse bg-muted rounded-xl" />
                }
              >
                <Await promise={relatedStoriesPromise!}>
                  {(relatedStories: any[]) => (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                      {relatedStories?.map((related: any) => (
                        <Link
                          key={related.id}
                          href={`/truyen/${related.slug}`}
                          className="flex gap-4 group p-2 hover:bg-muted/50 rounded-xl transition-all subtle-border bg-background shadow-xs hover:shadow-sm"
                        >
                          <div className="relative w-14 h-[84px] shrink-0 rounded-md overflow-hidden bg-muted border border-border/50">
                            <Image
                              src={getImageUrl(related.coverUrl)}
                              alt={related.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="56px"
                            />
                          </div>
                          <div className="flex flex-col justify-center overflow-hidden flex-1 py-1">
                            <h4 className="font-heading font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors text-foreground leading-snug">
                              {related.title}
                            </h4>
                            <div className="text-xs font-medium text-muted-foreground mt-1 flex items-center gap-1.5">
                              <IconUser className="w-3 h-3" />
                              <span className="truncate">{related.author}</span>
                            </div>
                            <div className="text-[11px] font-semibold text-muted-foreground mt-1.5 bg-muted/60 w-max px-2 py-0.5 rounded-md">
                              {related.totalChapters} chương
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </Await>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
