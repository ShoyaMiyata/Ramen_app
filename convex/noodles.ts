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
    return await ctx.db.insert("noodles", {
      userId: args.userId,
      shopId: args.shopId,
      ramenName: args.ramenName,
      genres: args.genres,
      visitDate: args.visitDate,
      comment: args.comment,
      evaluation: args.evaluation,
      imageId: args.imageId,
      createdAt: Date.now(), // 作成日時を追加
    });
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Record not found");
    if (existing.userId !== args.userId) throw new Error("Unauthorized");

    // 古い画像を削除（新しい画像がある場合）
    if (existing.imageId && args.imageId && existing.imageId !== args.imageId) {
      await ctx.storage.delete(existing.imageId);
    }

    await ctx.db.patch(args.id, {
      shopId: args.shopId,
      ramenName: args.ramenName,
      genres: args.genres,
      visitDate: args.visitDate,
      comment: args.comment,
      evaluation: args.evaluation,
      imageId: args.imageId,
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
