"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoodleCard } from "@/components/features/noodle-card";
import { GENRES } from "@/lib/constants/genres";
import { PREFECTURES } from "@/lib/constants/prefectures";
import { StationSelect } from "@/components/ui/station-select";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/contexts/ThemeContext";

type SortOption = "newest" | "rating" | "visitDate";
const ITEMS_PER_PAGE = 10;

export default function NoodlesPage() {
  const { user, isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();
  const updateTimelineVisit = useMutation(api.users.updateTimelineVisit);

  // タイムライン訪問時刻を更新
  useEffect(() => {
    if (user?._id) {
      updateTimelineVisit({ userId: user._id });
    }
  }, [user?._id, updateTimelineVisit]);
  const [searchText, setSearchText] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | undefined>();
  const [maxRating, setMaxRating] = useState<number | undefined>();
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const [allItems, setAllItems] = useState<any[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  const noodlesData = useQuery(api.noodles.list, {
    genres: selectedGenres.length > 0 ? selectedGenres : undefined,
    searchText: searchText || undefined,
    sortBy,
    limit: ITEMS_PER_PAGE,
    offset,
    viewerId: user?._id,
    prefectures: selectedPrefectures.length > 0 ? selectedPrefectures : undefined,
    minRating,
    maxRating,
    dateFrom: dateFrom ? new Date(dateFrom).getTime() : undefined,
    dateTo: dateTo ? new Date(dateTo + "T23:59:59").getTime() : undefined,
    station: selectedStation || undefined,
  });

  // フィルター変更時にリセット
  useEffect(() => {
    setOffset(0);
    setAllItems([]);
  }, [searchText, selectedGenres, sortBy, selectedPrefectures, minRating, maxRating, dateFrom, dateTo, selectedStation]);

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
    estimateSize: (index) => {
      // 画像がある場合は高め、ない場合は低めに設定
      const item = allItems[index];
      if (!item) return 280;
      const hasImage = (item.imageUrls && item.imageUrls.length > 0) || item.imageUrl;
      return hasImage ? 320 : 180;
    },
    overscan: 5,
    getItemKey: (index) => allItems[index]?._id || index,
    measureElement:
      typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  // スクロールパフォーマンス最適化
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    // スムーズスクロールの無効化（パフォーマンス向上）
    scrollElement.style.scrollBehavior = "auto";

    // will-change プロパティでブラウザ最適化
    scrollElement.style.willChange = "scroll-position";

    return () => {
      scrollElement.style.scrollBehavior = "";
      scrollElement.style.willChange = "";
    };
  }, []);

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

  const togglePrefecture = (prefecture: string) => {
    setSelectedPrefectures((prev) =>
      prev.includes(prefecture) ? prev.filter((p) => p !== prefecture) : [...prev, prefecture]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSearchText("");
    setSortBy("newest");
    setSelectedPrefectures([]);
    setMinRating(undefined);
    setMaxRating(undefined);
    setDateFrom("");
    setDateTo("");
    setSelectedStation("");
  };

  const hasFilters =
    selectedGenres.length > 0 ||
    searchText ||
    sortBy !== "newest" ||
    selectedPrefectures.length > 0 ||
    minRating !== undefined ||
    maxRating !== undefined ||
    dateFrom ||
    dateTo ||
    selectedStation;

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

          {/* Prefectures */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              都道府県
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {PREFECTURES.map((pref) => (
                <button
                  key={pref.code}
                  type="button"
                  onClick={() => togglePrefecture(pref.code)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    selectedPrefectures.includes(pref.code)
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  style={selectedPrefectures.includes(pref.code) ? { backgroundColor: themeColor } : undefined}
                >
                  {pref.name}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              評価
            </label>
            <div className="flex items-center gap-2">
              <select
                value={minRating || ""}
                onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">最低評価</option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    ⭐ {rating}以上
                  </option>
                ))}
              </select>
              <span className="text-gray-400">〜</span>
              <select
                value={maxRating || ""}
                onChange={(e) => setMaxRating(e.target.value ? Number(e.target.value) : undefined)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">最高評価</option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    ⭐ {rating}以下
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              訪問日
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-400">〜</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Station */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最寄り駅
            </label>
            <StationSelect
              value={selectedStation}
              onChange={setSelectedStation}
              placeholder="駅名で検索"
            />
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
                    // パフォーマンス最適化
                    contain: "layout style paint",
                    contentVisibility: "auto",
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
