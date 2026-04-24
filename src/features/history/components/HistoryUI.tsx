"use client";

import { useDevice } from "@/components/providers/DeviceProvider";
import { HistoryDesktop } from "./desktop/HistoryDesktop";
import { HistoryMobile } from "./mobile/HistoryMobile";
import type { LocalHistoryItem } from "@/features/history/hooks/useReadingHistory";

export interface HistoryViewProps {
  histories: LocalHistoryItem[];
  isLoading: boolean;
  onRemove: (storyId: number) => Promise<void>;
  onClearAll: () => Promise<void>;
}

export function HistoryUI(props: HistoryViewProps) {
  const { isMobile, isTablet } = useDevice();

  if (isMobile) {
    return <HistoryMobile {...props} />;
  }

  // Tablet uses Desktop layout for now since it's a simple list/grid
  return <HistoryDesktop {...props} />;
}
