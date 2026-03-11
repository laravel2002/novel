"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useReadingProgress } from "@/lib/contexts/ReadingProgressContext";
import { Button } from "@/components/ui/button";
import { IconBook2 } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ReadNowButtonProps {
  storySlug: string;
  firstChapterNum: number | undefined;
  className?: string;
}

export function ReadNowButton({
  storySlug,
  firstChapterNum,
  className,
}: ReadNowButtonProps) {
  const { getProgress } = useReadingProgress();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const buttonClasses =
    "bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-primary-foreground border-none rounded-full px-8 h-12 sm:h-14 text-base sm:text-lg font-heading font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-0.5 active:scale-[0.98] w-full flex items-center justify-center gap-2 group";

  {
    /* On server, or before hydration, show the default button to avoid layout shift and hydration errors.
    Or if firstChapterNum is not available, disable the button. */
  }
  // If firstChapterNum is not available, disable the button.
  if (!firstChapterNum) {
    return (
      <Button
        size="lg"
        className={cn(
          buttonClasses,
          "opacity-70 grayscale cursor-not-allowed hover:transform-none hover:shadow-none",
          className,
        )}
        disabled
      >
        <span className="flex items-center gap-2">
          <IconBook2 className="w-5 h-5" />
          Chưa có chương
        </span>
      </Button>
    );
  }

  // On server, or before hydration, show the default button to avoid layout shift and hydration errors.
  if (!isClient) {
    return (
      <Link
        href={`/truyen/${storySlug}/chuong-${firstChapterNum}`}
        className={cn("w-full block", className)}
      >
        <Button size="lg" className={buttonClasses}>
          Đọc ngay
          <IconBook2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </Button>
      </Link>
    );
  }

  // On client, determine the correct chapter and text
  const progress = getProgress(storySlug) as
    | { chapterNum?: number }
    | number
    | null;
  const chapterVal =
    typeof progress === "number" ? progress : progress?.chapterNum;

  const targetChapter = chapterVal || firstChapterNum;
  const buttonText = chapterVal ? `Đọc tiếp C.${chapterVal}` : "Đọc từ đầu";
  const href = `/truyen/${storySlug}/chuong-${targetChapter}`;

  return (
    <Link href={href} className={cn("w-full block", className)}>
      <Button size="lg" className={buttonClasses}>
        {buttonText}{" "}
        <IconBook2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      </Button>
    </Link>
  );
}
