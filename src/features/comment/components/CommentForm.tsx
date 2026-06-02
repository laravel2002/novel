"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, type CommentFormData } from "@/lib/validations/comment.schema";

const FormMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className="text-[13px] font-medium text-destructive mt-1">{message}</p>;
};

export function CommentForm({
  onSubmit,
  isLoggedIn,
  isLoading,
}: {
  onSubmit: (content: string, isSpoiler: boolean) => void;
  isLoggedIn: boolean;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "", isSpoiler: false },
  });

  const content = watch("content", "");

  const onFormSubmit = (data: CommentFormData) => {
    onSubmit(data.content, data.isSpoiler ?? false);
    reset();
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
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3">
          <Textarea
            placeholder="Nêu cảm nhận của bạn về chương truyện này..."
            className="min-h-[100px] bg-background border-border/50 resize-y focus-visible:ring-1 focus-visible:ring-primary/50 text-[15px]"
            maxLength={1000}
            disabled={isLoading}
            {...register("content")}
          />
          <FormMessage message={errors.content?.message} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-colors"
                style={{ accentColor: "currentColor" }}
                disabled={isLoading}
                {...register("isSpoiler")}
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
