"use client";

import { useDevice } from "@/components/providers/DeviceProvider";
import { SearchDesktop } from "./SearchDesktop";
import { SearchMobile } from "./SearchMobile";

export function Search() {
  const { isMobile } = useDevice();

  if (isMobile) {
    return <SearchMobile />;
  }

  return <SearchDesktop />;
}
