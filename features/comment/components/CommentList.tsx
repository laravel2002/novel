"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import type { CommentResult } from "../services/comment";
import { cn } from "@/lib/utils";

export function CommentList({
  comments,
  currentUserId,
  onDelete,
  isLoading,
}: {
  comments: CommentResult[];
  currentUserId: string | null;
  onDelete: (id: number) => void;
  isLoading: boolean;
}) {
  const [revealedSpoilers, setRevealedSpoilers] = useState<
    Record<number, boolean>
  >({});

  const toggleSpoiler = (id: number) => {
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-secondary/50" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-secondary/50 rounded w-1/4" />
              <div className="h-4 bg-secondary/50 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-secondary/5 rounded-xl border border-border/20 mt-6">
        <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {comments.map((comment) => {
        const isOwner = currentUserId === comment.User.id;
        const isSpoiler = comment.isSpoiler && !revealedSpoilers[comment.id];

        console.log("comment data", comment);

        return (
          <div key={comment.id} className="flex gap-4 group">
            <Avatar className="w-10 h-10 border border-primary/10 mt-1">
              <AvatarImage src={comment.User.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {comment.User.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[15px]">
                    {comment.User.name || "Ẩn danh"}
                  </span>
                  {comment.User.role === "ADMIN" && (
                    <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                      Admin
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>

                {isOwner && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                    title="Xóa bình luận"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isSpoiler ? (
                <div
                  className="bg-secondary/20 border border-destructive/20 text-muted-foreground p-3 rounded-md text-sm italic cursor-pointer hover:bg-secondary/30 transition-colors flex items-center gap-2"
                  onClick={() => toggleSpoiler(comment.id)}
                >
                  <AlertTriangle className="w-4 h-4 text-destructive/70" />
                  Bình luận này có chứa nội dung tiết lộ cốt truyện (Spoiler).
                  Nhấn để xem.
                </div>
              ) : (
                <div className="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-foreground/90">
                  {comment.content}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
