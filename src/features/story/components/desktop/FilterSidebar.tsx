"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Status } from "@/generated/prisma/client";
import { useCallback } from "react";
import {
  Filter,
  Sparkles,
  Flame,
  Star,
  Clock,
  Layers,
  Loader2,
  CheckCircle,
  BookOpen,
  BookMarked,
  Library,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  categories: { id: number; name: string; slug: string }[];
}

export default function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") as Status | null;
  const currentCategoryId = searchParams.get("categoryId")
    ? parseInt(searchParams.get("categoryId")!)
    : null;
  const currentChapterLength = searchParams.get("chapterLength") as
    | string
    | null;
  const currentSortBy = searchParams.get("sortBy") || "updatedAt";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete("page");
      return params.toString();
    },
    [searchParams],
  );

  const handleStatusChange = (value: string) => {
    router.push(
      pathname +
        "?" +
        createQueryString("status", value === "ALL" ? "" : value),
      { scroll: false },
    );
  };

  const handleSortChange = (value: string) => {
    router.push(pathname + "?" + createQueryString("sortBy", value), {
      scroll: false,
    });
  };

  const handleChapterLengthChange = (value: string) => {
    router.push(
      pathname +
        "?" +
        createQueryString("chapterLength", value === "ALL" ? "" : value),
      { scroll: false },
    );
  };

  const setCategory = (id: number | null) => {
    router.push(
      pathname + "?" + createQueryString("categoryId", id ? id.toString() : ""),
      { scroll: false },
    );
  };

  return (
    <div className="space-y-8 bg-black/40 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 rounded-[2rem] p-5 lg:p-6 shadow-2xl hidden lg:block relative overflow-hidden isolate">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none" />

      <div className="flex items-center gap-3 mb-2 relative z-10">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/30 shadow-[0_0_15px_rgba(234,88,12,0.2)]">
          <Filter className="w-5 h-5" />
        </div>
        <h2 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-white drop-shadow-sm">
          Bộ Lọc
        </h2>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-primary/50 via-white/10 to-transparent mb-6 relative z-10" />

      {/* Sắp xếp */}
      <div className="relative z-10 flex flex-col gap-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
          Sắp xếp
        </h3>
        <div className="flex flex-col gap-1">
          <FilterButton
            active={currentSortBy === "updatedAt"}
            onClick={() => handleSortChange("updatedAt")}
            icon={Sparkles}
            label="Cập nhật"
          />
          <FilterButton
            active={currentSortBy === "views"}
            onClick={() => handleSortChange("views")}
            icon={Flame}
            label="Lượt xem"
          />
          <FilterButton
            active={currentSortBy === "rating"}
            onClick={() => handleSortChange("rating")}
            icon={Star}
            label="Đánh giá"
          />
          <FilterButton
            active={currentSortBy === "newest"}
            onClick={() => handleSortChange("newest")}
            icon={Clock}
            label="Mới đăng"
          />
        </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Tình trạng */}
      <div className="relative z-10 flex flex-col gap-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
          Tình trạng
        </h3>
        <div className="flex flex-col gap-1">
          <FilterButton
            active={!currentStatus}
            onClick={() => handleStatusChange("ALL")}
            icon={Layers}
            label="Tất cả"
          />
          <FilterButton
            active={currentStatus === "ONGOING"}
            onClick={() => handleStatusChange("ONGOING")}
            icon={Loader2}
            label="Đang ra"
          />
          <FilterButton
            active={currentStatus === "COMPLETED"}
            onClick={() => handleStatusChange("COMPLETED")}
            icon={CheckCircle}
            label="Đã hoàn thành"
          />
        </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Độ dài */}
      <div className="relative z-10 flex flex-col gap-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
          Số chương
        </h3>
        <div className="flex flex-col gap-1">
          <FilterButton
            active={!currentChapterLength || currentChapterLength === "ALL"}
            onClick={() => handleChapterLengthChange("ALL")}
            icon={Layers}
            label="Tất cả độ dài"
          />
          <FilterButton
            active={currentChapterLength === "short"}
            onClick={() => handleChapterLengthChange("short")}
            icon={BookOpen}
            label="Dưới 50 chương"
          />
          <FilterButton
            active={currentChapterLength === "medium"}
            onClick={() => handleChapterLengthChange("medium")}
            icon={BookMarked}
            label="50 tới 200 chương"
          />
          <FilterButton
            active={currentChapterLength === "long"}
            onClick={() => handleChapterLengthChange("long")}
            icon={Library}
            label="Trên 200 chương"
          />
        </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Thể loại */}
      <div className="relative z-10 flex flex-col gap-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
          Thể loại
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <FilterPill
            active={currentCategoryId === null}
            onClick={() => setCategory(null)}
            label="Tất cả"
          />
          {categories.map((cat) => (
            <FilterPill
              key={cat.id}
              active={currentCategoryId === cat.id}
              onClick={() => setCategory(cat.id)}
              label={cat.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const FilterButton = ({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ElementType;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 w-full group outline-none",
      active
        ? "bg-primary/10 text-primary"
        : "bg-transparent text-white/60 hover:bg-white/5 hover:text-white",
    )}
  >
    {/* Vòng tròn Radio giả lập */}
    <div
      className={cn(
        "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300",
        active
          ? "border-primary shadow-[0_0_10px_rgba(234,88,12,0.5)]"
          : "border-white/30 group-hover:border-white/50",
      )}
    >
      {active && (
        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_rgba(234,88,12,0.8)]" />
      )}
    </div>

    {Icon && (
      <Icon
        className={cn(
          "w-4 h-4 shrink-0 transition-all duration-300",
          active
            ? "text-primary drop-shadow-[0_0_5px_rgba(234,88,12,0.8)]"
            : "text-white/40 group-hover:text-white/70",
        )}
      />
    )}
    <span className="text-left flex-1 leading-tight">{label}</span>
  </button>
);

const FilterPill = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all duration-300 outline-none flex items-center justify-center min-w-[60px]",
      active
        ? "bg-gradient-to-br from-primary to-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)] ring-1 ring-primary/80 transform scale-105"
        : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.05)]",
    )}
  >
    {label}
  </button>
);
