import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const noodleIds = likes.map((like) => like.noodleId);
    const noodles = await Promise.all(noodleIds.map((id) => ctx.db.get(id)));

    const users = await ctx.db.query("users").collect();
    const shops = await ctx.db.query("shops").collect();
    const userMap = new Map(users.map((u) => [u._id, u]));
    const shopMap = new Map(shops.map((s) => [s._id, s]));

    return noodles
      .filter((n) => n !== null)
      .map((noodle) => ({
        ...noodle!,
        user: userMap.get(noodle!.userId),
        shop: shopMap.get(noodle!.shopId),
      }));
  },
});

export const isLiked = query({
  args: {
    userId: v.id("users"),
    noodleId: v.id("noodles"),
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("likes")
      .withIndex("by_userId_noodleId", (q) =>
        q.eq("userId", args.userId).eq("noodleId", args.noodleId)
      )
      .first();

    return like !== null;
  },
});

export const getCount = query({
  args: { noodleId: v.id("noodles") },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_noodleId", (q) => q.eq("noodleId", args.noodleId))
      .collect();
    return likes.length;
  },
});

export const getCountBatch = query({
  args: { noodleIds: v.array(v.id("noodles")) },
  handler: async (ctx, args) => {
    const allLikes = await ctx.db.query("likes").collect();
    const counts: Record<string, number> = {};
    for (const noodleId of args.noodleIds) {
      counts[noodleId] = allLikes.filter((l) => l.noodleId === noodleId).length;
    }
    return counts;
  },
});

// いいねしたユーザー一覧を取得
export const getLikeUsers = query({
  args: { noodleId: v.id("noodles") },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_noodleId", (q) => q.eq("noodleId", args.noodleId))
      .collect();

    const users = await Promise.all(
      likes.map(async (like) => {
        const user = await ctx.db.get(like.userId);
        if (!user) return null;

        // プロフィール画像URLを取得
        let imageUrl: string | null = null;
        if (user.profileImageId) {
          imageUrl = await ctx.storage.getUrl(user.profileImageId);
        }

        return {
          _id: user._id,
          name: user.name,
          imageUrl,
        };
      })
    );

    return users.filter((u) => u !== null);
  },
});

export const isLikedBatch = query({
  args: {
    userId: v.id("users"),
    noodleIds: v.array(v.id("noodles")),
  },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const likedNoodleIds = new Set(likes.map((l) => l.noodleId));
    const result: Record<string, boolean> = {};
    for (const noodleId of args.noodleIds) {
      result[noodleId] = likedNoodleIds.has(noodleId);
    }
    return result;
  },
});

export const toggle = mutation({
  args: {
    userId: v.id("users"),
    noodleId: v.id("noodles"),
  },
  handler: async (ctx, args) => {
    // Check if trying to like own post
    const noodle = await ctx.db.get(args.noodleId);
    if (noodle?.userId === args.userId) {
      throw new Error("Cannot like your own post");
    }

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_userId_noodleId", (q) =>
        q.eq("userId", args.userId).eq("noodleId", args.noodleId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    }

    await ctx.db.insert("likes", {
      userId: args.userId,
      noodleId: args.noodleId,
    });

    // 投稿者にいいね通知を送る
    if (noodle) {
      await ctx.db.insert("notifications", {
        userId: noodle.userId,
        type: "like",
        fromUserId: args.userId,
        targetId: args.noodleId,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { liked: true };
  },
});
