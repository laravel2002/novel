"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({
  onSubmit,
  isLoggedIn,
  isLoading,
}: {
  onSubmit: (content: string, isSpoiler: boolean) => void;
  isLoggedIn: boolean;
  isLoading: boolean;
}) {
  const [content, setContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content, isSpoiler);
    setContent("");
    setIsSpoiler(false);
  };

  return (
    <div className="bg-secondary/5 border border-border/40 p-5 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">
          💬
        </span>
        Bình luận
      </h3>

      {!isLoggedIn ? (
        <div className="text-center py-6 px-4 bg-muted/30 rounded-lg border border-dashed border-border/60">
          <p className="text-muted-foreground mb-3 text-sm">
            Bạn cần đăng nhập để tham gia thảo luận cùng cộng đồng.
          </p>
          <Button variant="outline" asChild className="rounded-full">
            <a
              href={`/dang-nhap?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
            >
              Đăng nhập ngay
            </a>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Nêu cảm nhận của bạn về chương truyện này..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] bg-background border-border/50 resize-y focus-visible:ring-1 focus-visible:ring-primary/50 text-[15px]"
            maxLength={1000}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-colors"
                style={{ accentColor: "currentColor" }}
              />
              <span className="text-muted-foreground group-hover:text-foreground transition-colors user-select-none">
                Cảnh báo tiết lộ nội dung (Spoiler)
              </span>
            </label>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-xs text-muted-foreground">
                {content.length}/1000
              </span>
              <Button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="rounded-full px-6 shadow-sm hover:shadow transition-all"
              >
                {isLoading ? "Đang gửi..." : "Gửi bình luận"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
