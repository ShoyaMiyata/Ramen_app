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

    return { liked: true };
  },
});
