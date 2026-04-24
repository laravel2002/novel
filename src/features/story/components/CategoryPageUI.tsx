"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { fetchFilteredStories } from "@/features/story/actions/fetch-stories";

import { useDevice } from "@/components/providers/DeviceProvider";
import { CategoryPageDesktop } from "./desktop/CategoryPageDesktop";
import { CategoryPageTablet } from "./tablet/CategoryPageTablet";
import { CategoryPageMobile } from "./mobile/CategoryPageMobile";

export interface CategoryPageUIProps {
  categories: { id: number; name: string; slug: string }[];
  stories: any[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchParamsProps: Record<string, string | undefined>;
}

export function CategoryPageUI(props: CategoryPageUIProps) {
  const { isMobile, isTablet } = useDevice();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState(props.stories);
  const [totalCount, setTotalCount] = useState(props.totalCount);
  const [currentPage, setCurrentPage] = useState(props.currentPage);

  useEffect(() => {
    // Nếu không có search param nào (hoặc chỉ có trang 1), không cần fetch lại vì SSR đã làm
    if (!searchParams.toString() || searchParams.toString() === "page=1") {
      setStories(props.stories);
      setTotalCount(props.totalCount);
      setCurrentPage(1);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const categoryId = searchParams.get("categoryId")
          ? parseInt(searchParams.get("categoryId")!)
          : undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = searchParams.get("status") as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortBy = (searchParams.get("sortBy") || "updatedAt") as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chapterLength = searchParams.get("chapterLength") as any;
        const page = searchParams.get("page")
          ? parseInt(searchParams.get("page")!)
          : 1;

        const result = await fetchFilteredStories({
          categoryId,
          status,
          sortBy,
          chapterLength,
          page,
          limit: 12,
        });

        setStories(result.stories);
        setTotalCount(result.totalCount);
        setCurrentPage(page);
      } catch (error) {
        console.error("Failed to fetch filtered stories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, props.stories, props.totalCount]);

  const totalPages = Math.ceil(totalCount / 12);
  const updatedProps = {
    ...props,
    stories,
    totalCount,
    currentPage,
    totalPages,
    loading,
    searchParamsProps: Object.fromEntries(searchParams.entries()),
  };

  if (isMobile) {
    return <CategoryPageMobile {...updatedProps} />;
  }

  if (isTablet) {
    return <CategoryPageTablet {...updatedProps} />;
  }

  return <CategoryPageDesktop {...updatedProps} />;
}
