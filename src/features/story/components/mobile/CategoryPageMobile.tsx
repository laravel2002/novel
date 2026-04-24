"use client";

import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import FilterMobile from "../shared/FilterMobile";
import StoryListItemMobile from "../shared/StoryListItemMobile";
import { CategoryPageUIProps } from "../CategoryPageUI";

export function CategoryPageMobile({
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
    <div className="min-h-screen bg-background relative overflow-hidden pb-16">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[80px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />

      <div className="mx-auto px-4 py-20 relative z-10 w-full">
        <div className="mb-6 flex flex-col items-center text-center gap-3">
          <h1 className="text-4xl font-heading font-black tracking-tighter text-foreground leading-[1.1] uppercase drop-shadow-sm">
            Danh Sách <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-primary/80">
              Truyện
            </span>
          </h1>
          <p className="text-muted-foreground text-sm font-serif italic max-w-xs">
            Khám phá kho tàng{" "}
            <strong className="text-primary font-bold">
              {Intl.NumberFormat("vi-VN").format(totalCount)}
            </strong>{" "}
            kiệt tác.
          </p>

          <div className="mt-2 text-center w-full flex justify-center">
            <FilterMobile categories={categories} />
          </div>
        </div>

        <div className="flex flex-col gap-3.5 pb-4">
          {stories.length > 0 ? (
            stories.map((story, i) => (
              <StoryListItemMobile key={story.id} story={story} index={i} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-muted-foreground bg-secondary/10 rounded-[1.5rem] border border-border/50 backdrop-blur-sm">
              <h3 className="font-heading text-lg font-bold mb-1">
                Hệ thống trống
              </h3>
              <p className="text-xs">Không tìm thấy truyện nào thỏa mãn.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-10 pt-6 border-t border-primary/20 gap-1.5 overflow-x-auto pb-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              asChild={currentPage > 1}
              className="min-w-10 w-10 h-10 shrink-0 rounded-full p-0 flex items-center justify-center bg-transparent border-white/20 text-white/70 hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent"
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

            <div className="flex flex-nowrap items-center gap-1 overflow-x-auto no-scrollbar mask-edges">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isActive = currentPage === pageNum;

                // Show only 1 neighboring page on mobile
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
                      className={`min-w-9 h-10 rounded-full px-2 text-xs font-black shrink-0 transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-white border-primary shadow-[0_0_10px_rgba(234,88,12,0.4)] hover:bg-primary opacity-100"
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
                      className="text-white/40 font-bold px-0.5 text-xs shrink-0"
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
              className="min-w-10 w-10 h-10 shrink-0 rounded-full p-0 flex items-center justify-center bg-transparent border-white/20 text-white/70 hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent"
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
