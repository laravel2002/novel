"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconBook } from "@tabler/icons-react"; // Chú ý cách import icon để tránh chậm build nhé

interface ContinueReadingButtonProps {
  storyId: number;
  storySlug: string;
  firstChapterSlug: string; // Chương 1 mặc định nếu chưa đọc bao giờ
}

export function ContinueReadingButton({
  storyId,
  storySlug,
  firstChapterSlug,
}: ContinueReadingButtonProps) {
  const [lastReadChapterSlug, setLastReadChapterSlug] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // Lấy lịch sử từ Local Storage khi Component load
    const history = JSON.parse(localStorage.getItem("reading_history") || "{}");
    if (history[storyId] && history[storyId].chapterSlug) {
      setLastReadChapterSlug(history[storyId].chapterSlug);
    }
  }, [storyId]);

  // Nếu đã đọc thì hiện "Đọc tiếp", chưa đọc thì "Đọc từ đầu"
  const targetSlug = lastReadChapterSlug || firstChapterSlug;
  const buttonText = lastReadChapterSlug ? "Đọc tiếp" : "Đọc từ đầu";

  return (
    <Button asChild size="lg" className="w-full sm:w-auto font-semibold">
      <Link href={`/truyen/${storySlug}/${targetSlug}`}>
        <IconBook className="w-5 h-5 mr-2" />
        {buttonText}
      </Link>
    </Button>
  );
}
