"use server";

import { getFilteredStories, FilterParams } from "../services/story";
import { getStoriesPaginated, PaginationParams } from "@/features/story/services/discovery";

export async function fetchFilteredStories(params: FilterParams) {
    return await getFilteredStories(params);
}

export async function fetchStoriesPaginated(params: PaginationParams) {
    return await getStoriesPaginated(params);
}
