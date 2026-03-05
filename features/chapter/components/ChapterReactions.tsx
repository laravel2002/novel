"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REACTIONS = [
  { id: "heart", emoji: "❤️", label: "Yêu thích" },
  { id: "fire", emoji: "🔥", label: "Cháy" },
  { id: "cry", emoji: "😭", label: "Cảm động" },
  { id: "laugh", emoji: "😂", label: "Hài hước" },
  { id: "mindblown", emoji: "🤯", label: "Bất ngờ" },
];

export function ChapterReactions() {
  const [counts, setCounts] = useState<Record<string, number>>({
    heart: 24,
    fire: 12,
    cry: 5,
    laugh: 8,
    mindblown: 3,
  });
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [flyingEmojis, setFlyingEmojis] = useState<
    {
      id: number;
      emoji: string;
      randomX: number;
      randomRotate: number;
      randomScale: number;
      randomXDiff: number;
    }[]
  >([]);

  const handleReaction = (reactionId: string, emoji: string) => {
    // Tăng count local để tạo cảm giác real-time
    setCounts((prev) => ({
      ...prev,
      [reactionId]: prev[reactionId] + 1,
    }));
    setActiveReaction(reactionId);

    // Tạo hiệu ứng bay
    // eslint-disable-next-line react-hooks/purity
    const newId = Date.now() + Math.random();

    // eslint-disable-next-line react-hooks/purity
    const randomX = (Math.random() - 0.5) * 200;
    // eslint-disable-next-line react-hooks/purity
    const randomRotate = (Math.random() - 0.5) * 60;
    // eslint-disable-next-line react-hooks/purity
    const randomScale = 0.8 + Math.random() * 0.7;
    // eslint-disable-next-line react-hooks/purity
    const randomXDiff = (Math.random() - 0.5) * 50;

    setFlyingEmojis((prev) => [
      ...prev,
      { id: newId, emoji, randomX, randomRotate, randomScale, randomXDiff },
    ]);

    // Xoá emoji sau khi animation hoàn tất (2s)
    setTimeout(() => {
      setFlyingEmojis((prev) => prev.filter((e) => e.id !== newId));
    }, 2000);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-card border rounded-2xl shadow-sm my-16 max-w-2xl mx-auto overflow-visible">
      <h3 className="text-xl font-bold mb-6">
        Bạn cảm thấy chương này thế nào?
      </h3>

      <div className="flex flex-wrap justify-center gap-3 md:gap-4 relative z-10 w-full">
        {REACTIONS.map((reaction) => {
          const isActive = activeReaction === reaction.id;
          return (
            <Button
              key={reaction.id}
              variant={isActive ? "default" : "outline"}
              size="lg"
              className={cn(
                "rounded-full h-12 md:h-14 px-4 md:px-6 flex items-center gap-2 hover:scale-105 transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground border-transparent shadow-md"
                  : "hover:bg-muted",
              )}
              onClick={() => handleReaction(reaction.id, reaction.emoji)}
            >
              <span className="text-2xl">{reaction.emoji}</span>
              <span className="font-semibold">{counts[reaction.id]}</span>
            </Button>
          );
        })}
      </div>

      {/* Hiệu ứng thả tim bay lên (Floating Emojis) */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-0 overflow-hidden">
        <AnimatePresence>
          {flyingEmojis.map((e) => {
            return (
              <motion.div
                key={e.id}
                initial={{
                  opacity: 1,
                  y: 50,
                  x: e.randomX,
                  scale: e.randomScale,
                  rotate: 0,
                }}
                animate={{
                  opacity: [1, 1, 0],
                  y: -200,
                  x: e.randomX + e.randomXDiff,
                  rotate: e.randomRotate,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute bottom-0 left-1/2 -ml-4 text-4xl drop-shadow-md select-none"
              >
                {e.emoji}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
