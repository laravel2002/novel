"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchLeaderboardAction } from "@/features/ranking/actions/fetch-leaderboard";
import { RankingUI as RankingListUI } from "@/features/ranking/components/RankingUI";
import StoryListItemSkeleton from "@/features/story/components/shared/StoryListItemSkeleton";

export function LeaderboardListClient({ initialData }: { initialData: any }) {
    const searchParams = useSearchParams();
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const currentCategory = searchParams.get("category") || "views";
    const currentTimeframe = searchParams.get("timeframe") || "all-time";
    const currentPage = Number(searchParams.get("page")) || 1;

    useEffect(() => {
        // Nếu không có filter nào hoặc filter đều trùng mặc định, sử dụng initialData
        if (
            (!searchParams.has("category") || searchParams.get("category") === "views") &&
            (!searchParams.has("timeframe") || searchParams.get("timeframe") === "all-time") &&
            (!searchParams.has("page") || searchParams.get("page") === "1")
        ) {
            setData(initialData);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetchLeaderboardAction({
                    category: currentCategory,
                    timeframe: currentTimeframe,
                    page: currentPage,
                });
                setData(res);
            } catch (err) {
                console.error("Failed to load leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentCategory, currentTimeframe, currentPage, initialData]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="relative">
                        <div className="absolute top-0 right-4 w-11 h-11 bg-muted rounded-full z-20 border-[3px] border-background animate-pulse transform -translate-y-1/2" />
                        <StoryListItemSkeleton />
                    </div>
                ))}
            </div>
        );
    }

    if (!data?.stories || data.stories.length === 0) {
        return (
            <div className="py-20 text-center text-muted-foreground bg-secondary/10 rounded-xl border border-border/50">
                <p className="text-lg">Chưa có dữ liệu cho tiêu chí xếp hạng này.</p>
                <p className="text-sm mt-2 opacity-70">Hãy quay lại sau nhé!</p>
            </div>
        );
    }

    const mappedStories = data.stories.map((s: any) => ({
        ...s,
        rating: s.rating ?? 0,
        totalChapters: s.chapterCount ?? 0,
        categories: s.categories || [],
        updatedAt: new Date(),
    }));

    const isFirstPage = currentPage === 1;

    return (
        <RankingListUI
            mappedStories={mappedStories}
            isFirstPage={isFirstPage}
            page={currentPage}
        />
    );
}
