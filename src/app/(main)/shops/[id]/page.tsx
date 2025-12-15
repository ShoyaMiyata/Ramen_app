"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { NoodleCard } from "@/components/features/noodle-card";
import { StarRating } from "@/components/ui/star-rating";
import { ArrowLeft, MapPin, Train, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type SortOption = "newest" | "rating" | "likes";

export default function ShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const shopId = id as Id<"shops">;

  const router = useRouter();
  const searchParams = useSearchParams();

  // どこから来たかを判定
  const from = searchParams.get("from");
  const noodleId = searchParams.get("noodleId");
  const { user: currentUser, isLoaded } = useCurrentUser();
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterRating, setFilterRating] = useState<number | undefined>(undefined);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const shopData = useQuery(api.shops.getById, {
    shopId,
    viewerId: currentUser?._id,
  });

  const noodlesData = useQuery(api.noodles.getByShop, {
    shopId,
    limit: LIMIT,
    offset,
    sortBy,
    filterRating,
    viewerId: currentUser?._id,
  });

  // 既読データを保持
  type NoodleItem = NonNullable<typeof noodlesData>["items"][number];
  const [allLoadedNoodles, setAllLoadedNoodles] = useState<NoodleItem[]>([]);

  useEffect(() => {
    if (noodlesData?.items) {
      setAllLoadedNoodles((prev) => {
        const existingIds = new Set(prev.map((n) => n._id));
        const newItems = noodlesData.items.filter((n) => !existingIds.has(n._id));
        return [...prev, ...newItems];
      });
    }
  }, [noodlesData]);

  useEffect(() => {
    if (offset === 0) {
      setAllLoadedNoodles([]);
    }
  }, [offset]);

  const loadMore = () => {
    if (noodlesData?.hasMore) {
      setOffset((prev) => prev + LIMIT);
    }
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setOffset(0);
    setAllLoadedNoodles([]);
    setShowSortMenu(false);
  };

  const handleFilterChange = (rating: number | undefined) => {
    setFilterRating(rating);
    setOffset(0);
    setAllLoadedNoodles([]);
    setShowFilterMenu(false);
  };

  if (!isLoaded || shopData === undefined) {
    return <LoadingPage />;
  }

  if (!shopData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">店舗が見つかりません</p>
        <Button onClick={() => router.back()} className="mt-4">
          戻る
        </Button>
      </div>
    );
  }

  const sortLabels: Record<SortOption, string> = {
    newest: "新しい順",
    rating: "評価の高い順",
    likes: "いいね順",
  };

  const handleBack = () => {
    if (from === "noodle" && noodleId) {
      // 投稿詳細ページから来た場合 - replace を使って履歴を置き換え
      router.replace(`/noodles/${noodleId}`);
    } else if (from === "search") {
      // 検索ページから来た場合 - replace を使って履歴を置き換え
      router.replace("/search?tab=shops");
    } else {
      // その他の場合はブラウザバック
      router.back();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">店舗詳細</h1>
      </div>

      {/* Shop Info Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{shopData.name}</h2>

        {/* Address & Prefecture */}
        {(shopData.address || shopData.prefecture) && (
          <div className="flex items-start gap-2 mb-2 text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              {shopData.prefecture && <p>{shopData.prefecture}</p>}
              {shopData.address && <p>{shopData.address}</p>}
            </div>
          </div>
        )}

        {/* Station */}
        {shopData.station && (
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <Train className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{shopData.station}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {shopData.stats.totalPosts}
            </p>
            <p className="text-xs text-gray-500">投稿数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {shopData.stats.visitorCount}
            </p>
            <p className="text-xs text-gray-500">訪問者数</p>
          </div>
          <div className="text-center">
            <div className="flex flex-col items-center gap-1">
              <p className="text-2xl font-bold text-gray-900">
                {shopData.stats.avgRating > 0
                  ? shopData.stats.avgRating.toFixed(1)
                  : "-"}
              </p>
              <StarRating
                value={Math.round(shopData.stats.avgRating)}
                readonly
                size="sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">平均評価</p>
          </div>
        </div>

        {/* Rating Distribution */}
        {shopData.stats.totalPosts > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              評価分布
            </h3>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  shopData.stats.ratingDistribution[
                    rating as keyof typeof shopData.stats.ratingDistribution
                  ];
                const percentage =
                  shopData.stats.totalPosts > 0
                    ? (count / shopData.stats.totalPosts) * 100
                    : 0;

                return (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-xs text-gray-600">{rating}</span>
                      <span className="text-yellow-500 text-xs">★</span>
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Posts Section */}
      <div>
        {/* Controls */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">投稿一覧</h2>
          <div className="flex gap-2">
            {/* Sort Button */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="gap-1.5"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortLabels[sortBy]}
              </Button>
              {showSortMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {(["newest", "rating", "likes"] as SortOption[]).map(
                    (option) => (
                      <button
                        key={option}
                        onClick={() => handleSortChange(option)}
                        className={cn(
                          "w-full px-4 py-2 text-sm text-left hover:bg-gray-50",
                          sortBy === option && "text-orange-500 font-medium"
                        )}
                      >
                        {sortLabels[option]}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={cn(
                  "gap-1.5",
                  filterRating && "text-orange-500 border-orange-500"
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                フィルター
              </Button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => handleFilterChange(undefined)}
                    className={cn(
                      "w-full px-4 py-2 text-sm text-left hover:bg-gray-50",
                      !filterRating && "text-orange-500 font-medium"
                    )}
                  >
                    すべて表示
                  </button>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange(rating)}
                      className={cn(
                        "w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2",
                        filterRating === rating &&
                          "text-orange-500 font-medium"
                      )}
                    >
                      <span>{rating}★ 以上</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts List */}
        {noodlesData === undefined ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-400">読み込み中...</p>
          </div>
        ) : allLoadedNoodles.length > 0 ? (
          <>
            <div className="space-y-3">
              {allLoadedNoodles.map((noodle) => (
                <NoodleCard
                  key={noodle._id}
                  noodle={noodle}
                  currentUserId={currentUser?._id}
                />
              ))}
            </div>
            {noodlesData?.hasMore && (
              <div className="text-center pt-4">
                <Button variant="outline" onClick={loadMore} className="w-full">
                  もっと見る ({noodlesData.totalCount - allLoadedNoodles.length}
                  件)
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">
              {filterRating
                ? `${filterRating}★ 以上の投稿はありません`
                : "投稿がありません"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
