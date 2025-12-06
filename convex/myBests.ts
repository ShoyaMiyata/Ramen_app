import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// マイベストのカテゴリ一覧
export const BEST_CATEGORIES = [
  { code: "overall", label: "総合ベスト" },
  { code: "shoyu", label: "醤油部門" },
  { code: "shio", label: "塩部門" },
  { code: "miso", label: "味噌部門" },
  { code: "tonkotsu", label: "とんこつ部門" },
  { code: "iekei", label: "家系部門" },
  { code: "jiro", label: "二郎系部門" },
  { code: "tsukemen", label: "つけ麺部門" },
  { code: "tantan", label: "担々麺部門" },
] as const;

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const myBests = await ctx.db
      .query("myBests")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // noodle情報を取得
    const results = await Promise.all(
      myBests.map(async (myBest) => {
        const noodle = await ctx.db.get(myBest.noodleId);
        if (!noodle) return null;

        const shop = await ctx.db.get(noodle.shopId);
        const imageUrl = noodle.imageId
          ? await ctx.storage.getUrl(noodle.imageId)
          : null;

        return {
          ...myBest,
          noodle: {
            ...noodle,
            shop,
            imageUrl,
          },
        };
      })
    );

    return results.filter((r) => r !== null);
  },
});

export const set = mutation({
  args: {
    userId: v.id("users"),
    category: v.string(),
    noodleId: v.id("noodles"),
  },
  handler: async (ctx, args) => {
    // 既存のベストがあれば削除
    const existing = await ctx.db
      .query("myBests")
      .withIndex("by_userId_category", (q) =>
        q.eq("userId", args.userId).eq("category", args.category)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    // 新しいベストを登録
    return await ctx.db.insert("myBests", {
      userId: args.userId,
      category: args.category,
      noodleId: args.noodleId,
    });
  },
});

export const remove = mutation({
  args: {
    userId: v.id("users"),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("myBests")
      .withIndex("by_userId_category", (q) =>
        q.eq("userId", args.userId).eq("category", args.category)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
