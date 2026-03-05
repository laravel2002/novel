"use client";

import { useDevice } from "@/components/providers/DeviceProvider";
import { SearchDesktop, type SearchViewProps } from "./SearchDesktop";
import { SearchMobile } from "./SearchMobile";

export function SearchListUI(props: SearchViewProps) {
  const { isMobile } = useDevice();

  if (isMobile) {
    return <SearchMobile {...props} />;
  }

  return <SearchDesktop {...props} />;
}
