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

export const getOrCreate = mutation({
  args: {
    name: v.string(),
    address: v.optional(v.string()),
    url: v.optional(v.string()),
    prefecture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("shops")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      // 追加情報があれば更新
      if (args.address || args.url || args.prefecture) {
        await ctx.db.patch(existing._id, {
          address: args.address || existing.address,
          url: args.url || existing.url,
          prefecture: args.prefecture || existing.prefecture,
        });
      }
      return existing._id;
    }

    return await ctx.db.insert("shops", {
      name: args.name,
      address: args.address,
      url: args.url,
      prefecture: args.prefecture,
    });
  },
});
