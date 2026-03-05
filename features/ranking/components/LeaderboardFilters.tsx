"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LeaderboardCategory,
  LeaderboardTimeframe,
} from "@/services/leaderboard";

export function LeaderboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory =
    (searchParams.get("category") as LeaderboardCategory) || "views";
  const currentTimeframe =
    (searchParams.get("timeframe") as LeaderboardTimeframe) || "all-time";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams],
  );

  const handleCategoryChange = (val: string) => {
    router.push(`/bang-xep-hang?${createQueryString("category", val)}`);
  };

  const handleTimeframeChange = (val: string) => {
    router.push(`/bang-xep-hang?${createQueryString("timeframe", val)}`);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/50 p-2 sm:p-4 rounded-xl mb-6 sm:mb-8 border border-border/50 backdrop-blur-sm">
      <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
        <Tabs
          value={currentCategory}
          onValueChange={handleCategoryChange}
          className="w-full"
        >
          <TabsList className="h-10 sm:h-12 w-full sm:w-auto bg-background/50 border p-1 rounded-lg">
            <TabsTrigger
              value="views"
              className="px-3 sm:px-6 h-8 sm:h-10 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all font-semibold"
            >
              Lượt đọc
            </TabsTrigger>
            <TabsTrigger
              value="votes"
              className="px-3 sm:px-6 h-8 sm:h-10 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all font-semibold"
            >
              Đề cử
            </TabsTrigger>
            <TabsTrigger
              value="donates"
              className="px-3 sm:px-6 h-8 sm:h-10 rounded-md data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all font-semibold"
            >
              Tặng thưởng
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="px-3 sm:px-6 h-8 sm:h-10 rounded-md data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all font-semibold"
            >
              Thịnh hành
            </TabsTrigger>
            <TabsTrigger
              value="bookmarks"
              className="px-3 sm:px-6 h-8 sm:h-10 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all font-semibold"
            >
              Cất chứa
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="px-3 sm:px-6 h-8 sm:h-10 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all font-semibold"
            >
              Bình luận
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex w-full sm:w-auto items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-2 whitespace-nowrap hidden lg:inline-block">
          Thời gian:
        </span>
        <Select value={currentTimeframe} onValueChange={handleTimeframeChange}>
          <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] h-10 sm:h-12 bg-background font-semibold border-border/50 focus:ring-primary/20 transition-all rounded-lg">
            <SelectValue placeholder="Chọn thời gian" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl border-border/50">
            <SelectItem
              value="daily"
              className="py-2.5 sm:py-3 cursor-pointer rounded-md font-medium"
            >
              Bảng xếp hạng ngày
            </SelectItem>
            <SelectItem
              value="weekly"
              className="py-2.5 sm:py-3 cursor-pointer rounded-md font-medium"
            >
              Bảng xếp hạng tuần
            </SelectItem>
            <SelectItem
              value="monthly"
              className="py-2.5 sm:py-3 cursor-pointer rounded-md font-medium"
            >
              Bảng xếp hạng tháng
            </SelectItem>
            <SelectItem
              value="all-time"
              className="py-2.5 sm:py-3 cursor-pointer rounded-md font-medium"
            >
              Top mọi thời đại
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
