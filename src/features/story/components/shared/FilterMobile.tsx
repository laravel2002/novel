"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Status } from "@/generated/prisma/client";
import { useCallback, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
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

interface FilterMobileProps {
  categories: { id: number; name: string; slug: string }[];
}

export default function FilterMobile({ categories }: FilterMobileProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Lấy state hiện tại từ URL làm default
  const urlStatus = searchParams.get("status") as Status | null;
  const urlCategoryId = searchParams.get("categoryId")
    ? parseInt(searchParams.get("categoryId")!)
    : null;
  const urlChapterLength = searchParams.get("chapterLength") as string | null;
  const urlSortBy = searchParams.get("sortBy") || "updatedAt";

  // State tạm thời trong lúc đang mở Drawer (Local State)
  const [draftStatus, setDraftStatus] = useState<Status | null>(urlStatus);
  const [draftCategoryId, setDraftCategoryId] = useState<number | null>(
    urlCategoryId,
  );
  const [draftChapterLength, setDraftChapterLength] = useState<string | null>(
    urlChapterLength,
  );
  const [draftSortBy, setDraftSortBy] = useState<string>(urlSortBy);

  // Reset Draft về giống URL mỗi khi Drawer mở ra
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraftStatus(urlStatus);
      setDraftCategoryId(urlCategoryId);
      setDraftChapterLength(urlChapterLength);
      setDraftSortBy(urlSortBy);
    }
    setIsOpen(open);
  };

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

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (draftStatus && draftStatus !== ("ALL" as any))
      params.set("status", draftStatus);
    else params.delete("status");

    if (draftSortBy) params.set("sortBy", draftSortBy);
    else params.delete("sortBy");

    if (draftChapterLength && draftChapterLength !== "ALL")
      params.set("chapterLength", draftChapterLength);
    else params.delete("chapterLength");

    if (draftCategoryId) params.set("categoryId", draftCategoryId.toString());
    else params.delete("categoryId");

    params.delete("page"); // Reset page on filter change

    router.push(pathname + "?" + params.toString(), { scroll: false });
    setIsOpen(false);
  };

  const clearFilters = () => {
    setDraftStatus(null);
    setDraftCategoryId(null);
    setDraftChapterLength(null);
    setDraftSortBy("updatedAt");
  };

  // Nút hiển thị số lượng bộ lọc đang actived trên URL để user biết
  let activeFilterCount = 0;
  if (urlStatus) activeFilterCount++;
  if (urlCategoryId) activeFilterCount++;
  if (urlChapterLength && urlChapterLength !== "ALL") activeFilterCount++;
  if (urlSortBy && urlSortBy !== "updatedAt") activeFilterCount++;

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2.5 rounded-2xl font-bold tracking-wide active:scale-95 transition-transform border border-primary/20 shadow-sm">
          <Filter className="w-5 h-5" />
          <span>Bộ Lọc</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1">
              {activeFilterCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[90dvh] h-[90dvh] rounded-t-3xl bg-background/95 backdrop-blur-3xl border-t border-primary/30 p-0 shadow-2xl flex flex-col focus-visible:outline-none"
      >
        <SheetTitle className="sr-only">Bộ Lọc Thể Loại</SheetTitle>

        {/* Header Drawer */}
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between shrink-0 bg-background/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/30">
              <Filter className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-heading font-black tracking-tight text-foreground">
              Tùy Chỉnh
            </h2>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors py-2 px-3 rounded-lg active:bg-muted"
          >
            Xóa Lọc
          </button>
        </div>

        {/* Body Drawer (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-8">
          {/* Sắp xếp */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              Sắp xếp theo
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <FilterButton
                active={draftSortBy === "updatedAt"}
                onClick={() => setDraftSortBy("updatedAt")}
                icon={Sparkles}
                label="Cập nhật"
              />
              <FilterButton
                active={draftSortBy === "views"}
                onClick={() => setDraftSortBy("views")}
                icon={Flame}
                label="Lượt xem"
              />
              <FilterButton
                active={draftSortBy === "rating"}
                onClick={() => setDraftSortBy("rating")}
                icon={Star}
                label="Đánh giá"
              />
              <FilterButton
                active={draftSortBy === "newest"}
                onClick={() => setDraftSortBy("newest")}
                icon={Clock}
                label="Mới đăng"
              />
            </div>
          </div>

          <div className="w-full h-px bg-border/50" />

          {/* Tình trạng */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              Tình trạng
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <FilterButton
                active={!draftStatus}
                onClick={() => setDraftStatus(null)}
                icon={Layers}
                label="Tất cả"
              />
              <FilterButton
                active={draftStatus === "ONGOING"}
                onClick={() => setDraftStatus("ONGOING")}
                icon={Loader2}
                label="Đang ra"
              />
              <FilterButton
                active={draftStatus === "COMPLETED"}
                onClick={() => setDraftStatus("COMPLETED")}
                icon={CheckCircle}
                label="Hoàn thành"
              />
            </div>
          </div>

          <div className="w-full h-px bg-border/50" />

          {/* Số chương */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              Số chương
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <FilterButton
                active={!draftChapterLength || draftChapterLength === "ALL"}
                onClick={() => setDraftChapterLength(null)}
                icon={Layers}
                label="Tất cả"
              />
              <FilterButton
                active={draftChapterLength === "short"}
                onClick={() => setDraftChapterLength("short")}
                icon={BookOpen}
                label="< 50"
              />
              <FilterButton
                active={draftChapterLength === "medium"}
                onClick={() => setDraftChapterLength("medium")}
                icon={BookMarked}
                label="50 - 200"
              />
              <FilterButton
                active={draftChapterLength === "long"}
                onClick={() => setDraftChapterLength("long")}
                icon={Library}
                label="> 200"
              />
            </div>
          </div>

          <div className="w-full h-px bg-border/50" />

          {/* Thể loại */}
          <div className="flex flex-col gap-3 pb-safe">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              Thể loại
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <FilterPill
                active={draftCategoryId === null}
                onClick={() => setDraftCategoryId(null)}
                label="Tất cả"
              />
              {categories.map((cat) => (
                <FilterPill
                  key={cat.id}
                  active={draftCategoryId === cat.id}
                  onClick={() => setDraftCategoryId(cat.id)}
                  label={cat.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer sticky filter button */}
        <div className="p-4 pb-safe border-t border-border/50 bg-background/80 backdrop-blur-xl shrink-0 mt-auto">
          <button
            onClick={applyFilters}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            Áp Dụng Tùy Chọn
          </button>
        </div>
      </SheetContent>
    </Sheet>
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
      "flex items-center justify-center sm:justify-start gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 w-full outline-none",
      active
        ? "bg-primary/10 text-primary border border-primary/30"
        : "bg-muted border border-transparent text-muted-foreground hover:bg-muted/80",
    )}
  >
    {Icon && (
      <Icon
        className={cn(
          "w-4 h-4 shrink-0 transition-all duration-300",
          active ? "text-primary" : "text-muted-foreground",
        )}
      />
    )}
    <span className="leading-tight">{label}</span>
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
      "px-4 py-2 rounded-full text-[12px] font-bold tracking-wide transition-all duration-300 outline-none flex items-center justify-center",
      active
        ? "bg-gradient-to-br from-primary to-orange-600 text-white shadow-md ring-1 ring-primary/80"
        : "bg-muted text-muted-foreground hover:text-foreground ring-1 ring-border/50",
    )}
  >
    {label}
  </button>
);
