"use client";

import { useEffect, useRef } from "react";
import { trackChapterView } from "../actions/track-view";

export function ViewTracker({
  storyId,
  chapterId,
}: {
  storyId: number;
  chapterId: number;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      trackChapterView(storyId, chapterId);
    }
  }, [storyId, chapterId]);

  return null;
}
