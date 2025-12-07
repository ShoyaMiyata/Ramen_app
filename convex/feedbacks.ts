import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.id("users"),
    category: v.string(),
    message: v.string(),
    heatLevel: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("feedbacks", {
      userId: args.userId,
      category: args.category,
      message: args.message,
      heatLevel: args.heatLevel,
      steamCount: 0,
      createdAt: Date.now(),
    });
  },
});

// フィードバック一覧取得（投稿日の降順）
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const feedbacks = await ctx.db.query("feedbacks").collect();

    // 投稿日でソート（新しい順）
    const sorted = feedbacks.sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );

    return sorted;
  },
});

// 湯気ボタン押下（共感）- 熱々度付き
export const addSteam = mutation({
  args: {
    feedbackId: v.id("feedbacks"),
    userId: v.id("users"),
    heatLevel: v.number(), // 1-3
  },
  handler: async (ctx, args) => {
    // 既に湯気を押しているか確認
    const existing = await ctx.db
      .query("feedbackSteams")
      .withIndex("by_userId_feedbackId", (q) =>
        q.eq("userId", args.userId).eq("feedbackId", args.feedbackId)
      )
      .first();

    if (existing) {
      // 既に押している場合 - 同じ熱々度なら取り消し、違う熱々度なら更新
      if (existing.heatLevel === args.heatLevel) {
        await ctx.db.delete(existing._id);
        const feedback = await ctx.db.get(args.feedbackId);
        if (feedback) {
          await ctx.db.patch(args.feedbackId, {
            steamCount: Math.max(0, (feedback.steamCount || 0) - args.heatLevel),
          });
        }
        return { action: "removed", heatLevel: 0 };
      } else {
        // 熱々度を更新
        const oldHeatLevel = existing.heatLevel;
        await ctx.db.patch(existing._id, { heatLevel: args.heatLevel });
        const feedback = await ctx.db.get(args.feedbackId);
        if (feedback) {
          await ctx.db.patch(args.feedbackId, {
            steamCount: (feedback.steamCount || 0) - oldHeatLevel + args.heatLevel,
          });
        }
        return { action: "updated", heatLevel: args.heatLevel };
      }
    } else {
      // 新規追加
      await ctx.db.insert("feedbackSteams", {
        feedbackId: args.feedbackId,
        userId: args.userId,
        heatLevel: args.heatLevel,
        createdAt: Date.now(),
      });
      const feedback = await ctx.db.get(args.feedbackId);
      if (feedback) {
        await ctx.db.patch(args.feedbackId, {
          steamCount: (feedback.steamCount || 0) + args.heatLevel,
        });
      }
      return { action: "added", heatLevel: args.heatLevel };
    }
  },
});

// ユーザーが湯気を押したフィードバック一覧（熱々度付き）
export const getUserSteams = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const steams = await ctx.db
      .query("feedbackSteams")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    // feedbackId -> heatLevel のマップを返す
    return steams.reduce(
      (acc, s) => {
        acc[s.feedbackId] = s.heatLevel;
        return acc;
      },
      {} as Record<string, number>
    );
  },
});
