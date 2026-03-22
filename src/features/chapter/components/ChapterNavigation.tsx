"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface ChapterNavigationProps {
  slug: string;
  currentChapterNum: number;
  prevChapter: number | null;
  nextChapter: number | null;
  chapters: { chapterNum: number; title: string | null }[];
}

export function ChapterNavigation({
  slug,
  currentChapterNum,
  prevChapter,
  nextChapter,
  chapters,
}: ChapterNavigationProps) {
  const router = useRouter();

  const handleChapterChange = (value: string) => {
    router.push(`/truyen/${slug}/chuong-${value}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <Button
        variant="outline"
        disabled={!prevChapter}
        asChild={!!prevChapter}
        className="w-full sm:w-32 order-1 sm:order-1"
      >
        {prevChapter ? (
          <Link href={`/truyen/${slug}/chuong-${prevChapter}`} prefetch={true} passHref>
            <IconChevronLeft className="mr-2 h-4 w-4" /> Trước
          </Link>
        ) : (
          <>
            <IconChevronLeft className="mr-2 h-4 w-4" /> Trước
          </>
        )}
      </Button>

      <div className="w-full sm:w-auto order-3 sm:order-2 flex-1 sm:flex-none">
        <Select
          defaultValue={currentChapterNum.toString()}
          onValueChange={handleChapterChange}
        >
          {/* Lưu ý: w-70 không phải là class mặc định của Tailwind. Nếu bạn chưa config riêng, hãy dùng w-[17.5rem] hoặc w-72 */}
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Chọn chương" />
          </SelectTrigger>
          {/* Tương tự, max-h-75 không có sẵn. Nên đổi thành max-h-[18.75rem] hoặc max-h-80 */}
          <SelectContent className="max-h-[60vh]">
            {chapters.map((c) => (
              <SelectItem key={c.chapterNum} value={c.chapterNum.toString()}>
                {/* Chỉ cần in c.title ra là đủ đẹp rồi! */}
                {c.title?.replace(/^Chương \d+:\s*/i, "") ||
                  `Chương ${c.chapterNum}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        disabled={!nextChapter}
        asChild={!!nextChapter}
        className="w-full sm:w-32 order-2 sm:order-3"
      >
        {nextChapter ? (
          <Link href={`/truyen/${slug}/chuong-${nextChapter}`} prefetch={true} passHref>
            <span className="truncate">Sau</span>{" "}
            <IconChevronRight className="ml-2 h-4 w-4 shrink-0" />
          </Link>
        ) : (
          <>
            <span className="truncate">Sau</span>{" "}
            <IconChevronRight className="ml-2 h-4 w-4 shrink-0" />
          </>
        )}
      </Button>
    </div>
  );
}
