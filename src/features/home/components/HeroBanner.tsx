import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconStarFilled,
  IconChevronRight,
  IconBook2,
} from "@tabler/icons-react";
import { getImageUrl } from "@/lib/utils";

interface Story {
  id: number;
  title: string;
  slug: string;
  coverUrl: string | null;
  author: string | null;
  description: string | null;
  rating?: number;
  views?: number;
  category?: { name: string };
}

export function HeroBanner({ featuredStory }: { featuredStory?: Story }) {
  if (!featuredStory) return null;

  return (
    <section className="relative w-full min-h-[500px] md:min-h-[540px] rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/5 isolate shadow-2xl">
      {/* 
        ====================================================
        1. BACKGROUND: Full-Bleed with Cinematic Blur & Glow
        ====================================================
      */}
      <div className="absolute inset-0 z-0">
        <Image
          src={getImageUrl(featuredStory.coverUrl)}
          alt="Banner Background"
          fill
          className="object-cover opacity-20 scale-110 saturate-[2] blur-[80px]"
          priority
        />
        {/* Soft Modern Glass Gradient Overlay - Darkens left side for text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />

        {/* Decorative Brand Accent Gradients */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* 
        ====================================================
        2. FOREGROUND CONTENT: Asymmetric Split Layout
        ====================================================
      */}
      <div className="relative z-10 w-full p-8 md:p-14 lg:p-20 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 h-full min-h-[500px] md:min-h-[540px]">
        {/* LEFT COMPOSITION: Typography & CTAs */}
        <div className="w-full md:w-[60%] flex flex-col items-start justify-center h-full">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge className="bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 shadow-none border border-orange-500/20 uppercase font-black tracking-widest px-3 py-1 text-[10px]">
              Tiêu Điểm
            </Badge>
            {featuredStory.category && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#888] flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white/20" />
                {featuredStory.category.name}
              </span>
            )}
          </div>

          {/* Epic Title Typography */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-black tracking-tighter leading-[1.1] text-white drop-shadow-md mb-6 max-w-3xl">
            {featuredStory.title}
          </h1>

          {/* Special Author Line */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1">
              <IconStarFilled className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                Hot Nhất
              </span>
            </div>
            <p className="text-sm font-medium text-[#aaa]">
              Tác giả:{" "}
              <span className="text-white/90">
                {featuredStory.author || "Đang cập nhật"}
              </span>
            </p>
          </div>

          {/* Story Synopsis */}
          <p className="text-sm md:text-base text-[#888] line-clamp-3 leading-relaxed max-w-2xl font-serif mb-10 border-l-2 border-white/10 pl-4">
            {featuredStory.description ||
              "Một câu chuyện hấp dẫn đang chờ bạn khám phá. Đọc ngay hôm nay để trải nghiệm những cung bậc cảm xúc tuyệt vời nhất được cất giấu trong từng con chữ."}
          </p>

          {/* High-Conversion CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href={`/truyen/${featuredStory.slug}`}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full rounded-full h-12 px-8 text-sm font-bold bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-lg shadow-orange-500/25 border-none transition-all hover:-translate-y-0.5 group"
              >
                Đọc Ngay Bây Giờ
                <IconChevronRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link
              href={`/truyen/${featuredStory.slug}`}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full h-12 px-6 text-sm font-bold border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white/90 hover:text-white"
              >
                Chi Tiết Nội Dung
              </Button>
            </Link>
          </div>
        </div>

        {/* RIGHT COMPOSITION: Floating Book Asset */}
        <div className="hidden md:flex flex-1 justify-end relative h-full items-center mr-10 lg:mr-20">
          <Link
            href={`/truyen/${featuredStory.slug}`}
            className="relative group block perspective-1000"
          >
            {/* Ambient shadow that tracks the book */}
            <div className="absolute inset-0 bg-transparent shadow-[0_30px_100px_rgba(234,88,12,0.15)] rounded-2xl transform scale-90 translate-y-12 translate-x-4 opacity-50 group-hover:opacity-80 transition-opacity duration-700" />

            {/* Book Cover with 3D Rotate Effect */}
            <div className="relative w-56 lg:w-[240px] aspect-[2/3] transform transition-transform duration-700 group-hover:-translate-y-4 group-hover:-rotate-2 group-hover:scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden ring-1 ring-white/10 z-10 border-[6px] border-[#0A0A0A]/50">
              <Image
                src={getImageUrl(featuredStory.coverUrl)}
                alt={featuredStory.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 224px, 240px"
                priority
              />
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/20 mix-blend-overlay pointer-events-none" />
            </div>

            {/* Floating Editorial Badge */}
            <div className="absolute -bottom-6 -left-16 bg-[#18181B]/95 backdrop-blur-xl border border-white/10 px-5 py-3.5 rounded-2xl flex items-center gap-4 transform transition-transform duration-700 group-hover:translate-y-1 group-hover:-translate-x-2 z-20 shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <IconStarFilled className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[#888] uppercase tracking-widest leading-none mb-1">
                  Đánh Giá Tốt Nhất
                </span>
                <span className="text-[13px] font-bold text-white leading-none">
                  Top Đề Cử Tháng
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
