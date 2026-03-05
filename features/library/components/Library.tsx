"use client";

import { useDevice } from "@/components/providers/DeviceProvider";
import { LibraryDesktop, type LibraryViewProps } from "./LibraryDesktop";
import { LibraryMobile } from "./LibraryMobile";

export function LibraryListUI(props: LibraryViewProps) {
  const { isMobile } = useDevice();

  if (isMobile) {
    return <LibraryMobile {...props} />;
  }

  return <LibraryDesktop {...props} />;
}
