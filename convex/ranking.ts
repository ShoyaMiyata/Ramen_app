import { v } from "convex/values";
import { query } from "./_generated/server";

export const getShopVisits = query({
  args: {
    period: v.optional(
      v.union(v.literal("weekly"), v.literal("monthly"), v.literal("all"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const period = args.period || "all";

    let noodles = await ctx.db.query("noodles").collect();

    // Filter by period
    const now = Date.now();
    if (period === "weekly") {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      noodles = noodles.filter((n) => n._creationTime >= weekAgo);
    } else if (period === "monthly") {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      noodles = noodles.filter((n) => n._creationTime >= monthAgo);
    }

    // Count unique shops per user
    const userShops: Map<string, Set<string>> = new Map();
    for (const noodle of noodles) {
      const userId = noodle.userId;
      if (!userShops.has(userId)) {
        userShops.set(userId, new Set());
      }
      userShops.get(userId)!.add(noodle.shopId);
    }

    // Get user data
    const users = await ctx.db.query("users").collect();
    const userMap = new Map(users.map((u) => [u._id, u]));

    // Create ranking
    const ranking = Array.from(userShops.entries())
      .map(([userId, shops]) => ({
        user: userMap.get(userId as any),
        shopCount: shops.size,
      }))
      .filter((r) => r.user && !r.user.deletedAt)
      .sort((a, b) => b.shopCount - a.shopCount)
      .slice(0, limit);

    return ranking.map((r, index) => ({
      rank: index + 1,
      user: r.user,
      shopCount: r.shopCount,
    }));
  },
});

export const getPostCounts = query({
  args: {
    period: v.optional(
      v.union(v.literal("weekly"), v.literal("monthly"), v.literal("all"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const period = args.period || "all";

    let noodles = await ctx.db.query("noodles").collect();

    const now = Date.now();
    if (period === "weekly") {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      noodles = noodles.filter((n) => n._creationTime >= weekAgo);
    } else if (period === "monthly") {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      noodles = noodles.filter((n) => n._creationTime >= monthAgo);
    }

    // Count posts per user
    const userCounts: Map<string, number> = new Map();
    for (const noodle of noodles) {
      const userId = noodle.userId;
      userCounts.set(userId, (userCounts.get(userId) || 0) + 1);
    }

    const users = await ctx.db.query("users").collect();
    const userMap = new Map(users.map((u) => [u._id, u]));

    const ranking = Array.from(userCounts.entries())
      .map(([userId, count]) => ({
        user: userMap.get(userId as any),
        postCount: count,
      }))
      .filter((r) => r.user && !r.user.deletedAt)
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, limit);

    return ranking.map((r, index) => ({
      rank: index + 1,
      user: r.user,
      postCount: r.postCount,
    }));
  },
});

export const getPopularPosts = query({
  args: {
    period: v.optional(
      v.union(v.literal("weekly"), v.literal("monthly"), v.literal("all"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const period = args.period || "all";

    let likes = await ctx.db.query("likes").collect();

    const now = Date.now();
    if (period === "weekly") {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      likes = likes.filter((l) => l._creationTime >= weekAgo);
    } else if (period === "monthly") {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      likes = likes.filter((l) => l._creationTime >= monthAgo);
    }

    // Count likes per noodle
    const noodleLikes: Map<string, number> = new Map();
    for (const like of likes) {
      const noodleId = like.noodleId;
      noodleLikes.set(noodleId, (noodleLikes.get(noodleId) || 0) + 1);
    }

    const noodles = await ctx.db.query("noodles").collect();
    const noodleMap = new Map(noodles.map((n) => [n._id, n]));
    const users = await ctx.db.query("users").collect();
    const userMap = new Map(users.map((u) => [u._id, u]));
    const shops = await ctx.db.query("shops").collect();
    const shopMap = new Map(shops.map((s) => [s._id, s]));

    const ranking = Array.from(noodleLikes.entries())
      .map(([noodleId, count]) => {
        const noodle = noodleMap.get(noodleId as any);
        return {
          noodle,
          user: noodle ? userMap.get(noodle.userId) : undefined,
          shop: noodle ? shopMap.get(noodle.shopId) : undefined,
          likeCount: count,
        };
      })
      .filter((r) => r.noodle && r.user && !r.user.deletedAt)
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, limit);

    return ranking.map((r, index) => ({
      rank: index + 1,
      noodle: r.noodle,
      user: r.user,
      shop: r.shop,
      likeCount: r.likeCount,
    }));
  },
});

export const getPopularUsers = query({
  args: {
    period: v.optional(
      v.union(v.literal("weekly"), v.literal("monthly"), v.literal("all"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const period = args.period || "all";

    const noodles = await ctx.db.query("noodles").collect();
    const noodleUserMap = new Map(noodles.map((n) => [n._id, n.userId]));

    let likes = await ctx.db.query("likes").collect();

    const now = Date.now();
    if (period === "weekly") {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      likes = likes.filter((l) => l._creationTime >= weekAgo);
    } else if (period === "monthly") {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      likes = likes.filter((l) => l._creationTime >= monthAgo);
    }

    // Count likes per user (post owner)
    const userLikes: Map<string, number> = new Map();
    for (const like of likes) {
      const postOwner = noodleUserMap.get(like.noodleId);
      if (postOwner) {
        userLikes.set(postOwner, (userLikes.get(postOwner) || 0) + 1);
      }
    }

    const users = await ctx.db.query("users").collect();
    const userMap = new Map(users.map((u) => [u._id, u]));

    const ranking = Array.from(userLikes.entries())
      .map(([userId, count]) => ({
        user: userMap.get(userId as any),
        likeCount: count,
      }))
      .filter((r) => r.user && !r.user.deletedAt)
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, limit);

    return ranking.map((r, index) => ({
      rank: index + 1,
      user: r.user,
      likeCount: r.likeCount,
    }));
  },
});
