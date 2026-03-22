import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
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
import { getImageUrl } from "@/lib/utils";

interface AudioPlayerProps {
  paragraphs: string[];
  nextChapterUrl: string | null;
  prevChapterUrl: string | null;
  chapterTitle: string;
  onParagraphChange: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
  storyTitle?: string; // Add storyTitle if available for better MediaSession UX
  coverUrl?: string | null;
}

export function AudioPlayer({
  paragraphs,
  nextChapterUrl,
  prevChapterUrl,
  chapterTitle,
  onParagraphChange,
  isOpen,
  onClose,
  storyTitle = "Truyện Audio",
  coverUrl,
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

  // Refs
  const indexRef = useRef(-1);
  const isPlayingRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Ref cho Silent Audio Hack
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  // === Setup Media Session Metadata ===
  useEffect(() => {
    if ("mediaSession" in navigator && isOpen) {
      const artwork = coverUrl
        ? [{ src: getImageUrl(coverUrl), sizes: "512x512", type: "image/jpeg" }]
        : [{ src: "/favicon.ico", sizes: "192x192", type: "image/png" }];

      navigator.mediaSession.metadata = new MediaMetadata({
        title: chapterTitle,
        artist: storyTitle,
        album: "Novel Audio",
        artwork,
      });

      // Handlers for Lock Screen controls
      navigator.mediaSession.setActionHandler("play", () => togglePlay());
      navigator.mediaSession.setActionHandler("pause", () => togglePlay());
      navigator.mediaSession.setActionHandler("previoustrack", () =>
        skipBackward(),
      );
      navigator.mediaSession.setActionHandler("nexttrack", () => skipForward());

      // Update position state for Lock Screen scrubber
      const updatePositionState = () => {
        if ("setPositionState" in navigator.mediaSession) {
          navigator.mediaSession.setPositionState({
            duration: validParagraphs.length || 1,
            playbackRate: rate,
            position: Math.max(0, indexRef.current),
          });
        }
      };

      const interval = setInterval(() => {
        if (isPlayingRef.current) updatePositionState();
      }, 5000);

      return () => {
        clearInterval(interval);
        // Clean up handlers when closed
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    chapterTitle,
    storyTitle,
    coverUrl,
    validParagraphs.length,
    rate,
  ]);

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
      if (silentAudioRef.current) {
        silentAudioRef.current.pause();
      }
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

        // Dừng silent audio
        if (silentAudioRef.current) silentAudioRef.current.pause();
        if ("mediaSession" in navigator)
          navigator.mediaSession.playbackState = "none";

        // Xử lý Next Chapter (Lưu tạm biến localStorage báo hiệu nhảy sang là autoplay)
        if (nextChapterUrl) {
          toast.info("Đang tự động chuyển sang chương tiếp theo...");
          localStorage.setItem("novel-autoplay-next", "true");
          router.push(nextChapterUrl);
        } else {
          toast.success("Đã đọc xong chương truyện!");
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

        // Kích hoạt Silent Audio Hack để nhận Background Permissions
        if (silentAudioRef.current) {
          // Play Promise có thể bị lỗi Autoplay Policy, hứng ngầm
          silentAudioRef.current
            .play()
            .catch((e) => console.log("Silent audio autoplay blocked:", e));
        }
        if ("mediaSession" in navigator)
          navigator.mediaSession.playbackState = "playing";
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
          if (silentAudioRef.current) silentAudioRef.current.pause();
          if ("mediaSession" in navigator)
            navigator.mediaSession.playbackState = "paused";
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
        // Đợi DOM tải xong rồi mới đọc để Chrome không văng Autoplay Policy
        setTimeout(() => {
          // Trigger silent audio trước trong luồng
          if (silentAudioRef.current) {
            silentAudioRef.current.play().catch(() => {});
          }
          playParagraph(0);
        }, 1000);
      }
    }
  }, [isOpen, playParagraph]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!window.speechSynthesis) {
      toast.error("Trình duyệt của bạn không hỗ trợ định dạng Web Speech API.");
      return;
    }

    if (isPlaying) {
      if (isPaused) {
        // Resume
        window.speechSynthesis.resume();
        setIsPaused(false);
        isPlayingRef.current = true;
        if (silentAudioRef.current)
          silentAudioRef.current.play().catch(() => {});
        if ("mediaSession" in navigator)
          navigator.mediaSession.playbackState = "playing";
      } else {
        // Pause
        window.speechSynthesis.pause();
        setIsPaused(true);
        isPlayingRef.current = false;
        if (silentAudioRef.current) silentAudioRef.current.pause();
        if ("mediaSession" in navigator)
          navigator.mediaSession.playbackState = "paused";
      }
    } else {
      // Mẹo sửa lỗi kẹt của Chrome: cancel trước khi play mới
      window.speechSynthesis.cancel();
      // Bật Silent Audio lấy context
      if (silentAudioRef.current) silentAudioRef.current.play().catch(() => {});

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
    if (silentAudioRef.current) silentAudioRef.current.pause();
    if ("mediaSession" in navigator)
      navigator.mediaSession.playbackState = "none";
    onClose();
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
      if (silentAudioRef.current) silentAudioRef.current.pause();
      localStorage.setItem("novel-autoplay-next", "true");
      router.push(nextChapterUrl);
    }
  };

  const handlePrevChapter = () => {
    if (prevChapterUrl) {
      window.speechSynthesis.cancel();
      if (silentAudioRef.current) silentAudioRef.current.pause();
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
      {/* 
        SILENT AUDIO HACK: Giữ wakelock chạy nền trên di động cho Web Speech API 
        File cực nhỏ, loop mãi mãi
      */}
      <audio
        ref={silentAudioRef}
        src="/silent.wav"
        loop
        playsInline // Important for iOS
        className="hidden"
        aria-hidden="true"
      />

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
            onClick={handleNextChapter}
            disabled={!nextChapterUrl}
            className="rounded-full text-muted-foreground hover:text-foreground"
            title="Chương sau"
          >
            <IconPlayerSkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Settings */}
        <div className="flex items-center gap-2 ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9 rounded-full px-4 border-dashed bg-background/50 backdrop-blur-sm"
              >
                <IconSettings className="w-4 h-4" />
                <span className="hidden sm:inline">Cài đặt</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={16}
              className="w-[calc(100vw-2rem)] sm:w-80 p-4 rounded-xl shadow-xl border-border/50 bg-background/95 backdrop-blur-xl z-[110]"
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center justify-between">
                    <span>Giọng đọc</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Tự động ưu tiên Tiếng Việt
                    </span>
                  </h4>
                  <Select
                    value={selectedVoice}
                    onValueChange={handleVoiceChange}
                  >
                    <SelectTrigger className="w-full h-10 bg-muted/30">
                      <SelectValue placeholder="Chọn giọng đọc..." />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="z-[150] max-h-[40vh]"
                    >
                      {voices.map((v) => (
                        <SelectItem key={v.name} value={v.name}>
                          <span className="truncate block max-w-[200px] sm:max-w-[250px]">
                            {v.name} ({v.lang})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">Tốc độ đọc</h4>
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                      {rate}x
                    </span>
                  </div>
                  <div className="pt-2 px-1">
                    <Slider
                      defaultValue={[rate]}
                      max={2}
                      min={0.5}
                      step={0.1}
                      onValueCommit={handleRateChange}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span>2.0x</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block"></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStop}
            className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
            title="Đóng trình phát"
          >
            <IconX className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
