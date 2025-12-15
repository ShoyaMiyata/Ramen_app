import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("shops").collect();
  },
});

export const search = query({
  args: { searchText: v.string() },
  handler: async (ctx, args) => {
    const shops = await ctx.db.query("shops").collect();
    if (!args.searchText) return shops.slice(0, 10);

    const searchLower = args.searchText.toLowerCase();
    return shops
      .filter((shop) => shop.name.toLowerCase().includes(searchLower))
      .slice(0, 10);
  },
});

export const searchWithStats = query({
  args: {
    searchText: v.string(),
    viewerId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;

    const shops = await ctx.db.query("shops").collect();
    const filteredShops = args.searchText
      ? shops.filter((shop) =>
          shop.name.toLowerCase().includes(args.searchText.toLowerCase())
        )
      : shops;

    // 全ての投稿を取得
    const allNoodles = await ctx.db.query("noodles").collect();

    // フォロー機能が有効かどうかを確認
    const followSetting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "followEnabled"))
      .unique();
    const followEnabled = followSetting ? JSON.parse(followSetting.value) === true : true;

    // 鍵アカウントのフィルタリング用データを準備
    let followingIds: Set<string> = new Set();
    let userMap = new Map();
    if (followEnabled) {
      const users = await ctx.db.query("users").collect();
      userMap = new Map(users.map((u) => [u._id, u]));

      if (args.viewerId) {
        const following = await ctx.db
          .query("follows")
          .withIndex("by_followerId", (q) => q.eq("followerId", args.viewerId!))
          .collect();
        followingIds = new Set(following.map((f) => f.followingId));
      }
    }

    // 各店舗の統計を計算
    const shopsWithStats = filteredShops.map((shop) => {
      let shopNoodles = allNoodles.filter((n) => n.shopId === shop._id);

      // 鍵アカウントのフィルタリング
      if (followEnabled) {
        shopNoodles = shopNoodles.filter((noodle) => {
          const noodleUser = userMap.get(noodle.userId);
          if (!noodleUser) return false;
          if (!noodleUser.isPrivate) return true;
          if (args.viewerId && noodle.userId === args.viewerId) return true;
          if (args.viewerId && followingIds.has(noodle.userId)) return true;
          return false;
        });
      }

      const totalPosts = shopNoodles.length;
      const uniqueUserIds = new Set(shopNoodles.map((n) => n.userId));
      const visitorCount = uniqueUserIds.size;

      const ratedNoodles = shopNoodles.filter((n) => n.evaluation !== undefined);
      const avgRating =
        ratedNoodles.length > 0
          ? ratedNoodles.reduce((sum, n) => sum + (n.evaluation || 0), 0) /
            ratedNoodles.length
          : 0;

      return {
        ...shop,
        stats: {
          totalPosts,
          visitorCount,
          avgRating: Math.round(avgRating * 10) / 10,
        },
      };
    });

    // 投稿数でソート（全店舗を含む）
    const sortedShops = shopsWithStats.sort((a, b) => b.stats.totalPosts - a.stats.totalPosts);

    const totalCount = sortedShops.length;
    const paginatedShops = sortedShops.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    return {
      items: paginatedShops,
      totalCount,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    };
  },
});

export const getById = query({
  args: {
    shopId: v.id("shops"),
    viewerId: v.optional(v.id("users")), // 閲覧者のID（鍵アカウントフィルタ用）
  },
  handler: async (ctx, args) => {
    const shop = await ctx.db.get(args.shopId);
    if (!shop) return null;

    // この店舗への全投稿を取得
    let noodles = await ctx.db
      .query("noodles")
      .withIndex("by_shopId", (q) => q.eq("shopId", args.shopId))
      .collect();

    // フォロー機能が有効かどうかを確認
    const followSetting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "followEnabled"))
      .unique();
    const followEnabled = followSetting ? JSON.parse(followSetting.value) === true : true;

    // 鍵アカウントのフィルタリング
    if (followEnabled) {
      const users = await ctx.db.query("users").collect();
      const userMap = new Map(users.map((u) => [u._id, u]));

      let followingIds: Set<string> = new Set();
      if (args.viewerId) {
        const following = await ctx.db
          .query("follows")
          .withIndex("by_followerId", (q) => q.eq("followerId", args.viewerId!))
          .collect();
        followingIds = new Set(following.map((f) => f.followingId));
      }

      noodles = noodles.filter((noodle) => {
        const noodleUser = userMap.get(noodle.userId);
        if (!noodleUser) return false;
        if (!noodleUser.isPrivate) return true;
        if (args.viewerId && noodle.userId === args.viewerId) return true;
        if (args.viewerId && followingIds.has(noodle.userId)) return true;
        return false;
      });
    }

    // 統計情報を計算
    const totalPosts = noodles.length;
    const uniqueUserIds = new Set(noodles.map((n) => n.userId));
    const visitorCount = uniqueUserIds.size;

    // 平均評価を計算
    const ratedNoodles = noodles.filter((n) => n.evaluation !== undefined);
    const avgRating = ratedNoodles.length > 0
      ? ratedNoodles.reduce((sum, n) => sum + (n.evaluation || 0), 0) / ratedNoodles.length
      : 0;

    // 評価分布を計算（1-5星）
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    for (const noodle of ratedNoodles) {
      if (noodle.evaluation) {
        ratingDistribution[noodle.evaluation as keyof typeof ratingDistribution]++;
      }
    }

    return {
      ...shop,
      stats: {
        totalPosts,
        visitorCount,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingDistribution,
      },
    };
  },
});

export const getOrCreate = mutation({
  args: {
    name: v.string(),
    address: v.optional(v.string()),
    url: v.optional(v.string()),
    prefecture: v.optional(v.string()),
    station: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("shops")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    // 駅が指定されている場合、stationsテーブルに登録
    if (args.station) {
      const stationName = args.station; // Type narrowing
      const existingStation = await ctx.db
        .query("stations")
        .withIndex("by_name", (q) => q.eq("name", stationName))
        .first();

      if (existingStation) {
        // 既存駅の使用回数をインクリメント
        await ctx.db.patch(existingStation._id, {
          usageCount: existingStation.usageCount + 1,
        });

        // 都道府県情報があれば更新
        if (args.prefecture && !existingStation.prefecture) {
          await ctx.db.patch(existingStation._id, {
            prefecture: args.prefecture,
          });
        }
      } else {
        // 新規駅を登録
        await ctx.db.insert("stations", {
          name: stationName,
          prefecture: args.prefecture,
          registeredBy: args.userId,
          usageCount: 1,
          createdAt: Date.now(),
        });
      }
    }

    if (existing) {
      // 追加情報があれば更新
      if (args.address || args.url || args.prefecture || args.station) {
        await ctx.db.patch(existing._id, {
          address: args.address || existing.address,
          url: args.url || existing.url,
          prefecture: args.prefecture || existing.prefecture,
          station: args.station || existing.station,
        });
      }
      return existing._id;
    }

    return await ctx.db.insert("shops", {
      name: args.name,
      address: args.address,
      url: args.url,
      prefecture: args.prefecture,
      station: args.station,
    });
  },
});
