"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { api } from "../../../../convex/_generated/api";
import { useViewingUser } from "@/hooks/useViewingUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoodleCard } from "@/components/features/noodle-card";
import { PREFECTURES } from "@/lib/constants/prefectures";
import { StationSelect } from "@/components/ui/station-select";
import { Plus, Search, SlidersHorizontal, X, LayoutGrid, List, RefreshCw, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/contexts/ThemeContext";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

type SortOption = "newest" | "rating" | "visitDate";
type ViewMode = "list" | "gallery";
const ITEMS_PER_PAGE = 10;

export default function NoodlesPage() {
  const { user, realUser, isLoaded } = useViewingUser();
  const { themeColor } = useTheme();
  const updateTimelineVisit = useMutation(api.users.updateTimelineVisit);

  // スクロール位置の復元
  useScrollRestoration();

  // タイムライン訪問時刻を更新（実際のユーザーで）
  useEffect(() => {
    if (realUser?._id) {
      updateTimelineVisit({ userId: realUser._id });
    }
  }, [realUser?._id, updateTimelineVisit]);
  const [searchText, setSearchText] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | undefined>();
  const [maxRating, setMaxRating] = useState<number | undefined>();
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const [allItems, setAllItems] = useState<any[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  // プルダウンでリフレッシュ用
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartY = useRef<number>(0);

  const availableGenres = useQuery(api.genres.list);
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
      console.log("🔍 Noodles data received:", noodlesData.items.slice(0, 2).map(item => ({
        _id: item._id,
        ramenName: item.ramenName,
        imageUrl: item.imageUrl,
        r2ImageUrl: item.r2ImageUrl,
        imageId: item.imageId
      })));

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

  // ギャラリービュー用のスクロール監視
  useEffect(() => {
    if (viewMode !== "gallery") return;
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      if (scrollHeight - scrollTop - clientHeight < 500 && noodlesData?.hasMore) {
        handleLoadMore();
      }
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [viewMode, noodlesData?.hasMore, handleLoadMore]);

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

  // プルダウンでリフレッシュ
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setOffset(0);
    setAllItems([]);

    // アニメーション用に少し待つ
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsRefreshing(false);
    setPullDistance(0);
  }, []);

  // タッチイベント処理
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (scrollElement.scrollTop === 0) {
        pullStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (scrollElement.scrollTop === 0 && pullStartY.current > 0) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - pullStartY.current;

        if (distance > 0) {
          setIsPulling(true);
          setPullDistance(Math.min(distance, 100));

          // 引っ張りすぎを防ぐ
          if (distance > 80) {
            e.preventDefault();
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (isPulling) {
        if (pullDistance > 60) {
          handleRefresh();
        } else {
          setPullDistance(0);
        }
        setIsPulling(false);
        pullStartY.current = 0;
      }
    };

    scrollElement.addEventListener("touchstart", handleTouchStart);
    scrollElement.addEventListener("touchmove", handleTouchMove, { passive: false });
    scrollElement.addEventListener("touchend", handleTouchEnd);

    return () => {
      scrollElement.removeEventListener("touchstart", handleTouchStart);
      scrollElement.removeEventListener("touchmove", handleTouchMove);
      scrollElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPulling, pullDistance, handleRefresh]);

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
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "list" ? "bg-white shadow-sm" : "text-gray-400"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("gallery")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "gallery" ? "bg-white shadow-sm" : "text-gray-400"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Link href="/noodles/new">
            <Button size="icon" style={{ backgroundColor: themeColor }}>
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>
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
              {!availableGenres ? (
                <Loading size="sm" />
              ) : (
                availableGenres.map((genre) => (
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
                ))
              )}
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
          <p className="text-gray-400">
            {hasFilters
              ? "条件に一致する投稿がありません"
              : "まだ投稿がありません"}
          </p>
        </div>
      ) : viewMode === "gallery" ? (
        /* Gallery View */
        <div
          ref={parentRef}
          data-scroll-container="true"
          className="overflow-auto relative"
          style={{ height: "calc(100vh - 260px)" }}
        >
          {/* Pull to Refresh Indicator */}
          {(isPulling || isRefreshing) && (
            <div
              className="flex items-center justify-center py-4 transition-all duration-200 sticky top-0 bg-gray-50 z-10"
              style={{
                opacity: isPulling ? pullDistance / 60 : 1,
              }}
            >
              <RefreshCw
                className={cn(
                  "w-5 h-5 transition-transform",
                  isRefreshing && "animate-spin"
                )}
                style={{
                  color: themeColor,
                  transform: `rotate(${isPulling && !isRefreshing ? pullDistance * 3.6 : 0}deg)`,
                }}
              />
              <span className="ml-2 text-sm" style={{ color: themeColor }}>
                {isRefreshing ? "更新中..." : pullDistance > 60 ? "離して更新" : "引っ張って更新"}
              </span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-1">
            {allItems
              .filter((noodle) => noodle.imageUrls && noodle.imageUrls.length > 0)
              .map((noodle) => (
                <Link
                  key={noodle._id}
                  href={`/noodles/${noodle._id}`}
                  className="aspect-square relative overflow-hidden bg-gray-100 group"
                >
                  <Image
                    src={noodle.imageUrls[0]}
                    alt={noodle.ramenName}
                    fill
                    sizes="33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-1 text-white font-semibold text-sm">
                      <Heart className="w-4 h-4 fill-white" />
                      <span>{noodle.likeCount ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white font-semibold text-sm">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>{noodle.commentCount ?? 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>

          {/* Load More Indicator */}
          {noodlesData?.hasMore && (
            <div className="py-4 text-center">
              <Loading size="sm" />
            </div>
          )}

          {/* Total Count */}
          {noodlesData?.totalCount !== undefined && (
            <p className="text-xs text-gray-400 text-center pb-2 pt-2">
              全{noodlesData.totalCount}件中 {allItems.length}件表示
            </p>
          )}
        </div>
      ) : (
        /* List View */
        <div
          ref={parentRef}
          data-scroll-container="true"
          className="overflow-auto relative -mx-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
          style={{ height: "calc(100vh - 260px)" }}
        >
          {/* Pull to Refresh Indicator */}
          {(isPulling || isRefreshing) && (
            <div
              className="flex items-center justify-center py-4 transition-all duration-200 sticky top-0 bg-gray-50 z-10"
              style={{
                opacity: isPulling ? pullDistance / 60 : 1,
              }}
            >
              <RefreshCw
                className={cn(
                  "w-5 h-5 transition-transform",
                  isRefreshing && "animate-spin"
                )}
                style={{
                  color: themeColor,
                  transform: `rotate(${isPulling && !isRefreshing ? pullDistance * 3.6 : 0}deg)`,
                }}
              />
              <span className="ml-2 text-sm" style={{ color: themeColor }}>
                {isRefreshing ? "更新中..." : pullDistance > 60 ? "離して更新" : "引っ張って更新"}
              </span>
            </div>
          )}
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
                    contain: "layout style",
                  }}
                >
                  <NoodleCard noodle={noodle} currentUserId={user?._id} />
                  <div className="h-2" />
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
