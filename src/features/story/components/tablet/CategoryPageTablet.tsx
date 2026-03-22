"use client";

import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import FilterMobile from "../shared/FilterMobile";
import StoryListItem from "../shared/StoryListItem";
import { CategoryPageUIProps } from "../CategoryPageUI";

export function CategoryPageTablet({
  categories,
  stories,
  totalCount,
  currentPage,
  totalPages,
  searchParamsProps,
}: CategoryPageUIProps) {
  const createPageUrl = (targetPage: number) => {
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
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute top-[500px] left-1/2 w-[40rem] h-[20rem] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none transform -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-10 flex flex-col items-center text-center gap-4">
          <h1 className="text-5xl font-heading font-black tracking-tighter text-foreground leading-[1.1] uppercase drop-shadow-sm">
            Danh Sách <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-primary/80">
              Truyện
            </span>
          </h1>
          <p className="text-muted-foreground text-lg font-serif italic max-w-md">
            Khám phá kho tàng{" "}
            <strong className="text-primary font-bold">
              {Intl.NumberFormat("vi-VN").format(totalCount)}
            </strong>{" "}
            kiệt tác đang chờ đón bạn.
          </p>

          <div className="mt-4">
            <FilterMobile categories={categories} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {stories.length > 0 ? (
            stories.map((story, i) => (
              <StoryListItem key={story.id} story={story} index={i} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center text-muted-foreground bg-secondary/10 rounded-[2rem] border border-border/50 backdrop-blur-sm">
              <h3 className="font-heading text-xl font-bold mb-2">
                Hệ thống trống
              </h3>
              <p className="text-sm">
                Không tìm thấy truyện nào thỏa mãn tiêu chí lọc.
              </p>
            </div>
          )}
        </div>

        {/* Pagination Glassmorphism - Numbered */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 pt-8 border-t-2 border-primary/20 gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              asChild={currentPage > 1}
              className="w-10 h-10 rounded-full p-0 flex items-center justify-center bg-transparent border-white/20 text-white/70 hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              {currentPage > 1 ? (
                <Link href={createPageUrl(currentPage - 1)}>
                  <IconChevronLeft className="w-4 h-4" />
                </Link>
              ) : (
                <span>
                  <IconChevronLeft className="w-4 h-4" />
                </span>
              )}
            </Button>

            <div className="flex items-center gap-1.5">
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
                      className={`min-w-10 h-10 rounded-full px-3 text-xs font-black transition-all duration-300 ${
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
                      className="text-white/40 font-bold px-1 text-xs"
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
              className="w-10 h-10 rounded-full p-0 flex items-center justify-center bg-transparent border-white/20 text-white/70 hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              {currentPage < totalPages ? (
                <Link href={createPageUrl(currentPage + 1)}>
                  <IconChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span>
                  <IconChevronRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
