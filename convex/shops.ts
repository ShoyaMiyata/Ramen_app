import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

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
      const existingStation = await ctx.db
        .query("stations")
        .withIndex("by_name", (q) => q.eq("name", args.station))
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
          name: args.station,
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
