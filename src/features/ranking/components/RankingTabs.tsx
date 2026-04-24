"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "daily", label: "Top Ngày" },
  { id: "weekly", label: "Top Tuần" },
  { id: "monthly", label: "Top Tháng" },
];

export function RankingTabs() {
  const searchParams = useSearchParams();
  // Default to "daily" if no type is provided in the URL
  const currentType = searchParams.get("type") || "daily";

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-border/60 pb-1">
      {tabs.map((tab) => {
        const isActive = currentType === tab.id;
        return (
          <Link
            key={tab.id}
            href={`/bang-xep-hang?type=${tab.id}`}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative",
              isActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-[-5px] left-0 w-full h-[3px] bg-primary rounded-t-md" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
