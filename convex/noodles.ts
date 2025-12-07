import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    genres: v.optional(v.array(v.string())),
    searchText: v.optional(v.string()),
    sortBy: v.optional(
      v.union(v.literal("newest"), v.literal("rating"), v.literal("visitDate"))
    ),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;

    let noodles = await ctx.db.query("noodles").order("desc").collect();

    // Filter by genres
    if (args.genres && args.genres.length > 0) {
      noodles = noodles.filter((noodle) =>
        args.genres!.some((genre) => noodle.genres.includes(genre))
      );
    }

    // Filter by search text (shop name or ramen name)
    if (args.searchText) {
      const searchLower = args.searchText.toLowerCase();
      const shops = await ctx.db.query("shops").collect();
      const shopMap = new Map(shops.map((s) => [s._id, s.name]));

      noodles = noodles.filter((noodle) => {
        const shopName = shopMap.get(noodle.shopId) || "";
        return (
          noodle.ramenName.toLowerCase().includes(searchLower) ||
          shopName.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort
    if (args.sortBy === "rating") {
      noodles.sort((a, b) => (b.evaluation || 0) - (a.evaluation || 0));
    } else if (args.sortBy === "visitDate") {
      noodles.sort((a, b) => (b.visitDate || 0) - (a.visitDate || 0));
    }

    // Total count before pagination
    const totalCount = noodles.length;

    // Apply pagination
    const paginatedNoodles = noodles.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    // Enrich with user and shop data and image URLs
    const users = await ctx.db.query("users").collect();
    const shops = await ctx.db.query("shops").collect();
    const userMap = new Map(users.map((u) => [u._id, u]));
    const shopMap = new Map(shops.map((s) => [s._id, s]));

    const items = await Promise.all(
      paginatedNoodles.map(async (noodle) => {
        const imageUrl = noodle.imageId
          ? await ctx.storage.getUrl(noodle.imageId)
          : null;
        return {
          ...noodle,
          user: userMap.get(noodle.userId),
          shop: shopMap.get(noodle.shopId),
          imageUrl,
        };
      })
    );

    return {
      items,
      totalCount,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    };
  },
});

export const getById = query({
  args: { id: v.id("noodles") },
  handler: async (ctx, args) => {
    const noodle = await ctx.db.get(args.id);
    if (!noodle) return null;

    const user = await ctx.db.get(noodle.userId);
    const shop = await ctx.db.get(noodle.shopId);
    const imageUrl = noodle.imageId
      ? await ctx.storage.getUrl(noodle.imageId)
      : null;

    return {
      ...noodle,
      user,
      shop,
      imageUrl,
    };
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const noodles = await ctx.db
      .query("noodles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const shops = await ctx.db.query("shops").collect();
    const shopMap = new Map(shops.map((s) => [s._id, s]));

    const results = await Promise.all(
      noodles.map(async (noodle) => {
        const imageUrl = noodle.imageId
          ? await ctx.storage.getUrl(noodle.imageId)
          : null;
        return {
          ...noodle,
          shop: shopMap.get(noodle.shopId),
          imageUrl,
        };
      })
    );

    return results;
  },
});

// ギャラリー用：写真付きの記録のみ取得
export const getGalleryByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const noodles = await ctx.db
      .query("noodles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const withImages = noodles.filter((n) => n.imageId);

    const shops = await ctx.db.query("shops").collect();
    const shopMap = new Map(shops.map((s) => [s._id, s]));

    const results = await Promise.all(
      withImages.map(async (noodle) => {
        const imageUrl = await ctx.storage.getUrl(noodle.imageId!);
        return {
          ...noodle,
          shop: shopMap.get(noodle.shopId),
          imageUrl,
        };
      })
    );

    return results;
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    shopId: v.id("shops"),
    ramenName: v.string(),
    genres: v.array(v.string()),
    visitDate: v.optional(v.number()),
    comment: v.optional(v.string()),
    evaluation: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // 投稿を作成
    const noodleId = await ctx.db.insert("noodles", {
      userId: args.userId,
      shopId: args.shopId,
      ramenName: args.ramenName,
      genres: args.genres,
      visitDate: args.visitDate,
      comment: args.comment,
      evaluation: args.evaluation,
      imageId: args.imageId,
      createdAt: Date.now(),
    });

    // 店舗の都道府県を取得してバッジチェック
    const shop = await ctx.db.get(args.shopId);
    let badgeResult = null;
    if (shop?.prefecture) {
      // インラインでバッジチェックを実行
      const noodles = await ctx.db
        .query("noodles")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();

      const shopIds = [...new Set(noodles.map((n) => n.shopId))];
      const shops = await Promise.all(shopIds.map((id) => ctx.db.get(id)));

      const prefectureShopCount = shops.filter(
        (s) => s?.prefecture === shop.prefecture
      ).length;

      const getTier = (count: number) => {
        if (count >= 10) return "gold";
        if (count >= 5) return "silver";
        if (count >= 1) return "bronze";
        return null;
      };

      const newTier = getTier(prefectureShopCount);
      if (newTier) {
        const prefecture = shop.prefecture;
        const existingBadge = await ctx.db
          .query("prefectureBadges")
          .withIndex("by_userId_prefecture", (q) =>
            q.eq("userId", args.userId).eq("prefecture", prefecture)
          )
          .first();

        const now = Date.now();

        if (existingBadge) {
          const tierRank = { bronze: 1, silver: 2, gold: 3 };
          if (tierRank[newTier as keyof typeof tierRank] > tierRank[existingBadge.tier as keyof typeof tierRank]) {
            await ctx.db.patch(existingBadge._id, {
              tier: newTier,
              visitCount: prefectureShopCount,
              updatedAt: now,
            });
            badgeResult = { type: "upgraded" as const, tier: newTier, prefecture: shop.prefecture };
          } else {
            await ctx.db.patch(existingBadge._id, {
              visitCount: prefectureShopCount,
              updatedAt: now,
            });
          }
        } else {
          await ctx.db.insert("prefectureBadges", {
            userId: args.userId,
            prefecture: shop.prefecture,
            tier: newTier,
            visitCount: prefectureShopCount,
            earnedAt: now,
            updatedAt: now,
          });
          badgeResult = { type: "new" as const, tier: newTier, prefecture: shop.prefecture };
        }
      }
    }

    return { noodleId, badgeResult };
  },
});

export const update = mutation({
  args: {
    id: v.id("noodles"),
    userId: v.id("users"),
    shopId: v.id("shops"),
    ramenName: v.string(),
    genres: v.array(v.string()),
    visitDate: v.optional(v.number()),
    comment: v.optional(v.string()),
    evaluation: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")),
    removeImage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Record not found");
    if (existing.userId !== args.userId) throw new Error("Unauthorized");

    // 画像の処理
    let newImageId: typeof existing.imageId = existing.imageId;

    if (args.removeImage) {
      // 画像削除の場合
      if (existing.imageId) {
        await ctx.storage.delete(existing.imageId);
      }
      newImageId = undefined;
    } else if (args.imageId && args.imageId !== existing.imageId) {
      // 新しい画像にアップロードした場合、古い画像を削除
      if (existing.imageId) {
        await ctx.storage.delete(existing.imageId);
      }
      newImageId = args.imageId;
    }

    await ctx.db.patch(args.id, {
      shopId: args.shopId,
      ramenName: args.ramenName,
      genres: args.genres,
      visitDate: args.visitDate,
      comment: args.comment,
      evaluation: args.evaluation,
      imageId: newImageId,
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("noodles"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Record not found");
    if (existing.userId !== args.userId) throw new Error("Unauthorized");

    // Delete image if exists
    if (existing.imageId) {
      await ctx.storage.delete(existing.imageId);
    }

    // Delete related likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_noodleId", (q) => q.eq("noodleId", args.id))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // Delete related myBests
    const myBests = await ctx.db.query("myBests").collect();
    for (const myBest of myBests) {
      if (myBest.noodleId === args.id) {
        await ctx.db.delete(myBest._id);
      }
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// 画像アップロード用URL生成
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
