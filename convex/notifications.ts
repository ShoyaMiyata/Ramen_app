import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 通知一覧を取得
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);

    // fromUserIdを収集してバッチ取得（N+1対策）
    // fromUserIdがない通知（管理者通知など）は除外
    const fromUserIds = [...new Set(
      notifications
        .map((n) => n.fromUserId)
        .filter((id): id is NonNullable<typeof id> => id !== undefined)
    )];
    const fromUsers = await Promise.all(fromUserIds.map((id) => ctx.db.get(id)));
    const userMap = new Map(fromUserIds.map((id, i) => [id, fromUsers[i]]));

    // 通知にユーザー情報をマッピング
    const notificationsWithUser = notifications.map((notification) => ({
      ...notification,
      fromUser: notification.fromUserId ? userMap.get(notification.fromUserId) ?? null : null,
    }));

    return notificationsWithUser;
  },
});

// 未読通知数を取得
export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    return unread.length;
  },
});

// 通知を作成
export const create = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    fromUserId: v.id("users"),
    targetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 自分への通知は作成しない
    if (args.userId === args.fromUserId) {
      return null;
    }

    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      fromUserId: args.fromUserId,
      targetId: args.targetId,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

// 全ての通知を既読にする
export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    await Promise.all(
      unread.map((notification) =>
        ctx.db.patch(notification._id, { isRead: true })
      )
    );

    return unread.length;
  },
});

// 特定の通知を既読にする
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

// ランクアップ通知をフォロワー全員に送信
export const createRankUpNotifications = mutation({
  args: {
    userId: v.id("users"),
    rankName: v.string(),
    rankLevel: v.number(),
  },
  handler: async (ctx, args) => {
    // ユーザーのフォロワーを取得
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_followingId", (q) => q.eq("followingId", args.userId))
      .collect();

    // 各フォロワーに通知を作成
    const notifications = await Promise.all(
      followers.map((follow) =>
        ctx.db.insert("notifications", {
          userId: follow.followerId,
          type: "rank_up",
          fromUserId: args.userId,
          targetId: `rank_${args.rankLevel}`,
          message: `${args.rankName}にランクアップしました！`,
          isRead: false,
          createdAt: Date.now(),
        })
      )
    );

    return notifications.length;
  },
});
