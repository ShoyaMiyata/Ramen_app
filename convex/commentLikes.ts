import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// コメントのいいね数を取得
export const getCount = query({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("commentLikes")
      .withIndex("by_commentId", (q) => q.eq("commentId", args.commentId))
      .collect();

    return likes.length;
  },
});

// コメントのいいね数をバッチ取得
export const getCountBatch = query({
  args: { commentIds: v.array(v.id("comments")) },
  handler: async (ctx, args) => {
    const allLikes = await ctx.db.query("commentLikes").collect();
    const counts: Record<string, number> = {};
    for (const commentId of args.commentIds) {
      counts[commentId] = allLikes.filter((l) => l.commentId === commentId).length;
    }
    return counts;
  },
});

// 自分がいいねしているかチェック
export const isLiked = query({
  args: {
    userId: v.id("users"),
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("commentLikes")
      .withIndex("by_userId_commentId", (q) =>
        q.eq("userId", args.userId).eq("commentId", args.commentId)
      )
      .first();

    return !!like;
  },
});

// 複数コメントのいいね状態をバッチチェック
export const isLikedBatch = query({
  args: {
    userId: v.id("users"),
    commentIds: v.array(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("commentLikes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const likedCommentIds = new Set(likes.map((l) => l.commentId));
    const result: Record<string, boolean> = {};
    for (const commentId of args.commentIds) {
      result[commentId] = likedCommentIds.has(commentId);
    }
    return result;
  },
});

// いいねトグル（いいね/解除）
export const toggle = mutation({
  args: {
    userId: v.id("users"),
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    // 既存のいいねをチェック
    const existingLike = await ctx.db
      .query("commentLikes")
      .withIndex("by_userId_commentId", (q) =>
        q.eq("userId", args.userId).eq("commentId", args.commentId)
      )
      .first();

    if (existingLike) {
      // いいね解除
      await ctx.db.delete(existingLike._id);
      return { action: "unliked" as const };
    } else {
      // いいね追加
      await ctx.db.insert("commentLikes", {
        userId: args.userId,
        commentId: args.commentId,
        createdAt: Date.now(),
      });

      // コメント作成者に通知（自分自身へのいいねには通知しない）
      const comment = await ctx.db.get(args.commentId);
      if (comment && comment.userId !== args.userId) {
        await ctx.db.insert("notifications", {
          userId: comment.userId,
          type: "comment_like",
          fromUserId: args.userId,
          targetId: args.commentId,
          isRead: false,
          createdAt: Date.now(),
        });
      }

      return { action: "liked" as const };
    }
  },
});
