"use client";

import { ReadingSettingsProvider } from "@/lib/contexts/ReadingSettingsContext";

export default function ChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReadingSettingsProvider>{children}</ReadingSettingsProvider>;
}
