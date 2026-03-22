"use client";

import { useDevice } from "@/components/providers/DeviceProvider";
import {
  StoryDetailChapterDesktop,
  type StoryDetailChapterViewProps,
} from "./StoryDetailChapterDesktop";
import { StoryDetailChapterMobile } from "./StoryDetailChapterMobile";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { CommentSection } from "@/features/comment/components/CommentSection";
import { ViewTracker } from "./ViewTracker";

export function StoryDetailChapter(props: StoryDetailChapterViewProps) {
  const { isMobile } = useDevice();
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
        <ViewTracker storyId={props.storyId} chapterId={props.chapterId} />
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
      <ViewTracker storyId={props.storyId} chapterId={props.chapterId} />
    </>
  );
}
