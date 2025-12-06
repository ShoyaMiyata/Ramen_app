"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { getRankByShopCount } from "@/lib/constants/ranks";
import { RankIcon } from "@/components/features/rank-icon";
import { Trophy, Store, FileText, Heart, Soup } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/contexts/ThemeContext";
import * as Tabs from "@radix-ui/react-tabs";

type Period = "weekly" | "monthly" | "all";
type RankingType = "shops" | "posts" | "popularPosts" | "popularUsers";

export default function RankingPage() {
  const { isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();
  const [period, setPeriod] = useState<Period>("all");
  const [rankingType, setRankingType] = useState<RankingType>("shops");

  const shopRanking = useQuery(api.ranking.getShopVisits, { period, limit: 50 });
  const postRanking = useQuery(api.ranking.getPostCounts, { period, limit: 50 });
  const popularPostsRanking = useQuery(api.ranking.getPopularPosts, {
    period,
    limit: 50,
  });
  const popularUsersRanking = useQuery(api.ranking.getPopularUsers, {
    period,
    limit: 50,
  });

  if (!isLoaded) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5" style={{ color: themeColor }} />
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
                ? "text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            style={period === option.value ? { backgroundColor: themeColor } : undefined}
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
        <Tabs.List className="grid grid-cols-4 bg-gray-100 rounded-lg p-1 gap-1">
          <Tabs.Trigger
            value="shops"
            className={cn(
              "flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-colors",
              rankingType === "shops"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            )}
          >
            <Store className="w-3.5 h-3.5" />
            店舗
          </Tabs.Trigger>
          <Tabs.Trigger
            value="posts"
            className={cn(
              "flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-colors",
              rankingType === "posts"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            杯数
          </Tabs.Trigger>
          <Tabs.Trigger
            value="popularPosts"
            className={cn(
              "flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-colors",
              rankingType === "popularPosts"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            )}
          >
            <Soup className="w-3.5 h-3.5" />
            人気杯
          </Tabs.Trigger>
          <Tabs.Trigger
            value="popularUsers"
            className={cn(
              "flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-colors",
              rankingType === "popularUsers"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            )}
          >
            <Heart className="w-3.5 h-3.5" />
            人気者
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      {/* Ranking Content */}
      {rankingType === "shops" && (
        <UserRankingList
          ranking={shopRanking}
          valueKey="shopCount"
          label="店舗制覇"
          showRank
        />
      )}
      {rankingType === "posts" && (
        <UserRankingList
          ranking={postRanking}
          valueKey="postCount"
          label="杯"
        />
      )}
      {rankingType === "popularPosts" && (
        <PostRankingList ranking={popularPostsRanking} />
      )}
      {rankingType === "popularUsers" && (
        <UserRankingList
          ranking={popularUsersRanking}
          valueKey="likeCount"
          label="いいね"
        />
      )}
    </div>
  );
}

interface UserRankingListProps {
  ranking: any[] | undefined;
  valueKey: string;
  label: string;
  showRank?: boolean;
}

function UserRankingList({ ranking, valueKey, label, showRank }: UserRankingListProps) {
  if (ranking === undefined) {
    return <Loading className="py-8" />;
  }

  if (ranking.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500">まだランキングデータがありません</p>
        <p className="text-sm text-gray-400 mt-1">一杯を記録してランクインしよう</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ranking.map((item, index) => {
        const shopCount = "shopCount" in item ? item.shopCount : 0;
        const rank = showRank ? getRankByShopCount(shopCount) : null;

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
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0",
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
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {item.user?.name || "ユーザー"}
                  </p>
                  {showRank && rank && (
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

            <div className="text-right flex-shrink-0">
              <p className="font-bold text-gray-900">{item[valueKey]}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface PostRankingListProps {
  ranking: any[] | undefined;
}

function PostRankingList({ ranking }: PostRankingListProps) {
  if (ranking === undefined) {
    return <Loading className="py-8" />;
  }

  if (ranking.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500">まだいいねされた投稿がありません</p>
        <p className="text-sm text-gray-400 mt-1">みんなの一杯にいいねしてみよう</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ranking.map((item, index) => (
        <Link
          key={item.noodle?._id || index}
          href={`/noodles/${item.noodle?._id}`}
          className={cn(
            "bg-white rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors",
            index < 3 && "ring-2",
            index === 0 && "ring-yellow-400",
            index === 1 && "ring-gray-300",
            index === 2 && "ring-amber-600"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
              index === 0 && "bg-yellow-400 text-white",
              index === 1 && "bg-gray-300 text-gray-700",
              index === 2 && "bg-amber-600 text-white",
              index >= 3 && "bg-gray-100 text-gray-500"
            )}
          >
            {item.rank}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {item.shop?.name || "不明な店舗"}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {item.noodle?.ramenName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {item.user?.imageUrl && (
                <img
                  src={item.user.imageUrl}
                  alt={item.user.name}
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span className="text-xs text-gray-400">
                {item.user?.name || "ユーザー"}
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 text-red-500">
              <Heart className="w-4 h-4 fill-current" />
              <span className="font-bold">{item.likeCount}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
