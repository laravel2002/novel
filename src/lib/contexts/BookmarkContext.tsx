"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useEffect, useState } from "react";

export interface Bookmark {
  id: string; // unique id (slug-chapterNum)
  storySlug: string;
  storyTitle: string;
  chapterNum: number;
  chapterTitle: string;
  timestamp: number;
}

interface BookmarkContextType {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, "id" | "timestamp">) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (storySlug: string, chapterNum: number) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined,
);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("novel-bookmarks");
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
    setMounted(true);
  }, []);

  const saveBookmarks = (newBookmarks: Bookmark[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem("novel-bookmarks", JSON.stringify(newBookmarks));
  };

  const addBookmark = (bookmark: Omit<Bookmark, "id" | "timestamp">) => {
    const id = `${bookmark.storySlug}-${bookmark.chapterNum}`;
    const newBookmark: Bookmark = {
      ...bookmark,
      id,
      timestamp: Date.now(),
    };

    // Remove existing bookmark for same chapter if any (to update timestamp)
    // Or maybe we want to keep only ONE bookmark per story?
    // Usually "Bookmark" = "Mark this chapter". Users might mark multiple chapters or just the latest.
    // Let's allow multiple chapters for now, but usually "Reading Progress" is one per story.
    // "Bookmark" is usually explicit. Let's allow multiple.

    // However, to prevent duplicates:
    const filtered = bookmarks.filter((b) => b.id !== id);
    saveBookmarks([newBookmark, ...filtered]);
  };

  const removeBookmark = (id: string) => {
    const newBookmarks = bookmarks.filter((b) => b.id !== id);
    saveBookmarks(newBookmarks);
  };

  const isBookmarked = (storySlug: string, chapterNum: number) => {
    const id = `${storySlug}-${chapterNum}`;
    return bookmarks.some((b) => b.id === id);
  };

  return (
    <BookmarkContext.Provider
      value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmark() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error("useBookmark must be used within a BookmarkProvider");
  }
  return context;
}
