"use client";

import { useAudioStore } from "@/lib/store/audio-store";
import { Button } from "@/components/ui/button";
import { IconHeadphones } from "@tabler/icons-react";

export function AudioPlayerController() {
  const { isOpen, setIsOpen } = useAudioStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsOpen(!isOpen)}
      className="shrink-0"
      title="Đọc truyện Audio"
    >
      <IconHeadphones className="w-5 h-5" />
    </Button>
  );
}
