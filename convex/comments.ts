import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 投稿のコメント一覧を取得（ページネーション対応）
export const getByNoodle = query({
  args: {
    noodleId: v.id("noodles"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let query = ctx.db
      .query("comments")
      .withIndex("by_noodleId", (q) => q.eq("noodleId", args.noodleId))
      .order("asc");

    // カーソルがある場合、それ以降から取得
    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor);
      if (cursorDoc) {
        query = ctx.db
          .query("comments")
          .withIndex("by_noodleId", (q) => q.eq("noodleId", args.noodleId))
          .order("asc");
      }
    }

    const comments = await query.take(limit + 1);

    // 次ページがあるかチェック
    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore ? items[items.length - 1]._id : null;

    // ユーザーIDを収集してバッチ取得（N+1対策）
    const userIds = [...new Set(items.map((c) => c.userId))];
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    const userMap = new Map(userIds.map((id, i) => [id, users[i]]));

    // コメントにユーザー情報をマッピング
    const commentsWithUser = items.map((comment) => ({
      ...comment,
      user: userMap.get(comment.userId) ?? null,
    }));

    return {
      items: commentsWithUser,
      nextCursor,
      hasMore,
    };
  },
});

// コメント数を取得
export const getCount = query({
  args: { noodleId: v.id("noodles") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_noodleId", (q) => q.eq("noodleId", args.noodleId))
      .collect();

    return comments.length;
  },
});

// コメント数をバッチで取得
export const getCountBatch = query({
  args: { noodleIds: v.array(v.id("noodles")) },
  handler: async (ctx, args) => {
    const allComments = await ctx.db.query("comments").collect();
    const counts: Record<string, number> = {};
    for (const noodleId of args.noodleIds) {
      counts[noodleId] = allComments.filter((c) => c.noodleId === noodleId).length;
    }
    return counts;
  },
});

// コメントを投稿
export const create = mutation({
  args: {
    noodleId: v.id("noodles"),
    userId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // コンテンツの検証（空文字、長すぎる文字列を防ぐ）
    const content = args.content.trim();
    if (content.length === 0) {
      throw new Error("コメントを入力してください");
    }
    if (content.length > 500) {
      throw new Error("コメントは500文字以内で入力してください");
    }

    // コメントを作成
    const commentId = await ctx.db.insert("comments", {
      noodleId: args.noodleId,
      userId: args.userId,
      content,
      createdAt: Date.now(),
    });

    // 投稿者に通知を送る（自分自身のコメントには通知しない）
    const noodle = await ctx.db.get(args.noodleId);
    if (noodle && noodle.userId !== args.userId) {
      await ctx.db.insert("notifications", {
        userId: noodle.userId,
        type: "comment",
        fromUserId: args.userId,
        targetId: args.noodleId,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return commentId;
  },
});

// コメントを削除（自分のコメントのみ削除可能）
export const remove = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("コメントが見つかりません");
    }
    if (comment.userId !== args.userId) {
      throw new Error("自分のコメントのみ削除できます");
    }

    await ctx.db.delete(args.commentId);
  },
});
