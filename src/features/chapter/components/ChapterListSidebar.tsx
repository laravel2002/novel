"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { IconList, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Chapter {
  chapterNum: number;
  title: string | null;
}

interface ChapterListSidebarProps {
  slug: string;
  chapters: Chapter[];
  currentChapterNum: number;
}

export function ChapterListSidebar({
  slug,
  chapters,
  currentChapterNum,
}: ChapterListSidebarProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Danh sách chương"
      >
        <IconList className="h-5 w-5" />
      </Button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div
                className="portal-container"
                style={{ position: "relative", zIndex: 100 }}
              >
                {/* Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 bottom-0 w-full max-w-[85vw] sm:w-[500px] md:w-[600px] bg-background border-l shadow-2xl flex flex-col"
                >
                  <div className="flex flex-none items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold tracking-tight">
                      Danh sách chương
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpen(false)}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {chapters.map((chapter) => (
                        <Link
                          key={chapter.chapterNum}
                          href={`/truyen/${slug}/chuong-${chapter.chapterNum}`}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center px-2 py-1.5 min-h-8 text-sm rounded-md transition-colors hover:bg-muted border",
                            chapter.chapterNum === currentChapterNum
                              ? "bg-primary/10 border-primary/20 text-primary font-medium"
                              : "border-transparent bg-muted/30 text-muted-foreground",
                          )}
                          title={`Chương ${chapter.chapterNum}: ${chapter.title}`}
                        >
                          <span className="shrink-0 mr-2 font-mono text-xs opacity-70 w-8">
                            #{chapter.chapterNum}
                          </span>
                          <span className="truncate flex-1">
                            {chapter.title?.replace(/^Chương \d+:\s*/i, "") ||
                              `Chương ${chapter.chapterNum}`}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
