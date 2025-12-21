"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { getRankByShopCount } from "@/lib/constants/ranks";

export function useUserStats(userId: Id<"users"> | undefined) {
  const userStats = useQuery(
    api.users.getUserStats,
    userId ? { userId } : "skip"
  );
  const badges = useQuery(api.badges.getByUser, userId ? { userId } : "skip");

  if (!userStats || !badges) {
    return {
      postCount: 0,
      shopCount: 0,
      rank: getRankByShopCount(0),
      badges: [],
      isLoading: true,
    };
  }

  const rank = getRankByShopCount(userStats.visitedShopsCount);

  return {
    postCount: userStats.totalPosts,
    shopCount: userStats.visitedShopsCount,
    rank,
    badges,
    isLoading: false,
  };
}
