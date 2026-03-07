"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconSend, IconUser, IconEyeOff } from "@tabler/icons-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { mutate } from "swr";

interface Comment {
  id: number;
  userId: string;
  storyId: number;
  chapterId: number;
  paragraphId: number;
  content: string;
  isSpoiler: boolean;
  createdAt: string;
  userName: string | null;
  userImage: string | null;
}

interface InlineCommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: number;
  chapterId: number;
  paragraphId: number | null;
  userId: string | null;
  paragraphText: string;
}

export function InlineCommentDrawer({
  isOpen,
  onClose,
  storyId,
  chapterId,
  paragraphId,
  userId,
  paragraphText,
}: InlineCommentDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && paragraphId !== null) {
      fetchComments();
    }
  }, [isOpen, paragraphId]);

  const fetchComments = async () => {
    if (paragraphId === null) return;
    setIsLoading(true);
    try {
      // Gọi tới Next.js API Routes (Serverless Functions) thay vì Python API
      const res = await fetch(
        `/api/comments/chapter/${chapterId}?paragraphId=${paragraphId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Lỗi tải bình luận:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }
    if (!content.trim() || paragraphId === null) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          storyId,
          chapterId,
          paragraphId,
          content,
          isSpoiler,
        }),
      });

      if (res.ok) {
        const newCmd = await res.json();
        setComments((prev) => [...prev, newCmd]);
        setContent("");
        setIsSpoiler(false);

        // Mutate SWR cache for comment counts
        mutate(`/api/comments/chapter/${chapterId}/counts`);
      } else {
        toast.error("Không thể gửi bình luận");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-background border-l"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-lg">Bình luận đoạn văn</SheetTitle>
          <p className="text-sm text-muted-foreground line-clamp-3 italic bg-muted/50 p-2 rounded-md border border-l-2 border-l-primary">
            &quot;{paragraphText}&quot;
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></span>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 opacity-70">
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </div>
          ) : (
            comments.map((cmd) => (
              <div
                key={cmd.id}
                className="flex gap-3 animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
                  {cmd.userImage ? (
                    <Image
                      src={cmd.userImage}
                      alt={cmd.userName || ""}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-muted">
                      <IconUser className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col items-start bg-muted/30 p-3 rounded-2xl rounded-tl-none text-sm group">
                  <div className="flex items-baseline gap-2 mb-1 w-full justify-between">
                    <span className="font-bold text-foreground/80">
                      {cmd.userName || "Khách"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(cmd.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>

                  {cmd.isSpoiler ? (
                    <div className="relative cursor-pointer group/spoiler">
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center rounded transition-all group-hover/spoiler:opacity-0 group-hover/spoiler:-z-10 z-10">
                        <span className="text-xs font-medium flex items-center gap-1">
                          <IconEyeOff className="w-3 h-3" /> Spoilers (Chạm để
                          xem)
                        </span>
                      </div>
                      <p className="SelectAll whitespace-pre-wrap leading-relaxed">
                        {cmd.content}
                      </p>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {cmd.content}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-background">
          {!userId ? (
            <div className="text-center p-3 bg-muted rounded-md text-sm text-muted-foreground">
              Bạn cần đăng nhập để bình luận.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Textarea
                placeholder="Viết bình luận của bạn..."
                className="resize-none min-h-20"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="spoiler"
                    checked={isSpoiler}
                    onCheckedChange={(c) => setIsSpoiler(c as boolean)}
                  />
                  <label
                    htmlFor="spoiler"
                    className="text-xs text-muted-foreground cursor-pointer select-none"
                  >
                    Chứa nội dung Spoilers
                  </label>
                </div>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!content.trim() || submitting}
                  className="rounded-full px-4"
                >
                  <IconSend className="w-4 h-4 mr-1" />
                  Gửi
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
