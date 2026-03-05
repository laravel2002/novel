"use client";

import { useDevice } from "@/components/providers/DeviceProvider";
import {
  StoryDetailChapterDesktop,
  type StoryDetailChapterViewProps,
} from "./StoryDetailChapterDesktop";
import { StoryDetailChapterMobile } from "./StoryDetailChapterMobile";
import { useReadingHistory } from "@/features/history/hooks/useReadingHistory";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { CommentSection } from "@/features/comment/components/CommentSection";

export function StoryDetailChapter(props: StoryDetailChapterViewProps) {
  const { isMobile } = useDevice();
  const { recordHistory, isReady } = useReadingHistory();

  useEffect(() => {
    if (isReady && props.storyId && props.chapterId) {
      recordHistory({
        storyId: props.storyId,
        storySlug: props.storySlug,
        storyTitle: props.storyTitle,
        coverUrl: props.coverUrl || null,
        chapterId: props.chapterId,
        chapterNum: props.chapterNum,
        chapterTitle: props.chapterTitle || null,
        scrollPercentage: 0, // Option: Update this on unmount or periodic scroll event
      });
    }
  }, [
    isReady,
    props.storyId,
    props.chapterId,
    props.storySlug,
    props.storyTitle,
    props.coverUrl,
    props.chapterNum,
    props.chapterTitle,
    recordHistory,
  ]);

  const { data: session } = useSession();

  if (isMobile) {
    return (
      <div className="w-full no-scrollbar overscroll-none">
        <StoryDetailChapterMobile {...props} />
        <div className="px-4 pb-24">
          <CommentSection
            storyId={props.storyId}
            chapterId={props.chapterId}
            currentUserId={session?.user?.id || null}
            isLoggedIn={!!session?.user}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <StoryDetailChapterDesktop {...props} />
      <div className="container mx-auto px-4 max-w-5xl pb-24">
        <CommentSection
          storyId={props.storyId}
          chapterId={props.chapterId}
          currentUserId={session?.user?.id || null}
          isLoggedIn={!!session?.user}
        />
      </div>
    </>
  );
}
