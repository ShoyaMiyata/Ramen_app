import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// フォロー機能が有効かどうかを確認するヘルパー
async function isFollowEnabled(ctx: { db: any }) {
  const setting = await ctx.db
    .query("appSettings")
    .withIndex("by_key", (q: any) => q.eq("key", "followEnabled"))
    .unique();

  // 設定がない場合はデフォルトで有効
  if (!setting) return true;

  try {
    return JSON.parse(setting.value) === true;
  } catch {
    return true;
  }
}

// フォロー機能が有効かどうかを取得（クライアント用）
export const getFollowEnabled = query({
  args: {},
  handler: async (ctx) => {
    return await isFollowEnabled(ctx);
  },
});

// フォローする（鍵アカウントの場合はリクエストを送信）
export const follow = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 自分自身はフォローできない
    if (args.followerId === args.followingId) {
      throw new Error("Cannot follow yourself");
    }

    // 既にフォローしているか確認（重複防止）
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    if (existingFollow) {
      return { type: "already_following" as const, id: existingFollow._id };
    }

    // フォロー対象のユーザー情報を取得
    const targetUser = await ctx.db.get(args.followingId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // 鍵アカウントの場合はフォローリクエストを送信
    if (targetUser.isPrivate) {
      // 既存のリクエストを確認
      const existingRequest = await ctx.db
        .query("followRequests")
        .withIndex("by_requester_target", (q) =>
          q.eq("requesterId", args.followerId).eq("targetId", args.followingId)
        )
        .first();

      if (existingRequest) {
        if (existingRequest.status === "pending") {
          return { type: "request_pending" as const, id: existingRequest._id };
        }
        // rejected の場合は再度リクエスト可能にする
        if (existingRequest.status === "rejected") {
          await ctx.db.patch(existingRequest._id, {
            status: "pending",
            updatedAt: Date.now(),
          });
          // 通知を作成（フォローリクエスト）- 重複チェック
          const existingNotification = await ctx.db
            .query("notifications")
            .withIndex("by_userId", (q) => q.eq("userId", args.followingId))
            .filter((q) =>
              q.and(
                q.eq(q.field("type"), "follow_request"),
                q.eq(q.field("fromUserId"), args.followerId),
                q.eq(q.field("isRead"), false)
              )
            )
            .first();
          if (!existingNotification) {
            await ctx.db.insert("notifications", {
              userId: args.followingId,
              type: "follow_request",
              fromUserId: args.followerId,
              isRead: false,
              createdAt: Date.now(),
            });
          }
          return { type: "request_sent" as const, id: existingRequest._id };
        }
        // approved の場合は承認済みリクエストを削除して新規リクエストを作成
        if (existingRequest.status === "approved") {
          await ctx.db.delete(existingRequest._id);
        }
      }

      // 新規リクエスト作成
      const requestId = await ctx.db.insert("followRequests", {
        requesterId: args.followerId,
        targetId: args.followingId,
        status: "pending",
        createdAt: Date.now(),
      });

      // 通知を作成（フォローリクエスト）- 重複チェック
      const existingNotification = await ctx.db
        .query("notifications")
        .withIndex("by_userId", (q) => q.eq("userId", args.followingId))
        .filter((q) =>
          q.and(
            q.eq(q.field("type"), "follow_request"),
            q.eq(q.field("fromUserId"), args.followerId),
            q.eq(q.field("isRead"), false)
          )
        )
        .first();
      if (!existingNotification) {
        await ctx.db.insert("notifications", {
          userId: args.followingId,
          type: "follow_request",
          fromUserId: args.followerId,
          isRead: false,
          createdAt: Date.now(),
        });
      }

      return { type: "request_sent" as const, id: requestId };
    }

    // 通常のフォロー処理
    const followId = await ctx.db.insert("follows", {
      followerId: args.followerId,
      followingId: args.followingId,
      createdAt: Date.now(),
    });

    // 通知を作成（フォローされた人に通知）
    await ctx.db.insert("notifications", {
      userId: args.followingId,
      type: "follow",
      fromUserId: args.followerId,
      isRead: false,
      createdAt: Date.now(),
    });

    return { type: "followed" as const, id: followId };
  },
});

// フォロー解除（またはフォローリクエストのキャンセル）
export const unfollow = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // フォロー関係を確認
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);

      // フォロー解除時に承認済みのリクエストも削除（再フォロー可能にするため）
      const existingRequest = await ctx.db
        .query("followRequests")
        .withIndex("by_requester_target", (q) =>
          q.eq("requesterId", args.followerId).eq("targetId", args.followingId)
        )
        .first();

      if (existingRequest && existingRequest.status === "approved") {
        await ctx.db.delete(existingRequest._id);
      }
      return;
    }

    // フォローリクエストを確認（pendingの場合はキャンセル）
    const existingRequest = await ctx.db
      .query("followRequests")
      .withIndex("by_requester_target", (q) =>
        q.eq("requesterId", args.followerId).eq("targetId", args.followingId)
      )
      .first();

    if (existingRequest && existingRequest.status === "pending") {
      await ctx.db.delete(existingRequest._id);
    }
  },
});

// フォロー状態を確認（フォロー中、リクエスト中、なし）
export const isFollowing = query({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    if (existing) {
      return true;
    }

    return false;
  },
});

// フォローリクエスト状態を取得
export const getFollowRequestStatus = query({
  args: {
    requesterId: v.id("users"),
    targetId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("followRequests")
      .withIndex("by_requester_target", (q) =>
        q.eq("requesterId", args.requesterId).eq("targetId", args.targetId)
      )
      .first();

    if (!request) {
      return null;
    }

    return request.status;
  },
});

// 受信したフォローリクエスト一覧を取得
export const getPendingRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("followRequests")
      .withIndex("by_targetId_status", (q) =>
        q.eq("targetId", args.userId).eq("status", "pending")
      )
      .collect();

    const users = await Promise.all(
      requests.map(async (request) => {
        const user = await ctx.db.get(request.requesterId);
        return {
          requestId: request._id,
          user,
          createdAt: request.createdAt,
        };
      })
    );

    return users.filter((u) => u.user !== null);
  },
});

// フォローリクエストを承認
export const approveRequest = mutation({
  args: {
    requestId: v.id("followRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== "pending") {
      throw new Error("Invalid request");
    }

    // リクエストを承認済みに更新
    await ctx.db.patch(args.requestId, {
      status: "approved",
      updatedAt: Date.now(),
    });

    // フォロー関係を作成
    await ctx.db.insert("follows", {
      followerId: request.requesterId,
      followingId: request.targetId,
      createdAt: Date.now(),
    });

    // 通知を作成（リクエスト承認）
    await ctx.db.insert("notifications", {
      userId: request.requesterId,
      type: "follow_request_approved",
      fromUserId: request.targetId,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

// フォローリクエストを拒否
export const rejectRequest = mutation({
  args: {
    requestId: v.id("followRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== "pending") {
      throw new Error("Invalid request");
    }

    // リクエストを拒否に更新
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      updatedAt: Date.now(),
    });
  },
});

// フォローリクエスト数を取得
export const getPendingRequestCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("followRequests")
      .withIndex("by_targetId_status", (q) =>
        q.eq("targetId", args.userId).eq("status", "pending")
      )
      .collect();

    return requests.length;
  },
});

// フォロー中のユーザー一覧
export const getFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", args.userId))
      .collect();

    const users = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followingId);
        return user;
      })
    );

    return users.filter((u) => u !== null);
  },
});

// フォロワー一覧
export const getFollowers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followingId", (q) => q.eq("followingId", args.userId))
      .collect();

    const users = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followerId);
        return user;
      })
    );

    return users.filter((u) => u !== null);
  },
});

// フォロー数・フォロワー数を取得
export const getCounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const following = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", args.userId))
      .collect();

    const followers = await ctx.db
      .query("follows")
      .withIndex("by_followingId", (q) => q.eq("followingId", args.userId))
      .collect();

    return {
      followingCount: following.length,
      followersCount: followers.length,
    };
  },
});

// フォロワーを削除（自分をフォローしている人を解除）
export const removeFollower = mutation({
  args: {
    userId: v.id("users"), // 自分（フォローされている側）
    followerId: v.id("users"), // 削除したいフォロワー
  },
  handler: async (ctx, args) => {
    // フォロー関係を確認
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { success: true };
    }

    return { success: false, message: "フォロー関係が見つかりません" };
  },
});
