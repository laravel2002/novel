"use client";

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

  if (isMobile) {
    return <CategoryPageMobile {...props} />;
  }

  if (isTablet) {
    return <CategoryPageTablet {...props} />;
  }

  return <CategoryPageDesktop {...props} />;
}
