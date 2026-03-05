"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IconSearch, IconLoader2, IconTelescope } from "@tabler/icons-react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { getImageUrl } from "@/lib/utils";
import SearchSkeleton from "../skeletons/SearchSkeleton";

interface StorySearchResult {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
}

export function SearchMobile() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StorySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.stories || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const renderResults = () => {
    if (isLoading) return <SearchSkeleton />;

    if (results.length === 0) {
      return (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <IconTelescope className="w-7 h-7 text-primary/60" />
          </div>
          <p className="text-base font-semibold text-foreground">
            Không tìm thấy kết quả
          </p>
          <div className="text-sm font-medium text-muted-foreground mt-1.5 flex flex-col gap-1">
            <span>
              Rất tiếc, không có truyện nào khớp với &quot;{query}&quot;.
            </span>
            <span>Thử tìm với từ khóa khác hoặc tên tác giả xem sao.</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1 bg-background pt-2">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/50 mb-2">
          <span>KẾT QUẢ TÌM KIẾM</span>
          <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {results.length}
          </span>
        </div>
        <ul className="space-y-1">
          {results.map((story) => (
            <li key={story.id}>
              <Link
                href={`/truyen/${story.slug}`}
                className="flex items-center p-2 hover:bg-muted/60 rounded-xl transition-all duration-200 group active:scale-[0.98]"
                onClick={() => setIsMobileSearchOpen(false)}
              >
                <div className="relative w-11 h-16 shrink-0 overflow-hidden rounded-md bg-muted shadow-sm border border-border/50">
                  <Image
                    src={getImageUrl(story.coverUrl)}
                    alt={story.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="44px"
                  />
                </div>
                <div className="overflow-hidden ml-3.5 flex-1 flex flex-col justify-center">
                  <p className="font-heading font-bold text-sm truncate group-hover:text-primary transition-colors text-foreground">
                    {story.title}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground truncate mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                    {story.author || "Tác giả vô danh"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="pt-2 pb-1 mt-2 border-t border-border/40">
          <Link
            href={`/tim-kiem?q=${encodeURIComponent(query)}`}
            className="w-full flex items-center justify-center p-2 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
            onClick={() => setIsMobileSearchOpen(false)}
          >
            Xem tất cả kết quả cho &quot;{query}&quot; →
          </Link>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors pr-1"
          aria-label="Tìm kiếm"
        >
          <IconSearch className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="h-[85vh] rounded-b-[2rem] bg-background/95 backdrop-blur-2xl border-b border-primary/20 p-5 pt-8 shadow-2xl"
      >
        <SheetTitle className="sr-only">Tìm kiếm</SheetTitle>
        <div className="flex flex-col h-full max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6 relative">
            <div className="relative flex-1 group">
              <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input
                autoFocus
                type="search"
                placeholder="Tìm kiếm..."
                className="pl-11 pr-11 rounded-2xl bg-muted/50 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all h-14 w-full text-[16px] font-medium shadow-inner"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {isLoading && (
                <IconLoader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin" />
              )}
            </div>
            {query.length > 0 && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-[85px] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <span className="sr-only">Clear</span>
                <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-bold">
                  ×
                </div>
              </button>
            )}
            <Button
              variant="ghost"
              className="px-3 font-semibold text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileSearchOpen(false)}
            >
              Hủy
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">
            {query.length >= 2 ? (
              renderResults()
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <IconSearch className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-[15px] font-medium text-muted-foreground">
                  Nhập từ khóa hoặc tên tác giả để bắt đầu tìm kiếm
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
