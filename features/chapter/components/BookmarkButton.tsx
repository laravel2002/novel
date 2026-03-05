"use client";

import { useBookmark } from "@/lib/contexts/BookmarkContext";
import { Button } from "@/components/ui/button";
import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";

interface BookmarkButtonProps {
  storySlug: string;
  storyTitle: string;
  chapterNum: number;
  chapterTitle: string | null;
}

export function BookmarkButton({
  storySlug,
  storyTitle,
  chapterNum,
  chapterTitle,
}: BookmarkButtonProps) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmark();
  const bookmarked = isBookmarked(storySlug, chapterNum);
  const id = `${storySlug}-${chapterNum}`;

  const toggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(id);
    } else {
      addBookmark({
        storySlug,
        storyTitle,
        chapterNum,
        chapterTitle: chapterTitle || `Chương ${chapterNum}`,
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleBookmark}
      title={bookmarked ? "Xóa dấu trang" : "Đánh dấu trang"}
      className={bookmarked ? "text-primary" : ""}
    >
      {bookmarked ? (
        <IconBookmarkFilled className="h-5 w-5" />
      ) : (
        <IconBookmark className="h-5 w-5" />
      )}
    </Button>
  );
}
