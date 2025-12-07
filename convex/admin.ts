import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// 管理者チェック用ヘルパー
async function requireAdmin(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user || !user.isAdmin) {
    throw new Error("管理者権限が必要です");
  }
  return user;
}

// ダッシュボード統計
export const getStats = query({
  args: { adminUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const users = await ctx.db.query("users").collect();
    const noodles = await ctx.db.query("noodles").collect();
    const feedbacks = await ctx.db.query("feedbacks").collect();

    const activeUsers = users.filter((u) => !u.deletedAt).length;
    const deletedUsers = users.filter((u) => u.deletedAt).length;

    const feedbacksByStatus = {
      new: feedbacks.filter((f) => !f.status || f.status === "new").length,
      in_progress: feedbacks.filter((f) => f.status === "in_progress").length,
      resolved: feedbacks.filter((f) => f.status === "resolved").length,
      rejected: feedbacks.filter((f) => f.status === "rejected").length,
    };

    return {
      users: {
        total: users.length,
        active: activeUsers,
        deleted: deletedUsers,
      },
      noodles: {
        total: noodles.length,
      },
      feedbacks: {
        total: feedbacks.length,
        byStatus: feedbacksByStatus,
      },
    };
  },
});

// ユーザー一覧（削除済み含む）
export const listUsers = query({
  args: { adminUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const users = await ctx.db.query("users").collect();

    // 各ユーザーの投稿数を取得
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const noodles = await ctx.db
          .query("noodles")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect();

        return {
          ...user,
          postCount: noodles.length,
        };
      })
    );

    // 作成日時の降順でソート
    return usersWithStats.sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
  },
});

// ユーザーソフトデリート
export const softDeleteUser = mutation({
  args: {
    adminUserId: v.id("users"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("ユーザーが見つかりません");
    }

    // 管理者自身は削除できない
    if (targetUser.isAdmin) {
      throw new Error("管理者は削除できません");
    }

    await ctx.db.patch(args.targetUserId, {
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

// ユーザー復元
export const restoreUser = mutation({
  args: {
    adminUserId: v.id("users"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("ユーザーが見つかりません");
    }

    await ctx.db.patch(args.targetUserId, {
      deletedAt: undefined,
    });

    return { success: true };
  },
});

// 投稿一覧
export const listNoodles = query({
  args: { adminUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const noodles = await ctx.db.query("noodles").collect();

    // ユーザーと店舗情報を付与
    const noodlesWithDetails = await Promise.all(
      noodles.map(async (noodle) => {
        const user = await ctx.db.get(noodle.userId);
        const shop = await ctx.db.get(noodle.shopId);
        const imageUrl = noodle.imageId
          ? await ctx.storage.getUrl(noodle.imageId)
          : null;

        return {
          ...noodle,
          user: user ? { _id: user._id, name: user.name, email: user.email } : null,
          shop: shop ? { _id: shop._id, name: shop.name } : null,
          imageUrl,
        };
      })
    );

    // 作成日時の降順でソート
    return noodlesWithDetails.sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
  },
});

// 投稿削除（ハードデリート）
export const deleteNoodle = mutation({
  args: {
    adminUserId: v.id("users"),
    noodleId: v.id("noodles"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const noodle = await ctx.db.get(args.noodleId);
    if (!noodle) {
      throw new Error("投稿が見つかりません");
    }

    // 画像削除
    if (noodle.imageId) {
      await ctx.storage.delete(noodle.imageId);
    }

    // 関連するいいねを削除
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_noodleId", (q) => q.eq("noodleId", args.noodleId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // 関連するコメントを削除
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_noodleId", (q) => q.eq("noodleId", args.noodleId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // 関連するマイベストを削除
    const myBests = await ctx.db.query("myBests").collect();
    for (const myBest of myBests) {
      if (myBest.noodleId === args.noodleId) {
        await ctx.db.delete(myBest._id);
      }
    }

    // 投稿を削除
    await ctx.db.delete(args.noodleId);

    return { success: true };
  },
});

// フィードバック一覧
export const listFeedbacks = query({
  args: { adminUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const feedbacks = await ctx.db.query("feedbacks").collect();

    // ユーザー情報を付与
    const feedbacksWithUser = await Promise.all(
      feedbacks.map(async (feedback) => {
        const user = await ctx.db.get(feedback.userId);
        return {
          ...feedback,
          user: user ? { _id: user._id, name: user.name, email: user.email } : null,
          status: feedback.status || "new", // デフォルトはnew
        };
      })
    );

    // 作成日時の降順でソート
    return feedbacksWithUser.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// フィードバックステータス更新
export const updateFeedbackStatus = mutation({
  args: {
    adminUserId: v.id("users"),
    feedbackId: v.id("feedbacks"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const feedback = await ctx.db.get(args.feedbackId);
    if (!feedback) {
      throw new Error("フィードバックが見つかりません");
    }

    // ステータス検証
    const validStatuses = ["new", "in_progress", "resolved", "rejected"];
    if (!validStatuses.includes(args.status)) {
      throw new Error("無効なステータスです");
    }

    await ctx.db.patch(args.feedbackId, {
      status: args.status,
    });

    return { success: true };
  },
});

// フィードバック削除
export const deleteFeedback = mutation({
  args: {
    adminUserId: v.id("users"),
    feedbackId: v.id("feedbacks"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const feedback = await ctx.db.get(args.feedbackId);
    if (!feedback) {
      throw new Error("フィードバックが見つかりません");
    }

    // 関連する湯気を削除
    const steams = await ctx.db
      .query("feedbackSteams")
      .withIndex("by_feedbackId", (q) => q.eq("feedbackId", args.feedbackId))
      .collect();

    for (const steam of steams) {
      await ctx.db.delete(steam._id);
    }

    // フィードバックを削除
    await ctx.db.delete(args.feedbackId);

    return { success: true };
  },
});

// 一括ユーザーソフトデリート
export const bulkSoftDeleteUsers = mutation({
  args: {
    adminUserId: v.id("users"),
    targetUserIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    let deletedCount = 0;
    for (const userId of args.targetUserIds) {
      const user = await ctx.db.get(userId);
      if (user && !user.isAdmin && !user.deletedAt) {
        await ctx.db.patch(userId, { deletedAt: Date.now() });
        deletedCount++;
      }
    }

    return { success: true, deletedCount };
  },
});

// 一括投稿削除
export const bulkDeleteNoodles = mutation({
  args: {
    adminUserId: v.id("users"),
    noodleIds: v.array(v.id("noodles")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    let deletedCount = 0;
    for (const noodleId of args.noodleIds) {
      const noodle = await ctx.db.get(noodleId);
      if (!noodle) continue;

      // 画像削除
      if (noodle.imageId) {
        await ctx.storage.delete(noodle.imageId);
      }

      // 関連するいいねを削除
      const likes = await ctx.db
        .query("likes")
        .withIndex("by_noodleId", (q) => q.eq("noodleId", noodleId))
        .collect();
      for (const like of likes) {
        await ctx.db.delete(like._id);
      }

      // 関連するコメントを削除
      const comments = await ctx.db
        .query("comments")
        .withIndex("by_noodleId", (q) => q.eq("noodleId", noodleId))
        .collect();
      for (const comment of comments) {
        await ctx.db.delete(comment._id);
      }

      // 関連するマイベストを削除
      const myBests = await ctx.db.query("myBests").collect();
      for (const myBest of myBests) {
        if (myBest.noodleId === noodleId) {
          await ctx.db.delete(myBest._id);
        }
      }

      // 投稿を削除
      await ctx.db.delete(noodleId);
      deletedCount++;
    }

    return { success: true, deletedCount };
  },
});

// 一括フィードバック削除
export const bulkDeleteFeedbacks = mutation({
  args: {
    adminUserId: v.id("users"),
    feedbackIds: v.array(v.id("feedbacks")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    let deletedCount = 0;
    for (const feedbackId of args.feedbackIds) {
      const feedback = await ctx.db.get(feedbackId);
      if (!feedback) continue;

      // 関連する湯気を削除
      const steams = await ctx.db
        .query("feedbackSteams")
        .withIndex("by_feedbackId", (q) => q.eq("feedbackId", feedbackId))
        .collect();
      for (const steam of steams) {
        await ctx.db.delete(steam._id);
      }

      // フィードバックを削除
      await ctx.db.delete(feedbackId);
      deletedCount++;
    }

    return { success: true, deletedCount };
  },
});
