"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconList } from "@tabler/icons-react";
import ChapterListSkeleton from "./ChapterListSkeleton";

// Định nghĩa kiểu dữ liệu
interface Chapter {
  id: number;
  chapterNum: number;
  title: string | null;
}

interface ChapterListProps {
  initialChapters: Chapter[]; // Danh sách chương tải lần đầu từ server
  slug: string;
  totalChapters: number;
  storyId: number; // Cần ID truyện để gọi API
}

export default function ChapterList({
  initialChapters,
  slug,
  totalChapters,
  storyId,
}: ChapterListProps) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Giả định backend hoặc lúc gọi tĩnh ban đầu có giới hạn limit=50
  const itemsPerPage = 50;
  const totalPages = Math.ceil(totalChapters / itemsPerPage);

  const fetchPage = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/chapters?storyId=${storyId}&page=${page}&limit=${itemsPerPage}`,
      );
      if (!response.ok) throw new Error("Lỗi khi tải dữ liệu");

      const result = await response.json();
      setChapters(result.data);
      setCurrentPage(result.meta.currentPage);

      // Cuộn Header lên đầu danh sách chương
      document
        .getElementById("chapter-list-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error("Lỗi phân trang:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaginationButtons = () => {
    const pages = [];
    // Hiển thị tối đa 5 nút trang
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="icon"
            onClick={() => fetchPage(i)}
            disabled={isLoading || currentPage === i}
            className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
          >
            {i}
          </Button>,
        );
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = 5;
      }
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }

      if (startPage > 1) {
        pages.push(
          <Button
            key="1"
            variant="outline"
            size="icon"
            onClick={() => fetchPage(1)}
            className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
          >
            1
          </Button>,
        );
        if (startPage > 2) {
          pages.push(
            <span key="start-ellipsis" className="px-1 text-muted-foreground">
              ...
            </span>,
          );
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="icon"
            onClick={() => fetchPage(i)}
            disabled={isLoading || currentPage === i}
            className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
          >
            {i}
          </Button>,
        );
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push(
            <span key="end-ellipsis" className="px-1 text-muted-foreground">
              ...
            </span>,
          );
        }
        pages.push(
          <Button
            key={totalPages}
            variant="outline"
            size="icon"
            onClick={() => fetchPage(totalPages)}
            className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
          >
            {totalPages}
          </Button>,
        );
      }
    }
    return pages;
  };

  if (isLoading && chapters.length === 0) {
    return <ChapterListSkeleton />;
  }

  return (
    <Card className="border-none shadow-sm" id="chapter-list-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconList className="w-5 h-5 text-primary" /> Danh sách chương (
          {totalChapters} chương)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Lưới hiển thị chương */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 transition-opacity duration-200 ${isLoading ? "opacity-50" : "opacity-100"}`}
        >
          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/truyen/${slug}/chuong-${chapter.chapterNum}`}
              className="truncate text-sm py-2 px-3 rounded-md border bg-muted/30 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
              title={chapter.title || `Chương ${chapter.chapterNum}`}
            >
              <span className="font-medium mr-1 tracking-tight">
                Chương {chapter.chapterNum}:
              </span>
              <span className="opacity-90">
                {chapter.title?.replace(/^Chương \d+:\s*/i, "") || ""}
              </span>
            </Link>
          ))}
        </div>

        {/* Nút Phân trang (Pagination) */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPage(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-2 sm:px-4"
            >
              Trước
            </Button>

            <div className="flex items-center gap-1">
              {renderPaginationButtons()}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPage(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="px-2 sm:px-4"
            >
              Sau
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
