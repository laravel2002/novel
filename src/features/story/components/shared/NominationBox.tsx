"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconCheck, IconFlame } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { nominateStoryAction } from "@/features/interaction/actions/interaction";

interface NominationBoxProps {
  storyId: number;
  totalNominations: number;
  hasNominatedToday: boolean;
  remainingToday: number; // Số phiếu còn lại hôm nay
  isLoggedIn: boolean;
}

export function NominationBox({
  storyId,
  totalNominations: initialTotal,
  hasNominatedToday: initialNominated,
  remainingToday: initialRemaining,
  isLoggedIn,
}: NominationBoxProps) {
  const [totalNominations, setTotalNominations] = useState(initialTotal);
  const [hasNominated, setHasNominated] = useState(initialNominated);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [isPending, startTransition] = useTransition();

  const isDisabled = hasNominated || remaining <= 0;

  const handleNominate = () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để đề cử truyện");
      return;
    }

    if (hasNominated) {
      toast.info("Bạn đã đề cử truyện này hôm nay rồi");
      return;
    }

    if (remaining <= 0) {
      toast.info("Bạn đã dùng hết 3 phiếu đề cử hôm nay");
      return;
    }

    // Optimistic UI
    setHasNominated(true);
    setTotalNominations((prev) => prev + 1);
    setRemaining((prev) => prev - 1);

    startTransition(async () => {
      const result = await nominateStoryAction(storyId);

      if (result.success) {
        const data = result as {
          success: true;
          totalNominations: number;
          remainingToday: number;
        };
        setTotalNominations(data.totalNominations);
        setRemaining(data.remainingToday);
        toast.success(
          `Đề cử thành công! Còn ${data.remainingToday} phiếu hôm nay 🎉`,
        );
      } else {
        // Rollback
        setHasNominated(false);
        setTotalNominations((prev) => prev - 1);
        setRemaining((prev) => prev + 1);
        toast.error(result.error);
      }
    });
  };

  return (
    <Card className="subtle-border flex flex-col items-center justify-between p-5 bg-gradient-to-b from-background to-green-500/5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex flex-col items-center gap-1.5 w-full mb-3">
        <div
          className={cn(
            "text-4xl font-heading font-black transition-colors",
            hasNominated
              ? "text-green-500"
              : "text-green-500 group-hover:text-green-600",
          )}
        >
          {totalNominations.toLocaleString()}
        </div>
        <div className="h-6 flex items-center justify-center">
          {hasNominated ? (
            <div className="flex items-center gap-1 text-green-500 text-xs font-semibold animate-in fade-in slide-in-from-bottom-1">
              <IconCheck className="w-3.5 h-3.5" />
              Đã đề cử hôm nay
            </div>
          ) : isLoggedIn ? (
            <div className="text-xs font-medium text-muted-foreground">
              Còn {remaining} phiếu hôm nay
            </div>
          ) : null}
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          Lượt đề cử
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "w-full rounded-full transition-all",
          isDisabled
            ? "border-green-500/30 text-green-500 bg-green-500/5 cursor-default"
            : "border-green-500/20 text-green-600 hover:bg-green-500/10 hover:text-green-700",
        )}
        onClick={handleNominate}
        disabled={isPending || isDisabled}
      >
        {hasNominated ? (
          <span className="flex items-center gap-1.5">
            <IconCheck className="w-4 h-4" />
            Đã đề cử
          </span>
        ) : remaining <= 0 ? (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            Hết phiếu hôm nay
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <IconFlame className="w-4 h-4" />
            Tặng đề cử
          </span>
        )}
      </Button>
    </Card>
  );
}
