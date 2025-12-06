import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// フォローする
export const follow = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 自分自身はフォローできない
    if (args.followerId === args.followingId) {
      throw new Error("Cannot follow yourself");
    }

    // 既にフォローしているか確認
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    // フォロー作成
    const followId = await ctx.db.insert("follows", {
      followerId: args.followerId,
      followingId: args.followingId,
      createdAt: Date.now(),
    });

    // 通知を作成（フォローされた人に通知）
    await ctx.db.insert("notifications", {
      userId: args.followingId,
      type: "follow",
      fromUserId: args.followerId,
      isRead: false,
      createdAt: Date.now(),
    });

    return followId;
  },
});

// フォロー解除
export const unfollow = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// フォローしているか確認
export const isFollowing = query({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    return !!existing;
  },
});

// フォロー中のユーザー一覧
export const getFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", args.userId))
      .collect();

    const users = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followingId);
        return user;
      })
    );

    return users.filter((u) => u !== null);
  },
});

// フォロワー一覧
export const getFollowers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followingId", (q) => q.eq("followingId", args.userId))
      .collect();

    const users = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followerId);
        return user;
      })
    );

    return users.filter((u) => u !== null);
  },
});

// フォロー数・フォロワー数を取得
export const getCounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const following = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", args.userId))
      .collect();

    const followers = await ctx.db
      .query("follows")
      .withIndex("by_followingId", (q) => q.eq("followingId", args.userId))
      .collect();

    return {
      followingCount: following.length,
      followersCount: followers.length,
    };
  },
});
