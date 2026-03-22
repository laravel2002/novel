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

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CompletedFiltersProps {
  categories: Category[];
}

export function CompletedFilters({ categories }: CompletedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "updatedAt";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset page when filtering
      params.delete("cursor");
      return params.toString();
    },
    [searchParams],
  );

  const handleCategoryChange = (val: string) => {
    const query = createQueryString("category", val);
    router.push(`/hoan-thanh${query ? `?${query}` : ""}`);
  };

  const handleSortChange = (val: string) => {
    const query = createQueryString("sort", val);
    router.push(`/hoan-thanh${query ? `?${query}` : ""}`);
  };

  return (
    <div className="flex flex-col gap-6 bg-muted/30 p-4 sm:p-6 rounded-2xl border border-border/50 backdrop-blur-sm mb-8">
      {/* Category Tabs */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
          Thể loại
        </label>
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <Tabs
            value={currentCategory}
            onValueChange={handleCategoryChange}
            className="w-full"
          >
            <TabsList className="h-10 bg-background/50 border p-1 rounded-xl w-max min-w-full sm:min-w-0">
              <TabsTrigger
                value="all"
                className="px-5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-bold text-sm"
              >
                Tất cả
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.slug}
                  className="px-5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-bold text-sm"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="h-[1px] w-full bg-border/40" />

      {/* Sort Options */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            Sắp xếp theo:
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "updatedAt", label: "Mới hoàn thành" },
              { id: "views", label: "Xem nhiều nhất" },
              { id: "rating", label: "Đánh giá cao" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => handleSortChange(option.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  currentSort === option.id
                    ? "bg-[#d97757] text-[#faf9f5] border-[#d97757] shadow-lg shadow-[#d97757]/20"
                    : "bg-background/50 text-muted-foreground border-border/50 hover:border-[#d97757]/30 hover:text-[#faf9f5]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
