"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconPlayerSkipForward,
  IconPlayerSkipBack,
  IconPlayerTrackNextFilled,
  IconPlayerTrackPrevFilled,
  IconSettings,
  IconHeadphones,
  IconX,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AudioPlayerProps {
  paragraphs: string[];
  nextChapterUrl: string | null;
  prevChapterUrl: string | null;
  chapterTitle: string;
  onParagraphChange: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AudioPlayer({
  paragraphs,
  nextChapterUrl,
  prevChapterUrl,
  chapterTitle,
  onParagraphChange,
  isOpen,
  onClose,
}: AudioPlayerProps) {
  const router = useRouter();

  // Tính sẵn số đoạn không trống
  const validParagraphs = paragraphs.filter((p) => p.trim() !== "");

  // === States ===
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Refs để lưu giá trị tĩnh tránh stale closure
  const indexRef = useRef(-1);
  const isPlayingRef = useRef(false);
  // Dùng global variable gắn vào window để tránh Utterance bị Garbage Collected (BUG CỦA CHROME)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // === Khởi tạo Voices ===
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        // Ưu tiên giọng tiếng Việt
        const viVoices = availableVoices.filter((v) => v.lang.includes("vi"));
        // Nếu không có tiếng Việt, lấy cái đầu tiên
        const listToUse = viVoices.length > 0 ? viVoices : availableVoices;
        setVoices(listToUse);

        // Khôi phục từ localStorage nếu có, nếu không lấy cái đầu tiên
        const savedVoice = localStorage.getItem("novel-audio-voice");
        if (savedVoice && listToUse.find((v) => v.name === savedVoice)) {
          setSelectedVoice(savedVoice);
        } else if (listToUse.length > 0) {
          setSelectedVoice(listToUse[0].name);
        }
      }
    };

    loadVoices();
    // Chrome cần bắt event này vì voices load bất đồng bộ
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Khôi phục setting từ localStorage
  useEffect(() => {
    const savedRate = localStorage.getItem("novel-audio-rate");
    if (savedRate) setRate(parseFloat(savedRate));

    const savedVolume = localStorage.getItem("novel-audio-volume");
    if (savedVolume) setVolume(parseFloat(savedVolume));
  }, []);

  // Hủy âm thanh khi unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (typeof window !== "undefined") {
        (
          window as Window &
            typeof globalThis & {
              currentUtterance?: SpeechSynthesisUtterance | null;
            }
        ).currentUtterance = null;
      }
    };
  }, []);

  // === Core Logic: Play Paragraph ===
  const playParagraph = useCallback(
    function play(index: number) {
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel(); // Dừng câu hiện tại trước

      if (index >= validParagraphs.length) {
        // Đã đọc xong toàn bộ bài
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentIndex(-1);
        onParagraphChange(-1);

        // Xử lý Next Chapter (Lưu tạm biến localStorage báo hiệu nhảy sang là autoplay)
        if (nextChapterUrl) {
          toast.info("Đang tự động chuyển sang chương tiếp theo...");
          localStorage.setItem("novel-autoplay-next", "true");
          router.push(nextChapterUrl);
        } else {
          toast.success("Đã đọc xong chuơng truyện!");
        }
        return;
      }

      if (index < 0) return;

      const text = validParagraphs[index];
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.rate = rate;
      utterance.volume = volume;

      const voiceToUse = voices.find((v) => v.name === selectedVoice);
      if (voiceToUse) {
        utterance.voice = voiceToUse;
      }

      // Xử lý sự kiện
      utterance.onstart = () => {
        setCurrentIndex(index);
        indexRef.current = index;
        onParagraphChange(index);
        setIsPlaying(true);
        setIsPaused(false);
        isPlayingRef.current = true;
      };

      utterance.onend = () => {
        // Chỉ cuộn tiếp nếu đang thực sự Play (không phải bị stop hay pause đột ngột)
        if (isPlayingRef.current) {
          const nextIdx = index + 1;
          setTimeout(() => {
            play(nextIdx);
          }, 200); // Nghỉ 0.2s giữa các đoạn văn
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.error("Speech error", e);
          setIsPlaying(false);
          setIsPaused(false);
          isPlayingRef.current = false;
        }
      };

      utteranceRef.current = utterance;
      // Gắn tệp tham chiếu vào Window để tránh bị Chrome xóa bộ nhớ rác giữa chừng làm tắt tiếng
      (
        window as Window &
          typeof globalThis & {
            currentUtterance?: SpeechSynthesisUtterance | null;
          }
      ).currentUtterance = utterance;

      // Chrome Bug: Thỉnh thoảng speechSynthesis bị kẹt ở trạng thái pause ngầm
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    },
    [
      validParagraphs,
      voices,
      selectedVoice,
      rate,
      volume,
      onParagraphChange,
      nextChapterUrl,
      router,
    ],
  );

  // === Cấu hình Tự động chạy tiếp khi nhảy trang ===
  useEffect(() => {
    if (typeof window !== "undefined" && isOpen) {
      const shouldAutoPlay = localStorage.getItem("novel-autoplay-next");
      if (shouldAutoPlay === "true") {
        localStorage.removeItem("novel-autoplay-next"); // Xóa ngay tránh chạy lại lần trễ
        // Đợi xíu cho DOM tải xong rồi mới đọc
        setTimeout(() => {
          playParagraph(0);
        }, 1000);
      }
    }
  }, [isOpen, playParagraph]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!window.speechSynthesis) {
      toast.error("Trình duyệt của bạn không hỗ trợ tính năng Đọc giọng nói.");
      return;
    }

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        isPlayingRef.current = true;
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
        isPlayingRef.current = false;
      }
    } else {
      // Mẹo sửa lỗi kẹt của Chrome: cancel trước khi play mới
      window.speechSynthesis.cancel();
      // Chưa play gì hết thì bắt đầu từ đầu hoặc từ index đang bấm chọn
      const startIndex = currentIndex >= 0 ? currentIndex : 0;
      setTimeout(() => {
        playParagraph(startIndex);
      }, 50);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    isPlayingRef.current = false;
    setCurrentIndex(-1);
    onParagraphChange(-1);
  };

  const skipForward = () => {
    if (currentIndex < validParagraphs.length - 1) {
      playParagraph(currentIndex + 1);
    }
  };

  const skipBackward = () => {
    if (currentIndex > 0) {
      playParagraph(currentIndex - 1);
    }
  };

  const handleNextChapter = () => {
    if (nextChapterUrl) {
      window.speechSynthesis.cancel();
      localStorage.setItem("novel-autoplay-next", "true");
      router.push(nextChapterUrl);
    }
  };

  const handlePrevChapter = () => {
    if (prevChapterUrl) {
      window.speechSynthesis.cancel();
      localStorage.setItem("novel-autoplay-next", "true");
      router.push(prevChapterUrl);
    }
  };

  // Cập nhật State phụ
  const handleRateChange = (val: number[]) => {
    const newRate = val[0];
    setRate(newRate);
    localStorage.setItem("novel-audio-rate", newRate.toString());
    // Khởi động lại câu lệnh hiện tại với rate mới nếu đang chạy
    if (isPlaying && !isPaused) {
      playParagraph(indexRef.current);
    }
  };

  const handleVoiceChange = (val: string) => {
    setSelectedVoice(val);
    localStorage.setItem("novel-audio-voice", val);
    if (isPlaying && !isPaused) {
      playParagraph(indexRef.current);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 shadow-[0_-4px_10px_rgb(0,0,0,0.1)] transition-transform duration-300">
      <div className="container max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Info Area */}
        <div className="flex items-center gap-3 overflow-hidden w-full md:w-auto">
          <div className="min-w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 relative">
            <IconHeadphones className="w-5 h-5" />
            {isPlaying && !isPaused && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
            )}
          </div>
          <div className="flex flex-col overflow-hidden w-full">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
              Trình Đọc Truyện
            </span>
            <span className="text-sm font-bold truncate">{chapterTitle}</span>
            <div className="w-full mt-2 h-4 pr-1">
              <Slider
                defaultValue={[0]}
                max={Math.max(0, validParagraphs.length - 1)}
                min={0}
                step={1}
                value={[
                  dragIndex !== null ? dragIndex : Math.max(0, currentIndex),
                ]}
                onValueChange={(val) => setDragIndex(val[0])}
                onValueCommit={(val) => {
                  setDragIndex(null);
                  playParagraph(val[0]);
                }}
                className="cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
              <span>
                {validParagraphs.length > 1
                  ? Math.min(
                      100,
                      Math.round(
                        (Math.max(
                          0,
                          dragIndex !== null ? dragIndex : currentIndex,
                        ) /
                          (validParagraphs.length - 1)) *
                          100,
                      ),
                    )
                  : 0}
                %
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevChapter}
            disabled={!prevChapterUrl}
            className="rounded-full text-muted-foreground hover:text-foreground"
            title="Chương trước"
          >
            <IconPlayerSkipBack className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={skipBackward}
            disabled={!isPlaying || currentIndex <= 0}
            className="rounded-full"
            title="Đoạn trước"
          >
            <IconPlayerTrackPrevFilled className="w-5 h-5" />
          </Button>

          <Button
            variant={isPlaying && !isPaused ? "default" : "secondary"}
            size="icon"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full shadow-sm"
          >
            {isPlaying && !isPaused ? (
              <IconPlayerPause className="w-6 h-6" />
            ) : (
              <IconPlayerPlay className="w-6 h-6 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={skipForward}
            disabled={!isPlaying || currentIndex >= validParagraphs.length - 1}
            className="rounded-full"
            title="Đoạn sau"
          >
            <IconPlayerTrackNextFilled className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextChapter}
            disabled={!nextChapterUrl}
            className="rounded-full text-muted-foreground hover:text-foreground"
            title="Chương sau"
          >
            <IconPlayerSkipForward className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleStop}
            disabled={!isPlaying && currentIndex === -1}
            className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Dừng tắt"
          >
            <IconPlayerStop className="w-5 h-5" />
          </Button>
        </div>

        {/* Settings */}
        <div className="flex items-center gap-2 ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9 rounded-full px-4 border-dashed"
              >
                <IconSettings className="w-4 h-4" />
                <span className="hidden sm:inline">Cài đặt</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Giọng đọc</h4>
                  <Select
                    value={selectedVoice}
                    onValueChange={handleVoiceChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn giọng đọc..." />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((v) => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">Tốc độ ({rate}x)</h4>
                  </div>
                  <Slider
                    defaultValue={[rate]}
                    max={2}
                    min={0.5}
                    step={0.1}
                    onValueCommit={handleRateChange}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Chậm</span>
                    <span>Bình thường</span>
                    <span>Nhanh</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
            title="Đóng trình phát"
          >
            <IconX className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
