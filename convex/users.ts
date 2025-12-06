import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getCurrent = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || user.deletedAt) return null;
    return user;
  },
});

export const upsert = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
    });
  },
});

export const softDelete = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    await ctx.db.patch(user._id, {
      deletedAt: Date.now(),
    });

    return user._id;
  },
});

// ユーザーをIDで取得
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user || user.deletedAt) return null;
    return user;
  },
});

// ユーザー検索（名前で部分一致）
export const search = query({
  args: { searchText: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchText || args.searchText.length < 1) {
      return [];
    }

    const allUsers = await ctx.db.query("users").collect();
    const searchLower = args.searchText.toLowerCase();

    return allUsers
      .filter((user) => {
        if (user.deletedAt) return false;
        const name = user.name?.toLowerCase() || "";
        return name.includes(searchLower);
      })
      .slice(0, 20);
  },
});

// 全ユーザー一覧（ランキング用など）
export const list = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => !u.deletedAt);
  },
});

// 名前を更新
export const updateName = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      name: args.name,
    });

    return args.userId;
  },
});
