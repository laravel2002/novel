"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
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

export function SearchDesktop() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StorySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (response.ok) {
        const data = await response.json();
        const searchResults = data.stories || [];
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      <div className="space-y-1 bg-background">
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
                onClick={() => setIsOpen(false)}
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
            onClick={() => setIsOpen(false)}
          >
            Xem tất cả kết quả cho &quot;{query}&quot; →
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative w-full max-w-[200px] sm:max-w-[260px] md:max-w-[320px]"
      ref={searchRef}
    >
      <div className="relative group">
        <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Tìm kiếm truyện, tác giả..."
          className="pl-10 pr-10 rounded-full bg-muted/40 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all h-10 w-full text-sm font-medium shadow-none hover:bg-muted/60"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
        />
        {isLoading && (
          <IconLoader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[420px] max-h-[70vh] overflow-y-auto z-50 glass-panel border border-primary/20 rounded-2xl shadow-2xl p-2 transform origin-top animate-in fade-in zoom-in-95 duration-200">
          {renderResults()}
        </div>
      )}
    </div>
  );
}
