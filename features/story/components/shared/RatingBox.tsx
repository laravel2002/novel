"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconStarFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { rateStoryAction } from "@/features/interaction/actions/interaction";

interface RatingBoxProps {
  storyId: number;
  currentRating: number; // Điểm trung bình hiện tại của truyện
  userRating: number | null; // Điểm user đã đánh giá (null = chưa)
  isLoggedIn: boolean;
}

export function RatingBox({
  storyId,
  currentRating,
  userRating,
  isLoggedIn,
}: RatingBoxProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(userRating);
  const [avgRating, setAvgRating] = useState(currentRating);
  const [isPending, startTransition] = useTransition();

  const handleRate = (score: number) => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để đánh giá truyện");
      return;
    }

    // Optimistic UI
    setSelectedScore(score);

    startTransition(async () => {
      const result = await rateStoryAction(storyId, score);

      if (result.success) {
        setAvgRating(
          (result as { success: true; newAvgRating: number }).newAvgRating,
        );
        toast.success(`Đã đánh giá ${score} sao!`);
      } else {
        // Rollback
        setSelectedScore(userRating);
        toast.error(result.error);
      }
    });
  };

  // Số sao active (ưu tiên hover > selected)
  const activeStars = hoveredStar ?? selectedScore ?? 0;

  return (
    <Card className="subtle-border flex flex-col items-center justify-between p-5 bg-gradient-to-b from-background to-muted/20 shadow-sm hover:shadow-md transition-all group">
      <div className="flex flex-col items-center gap-1.5 w-full mb-3">
        <div className="text-4xl font-heading font-black text-foreground group-hover:text-primary transition-colors">
          {avgRating.toFixed(1)}
        </div>
        <div
          className="flex justify-center gap-1 my-1 items-center"
          onMouseLeave={() => setHoveredStar(null)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isPending}
              className={cn(
                "transition-all duration-150 cursor-pointer disabled:cursor-wait",
                "hover:scale-125 active:scale-110",
              )}
              onMouseEnter={() => setHoveredStar(star)}
              onClick={() => handleRate(star)}
              aria-label={`Đánh giá ${star} sao`}
            >
              <IconStarFilled
                className={cn(
                  "w-5 h-5 transition-colors duration-150",
                  star <= activeStars
                    ? "text-yellow-400"
                    : "text-muted opacity-30",
                )}
              />
            </button>
          ))}
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          {selectedScore
            ? `Đánh giá của bạn: ${selectedScore} sao`
            : "Chạm để đánh giá"}
        </div>
      </div>
      {!selectedScore && (
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
          onClick={() => {
            if (!isLoggedIn) {
              toast.error("Vui lòng đăng nhập để đánh giá truyện");
            }
          }}
          disabled={isPending}
        >
          Đánh giá truyện
        </Button>
      )}
    </Card>
  );
}
