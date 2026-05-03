"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { getRankByShopCount } from "@/lib/constants/ranks";
import { RankIcon } from "@/components/features/rank-icon";
import { Trophy, Store, FileText, Heart, Soup, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/contexts/ThemeContext";
import * as Tabs from "@radix-ui/react-tabs";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

type Period = "weekly" | "monthly" | "all";
type RankingType = "shops" | "posts" | "popularPosts" | "popularUsers";

export default function RankingPage() {
  useScrollRestoration();
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
            <Sparkles className="w-3.5 h-3.5" />
            人気者
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

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
          isMenfluencer
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
  isMenfluencer?: boolean;
}

function UserPodium({
  top3,
  valueKey,
  label,
  showRank,
  isMenfluencer,
}: {
  top3: any[];
  valueKey: string;
  label: string;
  showRank?: boolean;
  isMenfluencer?: boolean;
}) {
  const maxVal = top3[0]?.[valueKey] || 1;
  const calcHeight = (val: number) => {
    const minH = 60;
    const maxH = 180;
    const ratio = maxVal > 0 ? val / maxVal : 0;
    return Math.max(minH, Math.round(ratio * maxH));
  };

  const rankColor = (rank: number) => {
    if (rank === 1) return "#FFD700";
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32";
    return "#C0C0C0";
  };

  const podiumConfig = [
    { index: 1, order: "order-1" },
    { index: 0, order: "order-2" },
    { index: 2, order: "order-3" },
  ];

  return (
    <div className="bg-white rounded-xl p-6 pb-0 mb-4">
      <div className="flex items-end justify-center gap-3">
        {podiumConfig.map((config) => {
          const item = top3[config.index];
          if (!item) return null;

          const val = item[valueKey] || 0;
          const height = calcHeight(val);
          const shopCount = "shopCount" in item ? item.shopCount : 0;
          const rank = showRank ? getRankByShopCount(shopCount) : null;
          const color = rankColor(item.rank);
          const isTop = item.rank === 1;

          return (
            <Link
              key={item.user?._id || config.index}
              href={`/users/${item.user?._id}`}
              className={cn("flex flex-col items-center flex-1 max-w-[130px]", config.order)}
            >
              <div className="relative mb-1">
                {item.user?.imageUrl ? (
                  <img
                    src={item.user.imageUrl}
                    alt={item.user.name}
                    className={cn(
                      "rounded-full border-3 object-cover",
                      isTop ? "w-16 h-16" : "w-12 h-12"
                    )}
                    style={{ borderColor: color }}
                  />
                ) : (
                  <div
                    className={cn(
                      "rounded-full flex items-center justify-center text-white font-bold",
                      isTop ? "w-16 h-16 text-xl" : "w-12 h-12 text-base"
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {item.rank}
                  </div>
                )}
                {item.rank === 1 && (
                  <Crown
                    className="w-6 h-6 text-yellow-500 absolute -top-4 left-1/2 -translate-x-1/2"
                    fill="#FFD700"
                  />
                )}
              </div>

              <p className="text-xs font-medium text-gray-900 truncate w-full text-center">
                {item.user?.name || "ユーザー"}
              </p>

              {isMenfluencer && item.rank === 1 ? (
                <div className="flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span className="text-[10px] font-medium text-purple-500">麺バサダー</span>
                </div>
              ) : isMenfluencer && item.rank >= 2 && item.rank <= 5 ? (
                <div className="flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  <span className="text-[10px] font-medium text-pink-400">麺フルエンサー</span>
                </div>
              ) : showRank && rank ? (
                <div className="flex items-center gap-0.5">
                  <RankIcon rank={rank} size="sm" animate={false} />
                  <span className="text-[10px] font-medium" style={{ color: rank.color }}>
                    {rank.name}
                  </span>
                </div>
              ) : (
                <div className="h-4" />
              )}

              <p className="text-sm font-bold text-gray-900">{val}</p>
              <p className="text-[10px] text-gray-400 mb-2">{label}</p>

              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{ backgroundColor: color, height: `${height}px` }}
              >
                <div className="flex items-center justify-center pt-3">
                  <span className="text-white font-bold text-lg">{item.rank}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function UserRankingList({ ranking, valueKey, label, showRank, isMenfluencer }: UserRankingListProps) {
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

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="space-y-2">
      {top3.length > 0 && (
        <UserPodium
          top3={top3}
          valueKey={valueKey}
          label={label}
          showRank={showRank}
          isMenfluencer={isMenfluencer}
        />
      )}

      {rest.map((item) => {
        const shopCount = "shopCount" in item ? item.shopCount : 0;
        const rank = showRank ? getRankByShopCount(shopCount) : null;

        return (
          <Link
            key={item.user?._id || item.rank}
            href={`/users/${item.user?._id}`}
            className="bg-white rounded-xl p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 bg-gray-100 text-gray-500">
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
                  {isMenfluencer && item.rank >= 2 && item.rank <= 5 ? (
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-pink-400" />
                      <span className="text-xs font-medium text-pink-400">麺フルエンサー</span>
                    </div>
                  ) : showRank && rank ? (
                    <div className="flex items-center gap-1">
                      <RankIcon rank={rank} size="sm" animate={false} />
                      <span className="text-xs font-medium" style={{ color: rank.color }}>
                        {rank.name}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="font-bold text-gray-900">{item[valueKey]}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function PostPodium({ top3 }: { top3: any[] }) {
  const maxVal = top3[0]?.likeCount || 1;
  const calcHeight = (val: number) => {
    const minH = 60;
    const maxH = 180;
    const ratio = maxVal > 0 ? val / maxVal : 0;
    return Math.max(minH, Math.round(ratio * maxH));
  };

  const rankColor = (rank: number) => {
    if (rank === 1) return "#FFD700";
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32";
    return "#C0C0C0";
  };

  const podiumConfig = [
    { index: 1, order: "order-1" },
    { index: 0, order: "order-2" },
    { index: 2, order: "order-3" },
  ];

  return (
    <div className="bg-white rounded-xl p-6 pb-0 mb-4">
      <div className="flex items-end justify-center gap-3">
        {podiumConfig.map((config) => {
          const item = top3[config.index];
          if (!item) return null;
          const color = rankColor(item.rank);
          const isTop = item.rank === 1;

          return (
            <Link
              key={item.noodle?._id || config.index}
              href={`/noodles/${item.noodle?._id}`}
              className={cn("flex flex-col items-center flex-1 max-w-[130px]", config.order)}
            >
              <div className="relative mb-1">
                {item.user?.imageUrl ? (
                  <img
                    src={item.user.imageUrl}
                    alt={item.user.name}
                    className={cn(
                      "rounded-full border-3 object-cover",
                      isTop ? "w-16 h-16" : "w-12 h-12"
                    )}
                    style={{ borderColor: color }}
                  />
                ) : (
                  <div
                    className={cn(
                      "rounded-full flex items-center justify-center text-white font-bold",
                      isTop ? "w-16 h-16 text-xl" : "w-12 h-12 text-base"
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {item.rank}
                  </div>
                )}
                {item.rank === 1 && (
                  <Crown
                    className="w-6 h-6 text-yellow-500 absolute -top-4 left-1/2 -translate-x-1/2"
                    fill="#FFD700"
                  />
                )}
              </div>

              <p className="text-xs font-medium text-gray-900 truncate w-full text-center">
                {item.shop?.name || "不明な店舗"}
              </p>
              <p className="text-[10px] text-gray-500 truncate w-full text-center">
                {item.noodle?.ramenName}
              </p>

              <div className="flex items-center gap-1 text-red-500 mt-1">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span className="text-sm font-bold">{item.likeCount}</span>
              </div>

              <div className="h-1" />

              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{ backgroundColor: color, height: `${calcHeight(item.likeCount || 0)}px` }}
              >
                <div className="flex items-center justify-center pt-3">
                  <span className="text-white font-bold text-lg">{item.rank}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
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

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="space-y-2">
      {top3.length > 0 && <PostPodium top3={top3} />}

      {rest.map((item, index) => (
        <Link
          key={item.noodle?._id || index}
          href={`/noodles/${item.noodle?._id}`}
          className="bg-white rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 bg-gray-100 text-gray-500">
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
