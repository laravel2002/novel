"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { fetchStoriesPaginated } from "@/features/story/actions/fetch-stories";
import StoryListItem from "@/features/story/components/shared/StoryListItem";
import StoryListItemSkeleton from "@/features/story/components/shared/StoryListItemSkeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, Filter } from "lucide-react";

export function CompletedStoriesClient({ initialData }: { initialData: any }) {
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const currentCategory = searchParams.get("category") || undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentSort = (searchParams.get("sort") as any) || "updatedAt";
  const currentCursor = searchParams.get("cursor")
    ? parseInt(searchParams.get("cursor")!, 10)
    : undefined;

  useEffect(() => {
    if (
      !searchParams.has("category") &&
      !searchParams.has("sort") &&
      !searchParams.has("cursor")
    ) {
      setData(initialData);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await fetchStoriesPaginated({
          status: "COMPLETED" as any,
          categorySlug: currentCategory,
          limit: 20,
          cursor: currentCursor,
          sortBy: currentSort,
        });
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentCategory, currentSort, currentCursor, initialData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <StoryListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  const stories: any[] = data?.data || [];
  const nextCursor = data?.nextCursor;

  if (stories.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4 border border-border/50">
          <Filter className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-xl font-bold text-muted-foreground">
          Chưa có dữ liệu cho tiêu chí này.
        </p>
        <p className="text-sm text-muted-foreground/60 mt-2">
          Hãy thử thay đổi bộ lọc hoặc quay lại sau nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12">
        {stories.map((story, index) => (
          <div key={story.id} className="relative group">
            <StoryListItem story={story} index={index} />
          </div>
        ))}
      </div>

      {nextCursor && (
        <div className="flex justify-center mt-12 pb-10">
          <Link
            href={`/hoan-thanh?sort=${currentSort}${currentCategory ? `&category=${currentCategory}` : ""}&cursor=${nextCursor}`}
          >
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-6 h-auto font-bold border-2 border-[#d97757]/20 hover:border-[#d97757]/50 transition-all hover:bg-[#d97757]/5 flex items-center gap-2 group"
            >
              Xem Thêm Kết Quả
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
