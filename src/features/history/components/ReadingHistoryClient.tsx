"use client";

import { useReadingHistory } from "@/features/history/hooks/useReadingHistory";
import { HistoryUI } from "./HistoryUI";

export function ReadingHistoryClient() {
  const { localHistory, isReady, removeHistoryItem, clearHistory } =
    useReadingHistory();

  return (
    <HistoryUI
      histories={localHistory}
      isLoading={!isReady}
      onRemove={removeHistoryItem}
      onClearAll={clearHistory}
    />
  );
}
