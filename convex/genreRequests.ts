import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ジャンル申請一覧（ユーザー自身の申請）
export const myRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("ユーザーが見つかりません");

    const requests = await ctx.db
      .query("genreRequests")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return requests.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ジャンル申請一覧（管理者用）
export const listAll = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) throw new Error("管理者権限が必要です");

    let requests;
    if (args.status) {
      const status = args.status; // 型の絞り込み
      requests = await ctx.db
        .query("genreRequests")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    } else {
      requests = await ctx.db.query("genreRequests").collect();
    }

    // ユーザー情報を付加
    const requestsWithUser = await Promise.all(
      requests.map(async (request) => {
        const requestUser = await ctx.db.get(request.userId);
        let reviewedByUser = null;
        if (request.reviewedBy) {
          reviewedByUser = await ctx.db.get(request.reviewedBy);
        }
        return {
          ...request,
          user: requestUser,
          reviewedByUser,
        };
      })
    );

    return requestsWithUser.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ジャンル申請作成
export const create = mutation({
  args: {
    requestedGenre: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("ユーザーが見つかりません");

    // 同じジャンル名の申請が既にpending状態で存在しないかチェック
    const existingRequest = await ctx.db
      .query("genreRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const duplicate = existingRequest.find(
      (req) => req.requestedGenre === args.requestedGenre
    );

    if (duplicate) {
      throw new Error("このジャンルは既に申請されています");
    }

    // 既存のジャンルでないかチェック
    const genres = await ctx.db.query("genres").collect();
    const exists = genres.find(
      (g) => g.code === args.requestedGenre || g.label === args.requestedGenre
    );

    if (exists) {
      throw new Error("このジャンルは既に存在します");
    }

    return await ctx.db.insert("genreRequests", {
      userId: user._id,
      requestedGenre: args.requestedGenre,
      reason: args.reason,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// ジャンル申請承認
export const approve = mutation({
  args: {
    requestId: v.id("genreRequests"),
    finalGenreName: v.string(),
    reviewNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) throw new Error("管理者権限が必要です");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("申請が見つかりません");

    if (request.status !== "pending") {
      throw new Error("この申請は既に処理されています");
    }

    // 既存のジャンルでないかチェック
    const existingGenre = await ctx.db
      .query("genres")
      .withIndex("by_code", (q) => q.eq("code", args.finalGenreName))
      .first();

    if (existingGenre) {
      throw new Error("このジャンルコードは既に存在します");
    }

    // ジャンルを作成
    const allGenres = await ctx.db.query("genres").collect();
    const maxSortOrder = allGenres.length > 0
      ? Math.max(...allGenres.map(g => g.sortOrder))
      : -1;

    const now = Date.now();
    await ctx.db.insert("genres", {
      code: args.finalGenreName,
      label: args.finalGenreName,
      sortOrder: maxSortOrder + 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // 申請を承認状態に更新
    await ctx.db.patch(args.requestId, {
      status: "approved",
      reviewedBy: user._id,
      reviewedAt: now,
      reviewNote: args.reviewNote,
      finalGenreName: args.finalGenreName,
    });

    return { success: true };
  },
});

// ジャンル申請却下
export const reject = mutation({
  args: {
    requestId: v.id("genreRequests"),
    reviewNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) throw new Error("管理者権限が必要です");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("申請が見つかりません");

    if (request.status !== "pending") {
      throw new Error("この申請は既に処理されています");
    }

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      reviewedBy: user._id,
      reviewedAt: Date.now(),
      reviewNote: args.reviewNote,
    });

    return { success: true };
  },
});
