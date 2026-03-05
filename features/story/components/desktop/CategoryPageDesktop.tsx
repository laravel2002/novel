"use client";

import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import FilterSidebar from "./FilterSidebar";
import StoryListItem from "../shared/StoryListItem";
import { CategoryPageUIProps } from "../CategoryPageUI";

export function CategoryPageDesktop({
  categories,
  stories,
  totalCount,
  currentPage,
  totalPages,
  searchParamsProps,
}: CategoryPageUIProps) {
  const createPageUrl = (targetPage: number) => {
    // Lọc bỏ undefined values
    const validParams: Record<string, string> = {};
    Object.entries(searchParamsProps).forEach(([key, value]) => {
      if (value !== undefined) validParams[key] = value;
    });

    const newParams = new URLSearchParams(validParams);
    newParams.set("page", targetPage.toString());
    return `?${newParams.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-primary/5 rounded-full blur-[150px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute top-40 -left-20 w-[40rem] h-[40rem] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] left-1/2 w-[60rem] h-[30rem] bg-primary/5 rounded-full blur-[150px] pointer-events-none transform -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 py-26 relative z-10">
        {/* Header Typography Khổng Lồ */}
        <div className="mb-10 flex flex-row justify-between items-end border-b border-white/10 pb-8 gap-4">
          <div>
            <h1 className="text-[4.5rem] font-heading font-black tracking-tighter text-foreground leading-[1.1] uppercase drop-shadow-sm mb-5">
              Danh Sách <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-primary/80">
                Truyện
              </span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xl font-serif italic max-w-sm border-r-4 border-primary/30 pr-4 py-1">
              Khám phá kho tàng{" "}
              <strong className="text-primary font-bold">
                {Intl.NumberFormat("vi-VN").format(totalCount)}
              </strong>{" "}
              kiệt tác đang chờ đón bạn.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-10">
          {/* Cột trái (Sidebar) */}
          <div className="col-span-1">
            <div className="sticky top-[100px]">
              <FilterSidebar categories={categories} />
            </div>
          </div>

          {/* Cột phải (Danh sách) */}
          <div className="col-span-3">
            {/* Component Gird Truyện - Layout 3 hoặc 4 cột trên Large màn hình */}
            <div className="grid grid-cols-3 xl:grid-cols-4 gap-8">
              {stories.length > 0 ? (
                stories.map((story, i) => (
                  <StoryListItem key={story.id} story={story} index={i} />
                ))
              ) : (
                <div className="col-span-full py-32 text-center text-muted-foreground bg-secondary/10 rounded-[2.5rem] border border-border/50 backdrop-blur-sm">
                  <h3 className="font-heading text-2xl font-bold mb-2">
                    Hệ thống trống
                  </h3>
                  <p>Không tìm thấy truyện nào thỏa mãn tiêu chí lọc này.</p>
                </div>
              )}
            </div>

            {/* Pagination Glassmorphism - Numbered */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-20 pt-10 border-t-2 border-primary/20 gap-3">
                <Button
                  variant="outline"
                  disabled={currentPage <= 1}
                  asChild={currentPage > 1}
                  className="w-12 h-12 rounded-full p-0 flex items-center justify-center bg-transparent border-white/20 text-white/70 hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  {currentPage > 1 ? (
                    <Link href={createPageUrl(currentPage - 1)}>
                      <IconChevronLeft className="w-5 h-5" />
                    </Link>
                  ) : (
                    <span>
                      <IconChevronLeft className="w-5 h-5" />
                    </span>
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = currentPage === pageNum;

                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={pageNum}
                          variant="outline"
                          asChild={!isActive}
                          disabled={isActive}
                          className={`min-w-12 h-12 rounded-full px-4 text-sm font-black transition-all duration-300 ${
                            isActive
                              ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(234,88,12,0.4)] hover:bg-primary opacity-100"
                              : "bg-transparent border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {isActive ? (
                            <span>{pageNum}</span>
                          ) : (
                            <Link href={createPageUrl(pageNum)}>{pageNum}</Link>
                          )}
                        </Button>
                      );
                    }
                    if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span
                          key={pageNum}
                          className="text-white/40 font-bold px-2"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  asChild={currentPage < totalPages}
                  className="w-12 h-12 rounded-full p-0 flex items-center justify-center bg-transparent border-white/20 text-white/70 hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  {currentPage < totalPages ? (
                    <Link href={createPageUrl(currentPage + 1)}>
                      <IconChevronRight className="w-5 h-5" />
                    </Link>
                  ) : (
                    <span>
                      <IconChevronRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
