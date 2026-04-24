"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import {
  createComment,
  getChapterComments,
  deleteComment,
  type CommentResult,
} from "../services/comment";
import { Button } from "@/components/ui/button";

export function CommentSection({
  storyId,
  chapterId,
  currentUserId,
  isLoggedIn,
}: {
  storyId: number;
  chapterId: number;
  currentUserId: string | null;
  isLoggedIn: boolean;
}) {
  const [comments, setComments] = useState<CommentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalComments, setTotalComments] = useState(0);

  const fetchComments = async (pageNum: number, isLoadMore = false) => {
    setIsLoading(true);
    const result = await getChapterComments(chapterId, pageNum, 10);

    if (result.success) {
      if (isLoadMore) {
        setComments((prev) => [...prev, ...(result.comments || [])]);
      } else {
        setComments(result.comments || []);
      }
      setTotalComments(result.total || 0);
      setHasMore(pageNum < (result.totalPages || 0));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchComments(1);
  }, [chapterId]);

  const handleCreateComment = async (content: string, isSpoiler: boolean) => {
    setIsSubmitting(true);
    const result = await createComment({
      storyId,
      chapterId,
      content,
      isSpoiler,
    });

    if (result.success && result.comment) {
      toast.success("Đã gửi bình luận!");
      // Add the new comment to the top of the list locally
      setComments((prev) => [result.comment as CommentResult, ...prev]);
      setTotalComments((prev) => prev + 1);
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    const result = await deleteComment(commentId);
    if (result.success) {
      toast.success("Đã xóa bình luận.");
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotalComments((prev) => prev - 1);
    } else {
      toast.error(result.error);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  return (
    <div className="mt-12 pt-8 border-t border-border/50" id="comments">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold tracking-tight flex items-center gap-2">
          Bình luận
          <span className="text-sm font-sans font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
            {totalComments}
          </span>
        </h2>
      </div>

      <CommentForm
        onSubmit={handleCreateComment}
        isLoggedIn={isLoggedIn}
        isLoading={isSubmitting}
      />

      <CommentList
        comments={comments}
        currentUserId={currentUserId}
        onDelete={handleDeleteComment}
        isLoading={isLoading && page === 1}
      />

      {hasMore && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="rounded-full px-8 hover:bg-secondary/50"
          >
            {isLoading ? "Đang tải thêm..." : "Tải thêm bình luận"}
          </Button>
        </div>
      )}
    </div>
  );
}
