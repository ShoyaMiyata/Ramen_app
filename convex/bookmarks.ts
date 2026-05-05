import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const isBookmarked = query({
  args: {
    userId: v.id("users"),
    noodleId: v.id("noodles"),
  },
  handler: async (ctx, args) => {
    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId_noodleId", (q) =>
        q.eq("userId", args.userId).eq("noodleId", args.noodleId)
      )
      .first();
    return bookmark !== null;
  },
});

export const isBookmarkedBatch = query({
  args: {
    userId: v.id("users"),
    noodleIds: v.array(v.id("noodles")),
  },
  handler: async (ctx, args) => {
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const bookmarkedIds = new Set(bookmarks.map((b) => b.noodleId));
    const result: Record<string, boolean> = {};
    for (const noodleId of args.noodleIds) {
      result[noodleId] = bookmarkedIds.has(noodleId);
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
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId_noodleId", (q) =>
        q.eq("userId", args.userId).eq("noodleId", args.noodleId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { bookmarked: false };
    }

    await ctx.db.insert("bookmarks", {
      userId: args.userId,
      noodleId: args.noodleId,
      createdAt: Date.now(),
    });
    return { bookmarked: true };
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const users = await ctx.db.query("users").collect();
    const shops = await ctx.db.query("shops").collect();
    const userMap = new Map(users.map((u) => [u._id, u]));
    const shopMap = new Map(shops.map((s) => [s._id, s]));

    const items = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const noodle = await ctx.db.get(bookmark.noodleId);
        if (!noodle) return null;

        let imageUrl: string | null = null;
        let imageUrls: string[] = [];

        if (noodle.r2ImageUrls && noodle.r2ImageUrls.length > 0) {
          imageUrls = noodle.r2ImageUrls;
          imageUrl = imageUrls[0];
        } else if (noodle.r2ImageUrl) {
          imageUrl = noodle.r2ImageUrl;
          imageUrls = [noodle.r2ImageUrl];
        } else if (noodle.imageIds && noodle.imageIds.length > 0) {
          const urls = await Promise.all(
            noodle.imageIds.map((id) => ctx.storage.getUrl(id))
          );
          imageUrls = urls.filter((url): url is string => url !== null);
          imageUrl = imageUrls[0] || null;
        } else if (noodle.imageId) {
          imageUrl = await ctx.storage.getUrl(noodle.imageId);
          if (imageUrl) imageUrls = [imageUrl];
        }

        return {
          bookmarkId: bookmark._id,
          bookmarkedAt: bookmark.createdAt,
          ...noodle,
          user: userMap.get(noodle.userId) ?? null,
          shop: shopMap.get(noodle.shopId) ?? null,
          imageUrl,
          imageUrls,
        };
      })
    );

    return items.filter((item): item is NonNullable<typeof item> => item !== null);
  },
});

export const removeByNoodle = mutation({
  args: {
    userId: v.id("users"),
    noodleId: v.id("noodles"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId_noodleId", (q) =>
        q.eq("userId", args.userId).eq("noodleId", args.noodleId)
      )
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
