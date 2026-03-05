"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  upsertReadingHistory,
  syncLocalHistoryToServer,
  removeReadingHistory,
  clearAllReadingHistory,
} from "../services/history";

const LOCAL_STORAGE_KEY = "AG_READING_HISTORY";
const SYNCED_FLAG_KEY = "AG_HISTORY_SYNCED"; // Cờ đánh dấu đã sync xong sau khi login

export interface LocalHistoryItem {
  storyId: number;
  storySlug: string;
  storyTitle: string;
  coverUrl: string | null;
  chapterId: number;
  chapterNum: number;
  chapterTitle: string | null;
  updatedAt: number;
  scrollPercentage?: number;
}

export function useReadingHistory() {
  const { data: session, status } = useSession();
  const [localHistory, setLocalHistory] = useState<LocalHistoryItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Load from Local Storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setLocalHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse local reading history", e);
    }
    setIsReady(true);
  }, []);

  // Sync Local to Server when User Logs In
  useEffect(() => {
    async function syncData() {
      if (
        status !== "authenticated" ||
        !session?.user?.id ||
        !isReady ||
        localHistory.length === 0
      )
        return;

      const hasSynced = localStorage.getItem(SYNCED_FLAG_KEY) === "true";
      if (hasSynced) return; // Chỉ sync 1 lần sau khi login thành công

      try {
        const payload = localHistory.map((h) => ({
          storyId: h.storyId,
          chapterId: h.chapterId,
          updatedAt: h.updatedAt,
          scrollPercentage: h.scrollPercentage || 0,
        }));

        const result = await syncLocalHistoryToServer(session.user.id, payload);
        if (result.success) {
          localStorage.setItem(SYNCED_FLAG_KEY, "true");
          // Optionally clear local history if you strictly want cloud-only,
          // but keeping it locally allows fast fallback. Let's keep it.
        }
      } catch (error) {
        console.error("Failed to sync history to server", error);
      }
    }

    syncData();
  }, [status, session, localHistory, isReady]);

  // Handle Remove Synced Flag when logged out
  useEffect(() => {
    if (status === "unauthenticated") {
      localStorage.removeItem(SYNCED_FLAG_KEY);
    }
  }, [status]);

  /**
   * Action: Add/Update a reading history record
   */
  const recordHistory = useCallback(
    async (item: Omit<LocalHistoryItem, "updatedAt">) => {
      const timestamp = Date.now();
      const newItem: LocalHistoryItem = { ...item, updatedAt: timestamp };

      // 1. Update LocalStorage (for snappy UI & Guest)
      setLocalHistory((prev) => {
        const filtered = prev.filter((h) => h.storyId !== item.storyId);
        const updated = [newItem, ...filtered].slice(0, 100); // Giới hạn lưu 100 bộ gần nhất ở local
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      // 2. Update Server (if logged in)
      if (status === "authenticated" && session?.user?.id) {
        // Sync API Call in background (fire and forget)
        upsertReadingHistory(
          session.user.id,
          item.storyId,
          item.chapterId,
          item.scrollPercentage || 0,
        ).catch((err) => console.error("History UPSERT failed", err));
      }
    },
    [status, session],
  );

  /**
   * Action: Remove a specific item from history
   */
  const removeHistoryItem = useCallback(
    async (storyId: number) => {
      // 1. Local
      setLocalHistory((prev) => {
        const updated = prev.filter((h) => h.storyId !== storyId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      // 2. Server
      if (status === "authenticated" && session?.user?.id) {
        await removeReadingHistory(session.user.id, storyId);
      }
    },
    [status, session],
  );

  /**
   * Action: Clear ALL history
   */
  const clearHistory = useCallback(async () => {
    // 1. Local
    setLocalHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    // 2. Server
    if (status === "authenticated" && session?.user?.id) {
      await clearAllReadingHistory(session.user.id);
    }
  }, [status, session]);

  /**
   * Get specific story history
   */
  const getStoryHistory = useCallback(
    (storyId: number) => {
      return localHistory.find((h) => h.storyId === storyId) || null;
    },
    [localHistory],
  );

  return {
    localHistory, // The raw list extracted from local storage
    isReady, // True when component mounted and localStorage read
    recordHistory, // Function to add a reading marker
    removeHistoryItem, // Function to remove one story
    clearHistory, // Function to wipe everything
    getStoryHistory, // Function to check if a specific story is in history
  };
}
