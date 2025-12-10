import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { ALL_BADGES, type AllBadgeCode } from "../src/lib/constants/badges";

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

    // フォロー関係を削除（自分がフォローしているもの）
    const following = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", args.targetUserId))
      .collect();
    for (const follow of following) {
      await ctx.db.delete(follow._id);
    }

    // フォロワー関係を削除（自分をフォローしているもの）
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_followingId", (q) => q.eq("followingId", args.targetUserId))
      .collect();
    for (const follower of followers) {
      await ctx.db.delete(follower._id);
    }

    // フォローリクエストを削除（自分が送信したもの）
    const sentRequests = await ctx.db
      .query("followRequests")
      .withIndex("by_requesterId", (q) => q.eq("requesterId", args.targetUserId))
      .collect();
    for (const request of sentRequests) {
      await ctx.db.delete(request._id);
    }

    // フォローリクエストを削除（自分が受信したもの）
    const receivedRequests = await ctx.db
      .query("followRequests")
      .withIndex("by_targetId", (q) => q.eq("targetId", args.targetUserId))
      .collect();
    for (const request of receivedRequests) {
      await ctx.db.delete(request._id);
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

// フィードバック一覧（対応中・新規のみ表示）
export const listFeedbacks = query({
  args: { adminUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const feedbacks = await ctx.db.query("feedbacks").collect();

    // 対応中・新規のみをフィルタ
    const filteredFeedbacks = feedbacks.filter(
      (f) => !f.status || f.status === "new" || f.status === "in_progress"
    );

    // ユーザー情報を付与
    const feedbacksWithUser = await Promise.all(
      filteredFeedbacks.map(async (feedback) => {
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
        // フォロー関係を削除（自分がフォローしているもの）
        const following = await ctx.db
          .query("follows")
          .withIndex("by_followerId", (q) => q.eq("followerId", userId))
          .collect();
        for (const follow of following) {
          await ctx.db.delete(follow._id);
        }

        // フォロワー関係を削除（自分をフォローしているもの）
        const followers = await ctx.db
          .query("follows")
          .withIndex("by_followingId", (q) => q.eq("followingId", userId))
          .collect();
        for (const follower of followers) {
          await ctx.db.delete(follower._id);
        }

        // フォローリクエストを削除（自分が送信したもの）
        const sentRequests = await ctx.db
          .query("followRequests")
          .withIndex("by_requesterId", (q) => q.eq("requesterId", userId))
          .collect();
        for (const request of sentRequests) {
          await ctx.db.delete(request._id);
        }

        // フォローリクエストを削除（自分が受信したもの）
        const receivedRequests = await ctx.db
          .query("followRequests")
          .withIndex("by_targetId", (q) => q.eq("targetId", userId))
          .collect();
        for (const request of receivedRequests) {
          await ctx.db.delete(request._id);
        }

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

// ======================
// アプリ設定（グローバル設定）
// ======================

// アプリ設定を取得
export const getAppSetting = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!setting) return null;

    try {
      return JSON.parse(setting.value);
    } catch {
      return setting.value;
    }
  },
});

// 全てのアプリ設定を取得（管理者用）
export const getAllAppSettings = query({
  args: { adminUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const settings = await ctx.db.query("appSettings").collect();

    return settings.map((s) => ({
      ...s,
      parsedValue: (() => {
        try {
          return JSON.parse(s.value);
        } catch {
          return s.value;
        }
      })(),
    }));
  },
});

// アプリ設定を更新
export const updateAppSetting = mutation({
  args: {
    adminUserId: v.id("users"),
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    const stringValue = typeof args.value === "string"
      ? args.value
      : JSON.stringify(args.value);

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: stringValue,
        updatedAt: Date.now(),
        updatedBy: args.adminUserId,
      });
    } else {
      await ctx.db.insert("appSettings", {
        key: args.key,
        value: stringValue,
        updatedAt: Date.now(),
        updatedBy: args.adminUserId,
      });
    }

    return { success: true };
  },
});

// ======================
// 管理者一斉通知
// ======================

// 通知送信先ユーザー一覧（選択用）
export const listUsersForNotification = query({
  args: { adminUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const users = await ctx.db.query("users").collect();

    // 削除されていないアクティブユーザーのみ
    return users
      .filter((u) => !u.deletedAt)
      .map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        imageUrl: u.imageUrl,
      }))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  },
});

// 管理者から一斉通知を送信
export const sendAnnouncement = mutation({
  args: {
    adminUserId: v.id("users"),
    targetUserIds: v.array(v.id("users")),
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    if (args.targetUserIds.length === 0) {
      throw new Error("送信先を選択してください");
    }

    if (!args.title.trim()) {
      throw new Error("タイトルを入力してください");
    }

    if (!args.message.trim()) {
      throw new Error("メッセージを入力してください");
    }

    const now = Date.now();
    let sentCount = 0;

    for (const userId of args.targetUserIds) {
      const user = await ctx.db.get(userId);
      if (!user || user.deletedAt) continue;

      await ctx.db.insert("notifications", {
        userId,
        type: "admin_announcement",
        title: args.title.trim(),
        message: args.message.trim(),
        isRead: false,
        createdAt: now,
      });
      sentCount++;
    }

    return { success: true, sentCount };
  },
});

// 全員に通知を送信
export const sendAnnouncementToAll = mutation({
  args: {
    adminUserId: v.id("users"),
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    if (!args.title.trim()) {
      throw new Error("タイトルを入力してください");
    }

    if (!args.message.trim()) {
      throw new Error("メッセージを入力してください");
    }

    const users = await ctx.db.query("users").collect();
    const activeUsers = users.filter((u) => !u.deletedAt);

    const now = Date.now();
    let sentCount = 0;

    for (const user of activeUsers) {
      await ctx.db.insert("notifications", {
        userId: user._id,
        type: "admin_announcement",
        title: args.title.trim(),
        message: args.message.trim(),
        isRead: false,
        createdAt: now,
      });
      sentCount++;
    }

    return { success: true, sentCount };
  },
});

// ======================
// バッジシミュレーション
// ======================

// ユーザーのバッジ一覧を取得
export const getUserBadges = query({
  args: {
    adminUserId: v.id("users"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .collect();

    return userBadges.map((ub) => ({
      ...ub,
      badge: ALL_BADGES[ub.badgeCode as AllBadgeCode],
    }));
  },
});

// バッジを付与
export const grantBadge = mutation({
  args: {
    adminUserId: v.id("users"),
    targetUserId: v.id("users"),
    badgeCode: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    // バッジが存在するか確認
    const badge = ALL_BADGES[args.badgeCode as AllBadgeCode];
    if (!badge) {
      throw new Error("無効なバッジコードです");
    }

    // すでに持っているか確認
    const existing = await ctx.db
      .query("userBadges")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .filter((q) => q.eq(q.field("badgeCode"), args.badgeCode))
      .unique();

    if (existing) {
      throw new Error("このバッジはすでに獲得済みです");
    }

    await ctx.db.insert("userBadges", {
      userId: args.targetUserId,
      badgeCode: args.badgeCode,
      acquiredAt: Date.now(),
    });

    return { success: true };
  },
});

// バッジを削除
export const revokeBadge = mutation({
  args: {
    adminUserId: v.id("users"),
    badgeId: v.id("userBadges"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const badge = await ctx.db.get(args.badgeId);
    if (!badge) {
      throw new Error("バッジが見つかりません");
    }

    await ctx.db.delete(args.badgeId);

    return { success: true };
  },
});

// ユーザーの全バッジを削除
export const revokeAllBadges = mutation({
  args: {
    adminUserId: v.id("users"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .collect();

    for (const badge of userBadges) {
      await ctx.db.delete(badge._id);
    }

    return { success: true, deletedCount: userBadges.length };
  },
});
