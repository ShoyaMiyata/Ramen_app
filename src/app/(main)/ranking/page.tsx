"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { getRankByShopCount } from "@/lib/constants/ranks";
import { RankIcon } from "@/components/features/rank-icon";
import { Trophy, Store, FileText, Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import * as Tabs from "@radix-ui/react-tabs";

type Period = "weekly" | "monthly" | "all";
type RankingType = "shops" | "posts" | "popular";

export default function RankingPage() {
  const { isLoaded } = useCurrentUser();
  const [period, setPeriod] = useState<Period>("all");
  const [rankingType, setRankingType] = useState<RankingType>("shops");

  const shopRanking = useQuery(api.ranking.getShopVisits, { period, limit: 50 });
  const postRanking = useQuery(api.ranking.getPostCounts, { period, limit: 50 });
  const popularRanking = useQuery(api.ranking.getPopularUsers, {
    period,
    limit: 50,
  });

  if (!isLoaded) {
    return <LoadingPage />;
  }

  const currentRanking =
    rankingType === "shops"
      ? shopRanking
      : rankingType === "posts"
        ? postRanking
        : popularRanking;

  const getCount = (item: any) => {
    if (rankingType === "shops") return item.shopCount;
    if (rankingType === "posts") return item.postCount;
    return item.likeCount;
  };

  const getCountLabel = () => {
    if (rankingType === "shops") return "店舗制覇";
    if (rankingType === "posts") return "杯";
    return "いいね";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-orange-500" />
        <h1 className="font-bold text-xl text-gray-900">ランキング</h1>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {[
          { value: "weekly" as const, label: "週間" },
          { value: "monthly" as const, label: "月間" },
          { value: "all" as const, label: "総合" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setPeriod(option.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              period === option.value
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Ranking Type Tabs */}
      <Tabs.Root
        value={rankingType}
        onValueChange={(v) => setRankingType(v as RankingType)}
      >
        <Tabs.List className="flex bg-gray-100 rounded-lg p-1">
          <Tabs.Trigger
            value="shops"
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              rankingType === "shops"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            )}
          >
            <Store className="w-4 h-4" />
            店舗数
          </Tabs.Trigger>
          <Tabs.Trigger
            value="posts"
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              rankingType === "posts"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            )}
          >
            <FileText className="w-4 h-4" />
            杯数
          </Tabs.Trigger>
          <Tabs.Trigger
            value="popular"
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              rankingType === "popular"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            )}
          >
            <Heart className="w-4 h-4" />
            人気
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      {/* Ranking List */}
      {currentRanking === undefined ? (
        <Loading className="py-8" />
      ) : currentRanking.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">まだランキングデータがありません</p>
          <p className="text-sm text-gray-400 mt-1">一杯を記録してランクインしよう</p>
        </div>
      ) : (
        <div className="space-y-2">
          {currentRanking.map((item, index) => {
            const shopCount = "shopCount" in item ? item.shopCount : 0;
            const rank = rankingType === "shops"
              ? getRankByShopCount(shopCount)
              : getRankByShopCount(0);

            return (
              <div
                key={item.user?._id || index}
                className={cn(
                  "bg-white rounded-xl p-4 flex items-center gap-4",
                  index < 3 && "ring-2",
                  index === 0 && "ring-yellow-400",
                  index === 1 && "ring-gray-300",
                  index === 2 && "ring-amber-600"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                    index === 0 && "bg-yellow-400 text-white",
                    index === 1 && "bg-gray-300 text-gray-700",
                    index === 2 && "bg-amber-600 text-white",
                    index >= 3 && "bg-gray-100 text-gray-500"
                  )}
                >
                  {item.rank}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item.user?.imageUrl && (
                      <img
                        src={item.user.imageUrl}
                        alt={item.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.user?.name || "ユーザー"}
                      </p>
                      {rankingType === "shops" && (
                        <div className="flex items-center gap-1">
                          <RankIcon rank={rank} size="sm" animate={false} />
                          <span
                            className="text-xs font-medium"
                            style={{ color: rank.color }}
                          >
                            {rank.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-900">{getCount(item)}</p>
                  <p className="text-xs text-gray-400">{getCountLabel()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
