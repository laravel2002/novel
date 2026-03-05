import { Metadata } from "next";
import { ReadingHistoryClient } from "@/features/history/components/ReadingHistoryClient";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Lịch sử đọc truyện | AntiGravity",
  description: "Các bộ truyện bạn đã đọc gần đây",
};

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="relative py-12 md:py-16 overflow-hidden mb-6 border-b border-primary/10 bg-[#141413]">
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
          }}
        />
        <div className="container relative z-10 mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-2 ring-4 ring-primary/10">
              <Clock className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-5xl font-serif text-[#faf9f5] font-bold tracking-tight">
              Lịch sử đọc
            </h1>
            <p className="text-[#b0aea5] max-w-xl mx-auto text-sm md:text-base">
              Theo dõi và tiếp tục đọc những bộ truyện đang dang dở của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-0 max-w-4xl max-w-3xl">
        <ReadingHistoryClient />
      </div>
    </div>
  );
}
