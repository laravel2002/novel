import { ChapterNavigation } from "./ChapterNavigation";
import { BookmarkButton } from "./BookmarkButton";
import { TrackReadingProgress } from "./TrackReadingProgress";
import { ChapterContent } from "./ChapterContent";
import { ChapterSettings } from "./ChapterSettings";
import { ChapterListSidebar } from "./ChapterListSidebar";
import { ChapterReactions } from "./ChapterReactions";
import { AudioPlayerController } from "./AudioPlayerController";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export interface StoryDetailChapterViewProps {
  storyId: number;
  chapterId: number;
  userId: string | null;
  storyTitle: string;
  storySlug: string;
  author: string | null;
  coverUrl: string | null;
  chapterNum: number;
  chapterTitle: string | null;
  content: string;
  nextChapterUrl: string | null;
  prevChapterUrl: string | null;
  chapters: any[];
  prevChapter: number | null;
  nextChapter: number | null;
}

export function StoryDetailChapterDesktop({
  storyId,
  chapterId,
  userId,
  storyTitle,
  storySlug,
  author,
  coverUrl,
  chapterNum,
  chapterTitle,
  content,
  nextChapterUrl,
  prevChapterUrl,
  chapters,
  prevChapter,
  nextChapter,
}: StoryDetailChapterViewProps) {
  const navigationProps = {
    slug: storySlug,
    currentChapterNum: chapterNum,
    prevChapter,
    nextChapter,
    chapters: chapters.map((c: any) => ({
      chapterNum: c.chapterNum,
      title: c.title,
    })),
  };

  return (
    <div className="flex min-h-screen bg-muted/20 flex-col overflow-x-hidden w-full">
      <TrackReadingProgress
        storySlug={storySlug}
        chapterNum={chapterNum}
        storyId={storyId}
        chapterId={chapterId}
        storyTitle={storyTitle}
        coverUrl={coverUrl || ""}
        chapterTitle={chapterTitle}
      />

      {/* Main Content Area */}
      <div className="container max-w-7xl mx-auto py-8 px-8 flex-1 overflow-x-hidden">
        {/* Navigation Top */}
        <div className="mb-8 max-w-5xl mx-auto">
          <ChapterNavigation {...navigationProps} />
        </div>

        {/* Chapter Content */}
        <ChapterContent
          storyId={storyId}
          chapterId={chapterId}
          userId={userId}
          storyTitle={storyTitle}
          storySlug={storySlug}
          author={author || "Đang cập nhật"}
          chapterNum={chapterNum}
          chapterTitle={chapterTitle}
          content={content}
          nextChapterUrl={nextChapterUrl}
          prevChapterUrl={prevChapterUrl}
        />

        {/* Reactions Zone */}
        <ChapterReactions />

        {/* Navigation Bottom */}
        <div className="mt-3 max-w-5xl mx-auto">
          <ChapterNavigation {...navigationProps} />
        </div>
      </div>

      {/* Floating Tools Sidebar (Right on Desktop) */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
        <div className="flex flex-col justify-center gap-2 p-2 bg-background/80 backdrop-blur-md border rounded-full shadow-lg">
          <BookmarkButton
            storySlug={storySlug}
            storyTitle={storyTitle}
            chapterNum={chapterNum}
            chapterTitle={chapterTitle}
          />
          <AudioPlayerController />
          <ChapterSettings />
          <ChapterListSidebar
            slug={storySlug}
            chapters={chapters.map((c: any) => ({
              chapterNum: c.chapterNum,
              title: c.title,
            }))}
            currentChapterNum={chapterNum}
          />
          <ScrollToTop />
        </div>
      </div>
    </div>
  );
}
