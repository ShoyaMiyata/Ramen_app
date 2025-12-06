"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoodleCard } from "@/components/features/noodle-card";
import { GENRES } from "@/lib/constants/genres";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/contexts/ThemeContext";

type SortOption = "newest" | "rating" | "visitDate";
const ITEMS_PER_PAGE = 10;

export default function NoodlesPage() {
  const { user, isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();
  const [searchText, setSearchText] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);
  const [allItems, setAllItems] = useState<any[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  const noodlesData = useQuery(api.noodles.list, {
    genres: selectedGenres.length > 0 ? selectedGenres : undefined,
    searchText: searchText || undefined,
    sortBy,
    limit: ITEMS_PER_PAGE,
    offset,
  });

  // フィルター変更時にリセット
  useEffect(() => {
    setOffset(0);
    setAllItems([]);
  }, [searchText, selectedGenres, sortBy]);

  // データが来たら追加
  useEffect(() => {
    if (noodlesData?.items) {
      if (offset === 0) {
        setAllItems(noodlesData.items);
      } else {
        setAllItems((prev) => {
          const existingIds = new Set(prev.map((item) => item._id));
          const newItems = noodlesData.items.filter(
            (item) => !existingIds.has(item._id)
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [noodlesData, offset]);

  // 無限スクロール
  const handleLoadMore = useCallback(() => {
    if (noodlesData?.hasMore) {
      setOffset((prev) => prev + ITEMS_PER_PAGE);
    }
  }, [noodlesData?.hasMore]);

  // 仮想スクロール設定
  const virtualizer = useVirtualizer({
    count: allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280, // NoodleCardの概算高さ
    overscan: 5,
    getItemKey: (index) => allItems[index]?._id || index,
  });

  // 最後のアイテムが表示されたら次を読み込む
  useEffect(() => {
    const lastItem = virtualizer.getVirtualItems().at(-1);
    if (!lastItem || !noodlesData?.hasMore) return;

    if (lastItem.index >= allItems.length - 3) {
      handleLoadMore();
    }
  }, [virtualizer.getVirtualItems(), allItems.length, handleLoadMore, noodlesData?.hasMore]);

  if (!isLoaded) {
    return <LoadingPage />;
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSearchText("");
    setSortBy("newest");
  };

  const hasFilters =
    selectedGenres.length > 0 || searchText || sortBy !== "newest";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl text-gray-900">みんなの一杯</h1>
        <Link href="/noodles/new">
          <Button size="icon" style={{ backgroundColor: themeColor }}>
            <Plus className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="店名・メニュー名で検索"
          className="pl-9 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={showFilters ? { color: themeColor } : undefined}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              並び替え
            </label>
            <div className="flex gap-2">
              {[
                { value: "newest" as const, label: "新着順" },
                { value: "rating" as const, label: "評価順" },
                { value: "visitDate" as const, label: "訪問日順" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    sortBy === option.value
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  style={sortBy === option.value ? { backgroundColor: themeColor } : undefined}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ジャンル
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre.code}
                  type="button"
                  onClick={() => toggleGenre(genre.code)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    selectedGenres.includes(genre.code)
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  style={selectedGenres.includes(genre.code) ? { backgroundColor: themeColor } : undefined}
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              フィルタをクリア
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {noodlesData === undefined && allItems.length === 0 ? (
        <Loading className="py-8" />
      ) : allItems.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">
            {hasFilters
              ? "条件に一致する投稿がありません"
              : "まだ投稿がありません"}
          </p>
        </div>
      ) : (
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height: "calc(100vh - 260px)", contain: "strict" }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const noodle = allItems[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                    paddingBottom: "12px",
                  }}
                >
                  <NoodleCard noodle={noodle} currentUserId={user?._id} />
                </div>
              );
            })}
          </div>

          {/* Load More Indicator */}
          {noodlesData?.hasMore && (
            <div className="py-4 text-center">
              <Loading size="sm" />
            </div>
          )}

          {/* Total Count */}
          {noodlesData?.totalCount !== undefined && (
            <p className="text-xs text-gray-400 text-center pb-2">
              全{noodlesData.totalCount}件中 {allItems.length}件表示
            </p>
          )}
        </div>
      )}
    </div>
  );
}
