"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { getRankByShopCount } from "@/lib/constants/ranks";

export function useUserStats(userId: Id<"users"> | undefined) {
  const noodles = useQuery(
    api.noodles.getByUser,
    userId ? { userId } : "skip"
  );
  const badges = useQuery(api.badges.getByUser, userId ? { userId } : "skip");

  if (!noodles || !badges) {
    return {
      postCount: 0,
      shopCount: 0,
      rank: getRankByShopCount(0),
      badges: [],
      isLoading: true,
    };
  }

  const uniqueShops = new Set(noodles.map((n) => n.shopId)).size;
  const rank = getRankByShopCount(uniqueShops);

  return {
    postCount: noodles.length,
    shopCount: uniqueShops,
    rank,
    badges,
    isLoading: false,
  };
}
