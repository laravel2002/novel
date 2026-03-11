"use client";

import { useReadingSettings } from "@/lib/contexts/ReadingSettingsContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconBook2,
  IconMessageCircle,
  IconChevronLeft,
  IconChevronRight,
  IconDotsVertical,
  IconList,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useAudioStore } from "@/lib/store/audio-store";

// Dynamically import audio player and comments to keep bundle size small
const AudioPlayer = dynamic(
  () => import("./AudioPlayer").then((mod) => mod.AudioPlayer),
  { ssr: false },
);

const InlineCommentDrawer = dynamic(
  () => import("./InlineCommentDrawer").then((mod) => mod.InlineCommentDrawer),
  { ssr: false },
);

import { ChapterSettings } from "./ChapterSettings";
import { ChapterListSidebar } from "./ChapterListSidebar";
import { AudioPlayerController } from "./AudioPlayerController";

interface StoryDetailChapterMobileProps {
  storyId: number;
  chapterId: number;
  userId: string | null;
  storyTitle: string;
  storySlug: string;
  author: string | null;
  chapterNum: number;
  chapterTitle: string | null;
  content: string;
  nextChapterUrl: string | null;
  prevChapterUrl: string | null;
  chapters: Array<{ chapterNum: number; title: string | null }>;
}

export function StoryDetailChapterMobile({
  storyId,
  chapterId,
  userId,
  storyTitle,
  storySlug,
  author,
  chapterNum,
  chapterTitle,
  content,
  nextChapterUrl,
  prevChapterUrl,
  chapters,
}: StoryDetailChapterMobileProps) {
  const { settings } = useReadingSettings();
  const { isOpen: isAudioOpen, setIsOpen: setIsAudioOpen } = useAudioStore();

  const [commentOpen, setCommentOpen] = useState(false);
  const [activeCommentParaId, setActiveCommentParaId] = useState<number | null>(
    null,
  );

  // State for hiding/showing top and bottom bars on scroll (app-like reading experience)
  const [showBars, setShowBars] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();

  const cleanContent = content ? content.normalize("NFC") : "";
  const paragraphs = cleanContent.split(/\r?\n/).filter((p) => p.trim() !== "");

  const safeChapterTitle = chapterTitle ? chapterTitle.normalize("NFC") : "";
  const safeStoryTitle = storyTitle ? storyTitle.normalize("NFC") : "";

  // Handle scroll to show/hide reading UI
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Don't hide at the very top
      if (currentScrollY < 100) {
        setShowBars(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down -> hide bars
        setShowBars(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up -> show bars
        setShowBars(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Click on screen to toggle bars
  const handleTapScreen = (e: React.MouseEvent) => {
    // Prevent toggling if clicking on a button or link
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    setShowBars(!showBars);
  };

  return (
    <div
      className="min-h-[calc(100vh+4rem)] bg-background text-foreground pb-24 md:hidden selection:bg-primary/30 relative -mb-10"
      onClick={handleTapScreen}
    >
      {/* Top App Bar - Disappears on scroll down */}
      <div
        className={cn(
          "fixed top-0 inset-x-0 z-[60] h-14 bg-background/95 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-2 shadow-sm translate-y-0",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/truyen/${storySlug}`)}
          className="rounded-full"
        >
          <IconChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1 text-center truncate px-2">
          <h2 className="text-sm font-bold truncate leading-tight">
            {safeStoryTitle}
          </h2>
          <p className="text-xs text-muted-foreground truncate opacity-80">
            Chương {chapterNum}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <AudioPlayerController />
          <ChapterSettings />
        </div>
      </div>

      {/* Main Reading Content */}
      <div className="w-full px-4 sm:px-6 py-20 min-h-screen transition-all duration-300 mx-auto overflow-x-hidden max-w-full">
        {/* Chapter Title */}
        <div className="mb-8 mt-4">
          <h1 className="text-2xl font-bold leading-tight mb-4">
            {safeChapterTitle || `Chương ${chapterNum}`}
          </h1>
        </div>

        {/* Content Paragraphs */}
        <div
          className={cn(
            "w-full max-w-full break-words transition-all duration-300 overflow-x-hidden",
            settings.fontFamily,
            settings.textAlign === "justify" ? "text-justify" : "text-left",
          )}
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
          }}
        >
          {paragraphs.map((paragraph, index) => (
            <div
              key={index}
              className="relative group mb-5"
              ref={(el) => {
                paragraphRefs.current[index] = el;
              }}
              onDoubleClick={(e) => {
                e.stopPropagation(); // Prevent toggling the UI bars
                setActiveCommentParaId(index);
                setCommentOpen(true);
              }}
            >
              <p className="leading-relaxed">{paragraph}</p>
            </div>
          ))}
        </div>

        {/* End of chapter controls */}
        <div className="mt-12 mb-8 pt-8 border-t border-border/30 flex flex-col items-center justify-center gap-6">
          <h3 className="font-bold text-lg text-muted-foreground">
            Hết Chương {chapterNum}
          </h3>

          <div className="flex items-center justify-center gap-4 w-full px-4">
            {prevChapterUrl ? (
              <Button
                variant="outline"
                asChild
                className="flex-1 h-10 rounded-lg text-sm"
              >
                <Link href={prevChapterUrl} prefetch={true}>
                  <IconChevronLeft className="w-4 h-4 mr-1" /> Trước
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1 h-10 rounded-lg text-sm"
                disabled
              >
                <IconChevronLeft className="w-4 h-4 mr-1" /> Trước
              </Button>
            )}

            {nextChapterUrl ? (
              <Button asChild className="flex-1 h-10 rounded-lg text-sm">
                <Link href={nextChapterUrl} prefetch={true}>
                  Sau <IconChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            ) : (
              <Button className="flex-1 h-10 rounded-lg text-sm" disabled>
                Sau <IconChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - Disappears on scroll down, replaces standard floating toolbar */}
      <div
        className={cn(
          "fixed bottom-5 inset-x-4 z-40 bg-background/90 backdrop-blur-xl border border-border rounded-2xl p-2 flex items-center justify-between transition-all duration-300 shadow-xl",
          showBars
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0 pointer-events-none",
        )}
      >
        {prevChapterUrl ? (
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full w-12 h-12 shrink-0"
          >
            <Link href={prevChapterUrl} prefetch={true}>
              <IconChevronLeft className="w-6 h-6" />
            </Link>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="rounded-full w-12 h-12 shrink-0"
          >
            <IconChevronLeft className="w-6 h-6 opacity-50" />
          </Button>
        )}

        <div className="flex-1 flex justify-center px-2">
          <ChapterListSidebar
            slug={storySlug}
            chapters={chapters}
            currentChapterNum={chapterNum}
          />
        </div>

        {nextChapterUrl ? (
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full w-12 h-12 shrink-0"
          >
            <Link href={nextChapterUrl} prefetch={true}>
              <IconChevronRight className="w-6 h-6" />
            </Link>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="rounded-full w-12 h-12 shrink-0"
          >
            <IconChevronRight className="w-6 h-6 opacity-50" />
          </Button>
        )}
      </div>

      {/* Modals and Drawers */}
      {commentOpen && (
        <InlineCommentDrawer
          isOpen={commentOpen}
          onClose={() => setCommentOpen(false)}
          storyId={storyId}
          chapterId={chapterId}
          userId={userId}
          paragraphId={activeCommentParaId}
          paragraphText={
            activeCommentParaId !== null ? paragraphs[activeCommentParaId] : ""
          }
        />
      )}

      {isAudioOpen && (
        <AudioPlayer
          paragraphs={paragraphs}
          nextChapterUrl={nextChapterUrl}
          prevChapterUrl={prevChapterUrl}
          chapterTitle={safeChapterTitle || `Chương ${chapterNum}`}
          storyTitle={safeStoryTitle}
          isOpen={isAudioOpen}
          onClose={() => setIsAudioOpen(false)}
          onParagraphChange={() => {}}
        />
      )}
    </div>
  );
}
