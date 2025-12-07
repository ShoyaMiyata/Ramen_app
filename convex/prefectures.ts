import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// バッジティア判定
function getTierByVisitCount(count: number): "bronze" | "silver" | "gold" | null {
  if (count >= 10) return "gold";
  if (count >= 5) return "silver";
  if (count >= 1) return "bronze";
  return null;
}

// ユーザーの都道府県別訪問統計を取得
export const getVisitStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // ユーザーの全投稿を取得
    const noodles = await ctx.db
      .query("noodles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // 店舗IDを収集
    const shopIds = [...new Set(noodles.map((n) => n.shopId))];

    // 店舗情報をバッチ取得
    const shops = await Promise.all(shopIds.map((id) => ctx.db.get(id)));
    const shopMap = new Map(shopIds.map((id, i) => [id, shops[i]]));

    // 都道府県別に訪問店舗をカウント
    const prefectureStats: Record<
      string,
      { visitCount: number; shopIds: string[] }
    > = {};

    for (const noodle of noodles) {
      const shop = shopMap.get(noodle.shopId);
      if (!shop?.prefecture) continue;

      if (!prefectureStats[shop.prefecture]) {
        prefectureStats[shop.prefecture] = { visitCount: 0, shopIds: [] };
      }

      // 同じ店舗は1回だけカウント
      if (!prefectureStats[shop.prefecture].shopIds.includes(shop._id)) {
        prefectureStats[shop.prefecture].shopIds.push(shop._id);
        prefectureStats[shop.prefecture].visitCount++;
      }
    }

    // バッジ情報を取得
    const badges = await ctx.db
      .query("prefectureBadges")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const badgeMap = new Map(badges.map((b) => [b.prefecture, b]));

    // 結果を整形
    const result: Record<
      string,
      {
        visitCount: number;
        tier: "bronze" | "silver" | "gold" | null;
        badge: typeof badges[number] | null;
      }
    > = {};

    for (const [prefecture, stats] of Object.entries(prefectureStats)) {
      result[prefecture] = {
        visitCount: stats.visitCount,
        tier: getTierByVisitCount(stats.visitCount),
        badge: badgeMap.get(prefecture) || null,
      };
    }

    // 統計サマリー
    const totalPrefectures = Object.keys(result).length;
    const bronzeCount = Object.values(result).filter(
      (r) => r.tier === "bronze"
    ).length;
    const silverCount = Object.values(result).filter(
      (r) => r.tier === "silver"
    ).length;
    const goldCount = Object.values(result).filter(
      (r) => r.tier === "gold"
    ).length;

    return {
      prefectures: result,
      summary: {
        total: totalPrefectures,
        bronze: bronzeCount,
        silver: silverCount,
        gold: goldCount,
      },
    };
  },
});

// 特定都道府県の詳細情報を取得
export const getPrefectureDetail = query({
  args: {
    userId: v.id("users"),
    prefecture: v.string(),
  },
  handler: async (ctx, args) => {
    // ユーザーの全投稿を取得
    const noodles = await ctx.db
      .query("noodles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // 店舗IDを収集
    const shopIds = [...new Set(noodles.map((n) => n.shopId))];

    // 店舗情報をバッチ取得
    const shops = await Promise.all(shopIds.map((id) => ctx.db.get(id)));
    const shopMap = new Map(shopIds.map((id, i) => [id, shops[i]]));

    // 指定都道府県の店舗と投稿を抽出
    const prefectureShops: typeof shops = [];
    const prefectureNoodles: typeof noodles = [];

    for (const noodle of noodles) {
      const shop = shopMap.get(noodle.shopId);
      if (shop?.prefecture === args.prefecture) {
        prefectureNoodles.push(noodle);
        if (!prefectureShops.find((s) => s?._id === shop._id)) {
          prefectureShops.push(shop);
        }
      }
    }

    // 店舗ごとの訪問回数を集計
    const shopVisitCounts: Record<string, number> = {};
    for (const noodle of prefectureNoodles) {
      shopVisitCounts[noodle.shopId] =
        (shopVisitCounts[noodle.shopId] || 0) + 1;
    }

    // バッジ情報を取得
    const badge = await ctx.db
      .query("prefectureBadges")
      .withIndex("by_userId_prefecture", (q) =>
        q.eq("userId", args.userId).eq("prefecture", args.prefecture)
      )
      .first();

    return {
      visitCount: prefectureShops.length,
      tier: getTierByVisitCount(prefectureShops.length),
      badge,
      shops: prefectureShops.filter(Boolean).map((shop) => ({
        ...shop!,
        visitCount: shopVisitCounts[shop!._id] || 0,
      })),
      totalVisits: prefectureNoodles.length,
    };
  },
});

// バッジ獲得/更新処理（投稿時に呼び出し）
export const checkAndUpdateBadge = mutation({
  args: {
    userId: v.id("users"),
    prefecture: v.string(),
  },
  handler: async (ctx, args) => {
    // ユーザーの全投稿を取得
    const noodles = await ctx.db
      .query("noodles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // 店舗IDを収集
    const shopIds = [...new Set(noodles.map((n) => n.shopId))];

    // 店舗情報をバッチ取得
    const shops = await Promise.all(shopIds.map((id) => ctx.db.get(id)));

    // 指定都道府県の店舗数をカウント
    const prefectureShopCount = shops.filter(
      (shop) => shop?.prefecture === args.prefecture
    ).length;

    const newTier = getTierByVisitCount(prefectureShopCount);
    if (!newTier) return null;

    // 既存のバッジを取得
    const existingBadge = await ctx.db
      .query("prefectureBadges")
      .withIndex("by_userId_prefecture", (q) =>
        q.eq("userId", args.userId).eq("prefecture", args.prefecture)
      )
      .first();

    const now = Date.now();

    if (existingBadge) {
      // ティアが上がった場合のみ更新
      const tierRank = { bronze: 1, silver: 2, gold: 3 };
      if (tierRank[newTier] > tierRank[existingBadge.tier as keyof typeof tierRank]) {
        await ctx.db.patch(existingBadge._id, {
          tier: newTier,
          visitCount: prefectureShopCount,
          updatedAt: now,
        });
        return { type: "upgraded" as const, tier: newTier, prefecture: args.prefecture };
      } else {
        // 訪問数のみ更新
        await ctx.db.patch(existingBadge._id, {
          visitCount: prefectureShopCount,
          updatedAt: now,
        });
        return null;
      }
    } else {
      // 新規バッジ作成
      await ctx.db.insert("prefectureBadges", {
        userId: args.userId,
        prefecture: args.prefecture,
        tier: newTier,
        visitCount: prefectureShopCount,
        earnedAt: now,
        updatedAt: now,
      });
      return { type: "new" as const, tier: newTier, prefecture: args.prefecture };
    }
  },
});

// ユーザーの都道府県バッジ一覧を取得
export const getUserBadges = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const badges = await ctx.db
      .query("prefectureBadges")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return badges;
  },
});
