"use server";

import { getLeaderboard, LeaderboardCategory, LeaderboardTimeframe } from "@/services/leaderboard";

export async function fetchLeaderboardAction(params: {
    category: string;
    timeframe: string;
    page: number;
}) {
    return await getLeaderboard({
        category: params.category as LeaderboardCategory,
        timeframe: params.timeframe as LeaderboardTimeframe,
        limit: 20,
        page: params.page,
    });
}
