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

    // フォロー関係を削除（自分がフォローしているもの）
    const following = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", user._id))
      .collect();
    for (const follow of following) {
      await ctx.db.delete(follow._id);
    }

    // フォロワー関係を削除（自分をフォローしているもの）
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_followingId", (q) => q.eq("followingId", user._id))
      .collect();
    for (const follower of followers) {
      await ctx.db.delete(follower._id);
    }

    // フォローリクエストを削除（自分が送信したもの）
    const sentRequests = await ctx.db
      .query("followRequests")
      .withIndex("by_requesterId", (q) => q.eq("requesterId", user._id))
      .collect();
    for (const request of sentRequests) {
      await ctx.db.delete(request._id);
    }

    // フォローリクエストを削除（自分が受信したもの）
    const receivedRequests = await ctx.db
      .query("followRequests")
      .withIndex("by_targetId", (q) => q.eq("targetId", user._id))
      .collect();
    for (const request of receivedRequests) {
      await ctx.db.delete(request._id);
    }

    // ユーザーを論理削除
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

// テーマカラーのランクレベルを更新
export const updateThemeLevel = mutation({
  args: {
    userId: v.id("users"),
    themeLevel: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      selectedThemeLevel: args.themeLevel,
    });

    return args.userId;
  },
});

// 開発用：最初のユーザーを取得またはモックユーザーを作成
export const getDevUser = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const activeUser = users.find((u) => !u.deletedAt);
    return activeUser || null;
  },
});

export const createDevUser = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", "dev_user"))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId: "dev_user",
      name: "開発ユーザー",
      email: "dev@example.com",
      imageUrl: undefined,
    });
  },
});

// 画像アップロード用URL生成
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// プロフィール画像を更新
export const updateProfileImage = mutation({
  args: {
    userId: v.id("users"),
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // 古い画像があれば削除
    if (user.customImageId) {
      await ctx.storage.delete(user.customImageId);
    }

    await ctx.db.patch(args.userId, {
      customImageId: args.imageId,
    });

    return args.userId;
  },
});

// プロフィール画像を削除（Clerk画像に戻す）
export const removeProfileImage = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // 画像があれば削除
    if (user.customImageId) {
      await ctx.storage.delete(user.customImageId);
    }

    await ctx.db.patch(args.userId, {
      customImageId: undefined,
    });

    return args.userId;
  },
});

// ユーザーのプロフィール画像URLを取得
export const getProfileImageUrl = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // カスタム画像があればそれを優先
    if (user.customImageId) {
      return await ctx.storage.getUrl(user.customImageId);
    }

    // なければClerkの画像URL
    return user.imageUrl || null;
  },
});

// オンボーディング完了（ニックネーム登録）
export const completeOnboarding = mutation({
  args: {
    userId: v.id("users"),
    nickname: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // ニックネームのバリデーション
    const trimmedName = args.nickname.trim();
    if (trimmedName.length < 1 || trimmedName.length > 20) {
      throw new Error("ニックネームは1〜20文字で入力してください");
    }

    await ctx.db.patch(args.userId, {
      name: trimmedName,
      onboardingComplete: true,
    });

    return args.userId;
  },
});

// プライバシー設定を更新（鍵アカウントの切り替え）
export const updatePrivacy = mutation({
  args: {
    userId: v.id("users"),
    isPrivate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      isPrivate: args.isPrivate,
    });

    return args.userId;
  },
});

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

// プロフィール閲覧権限をチェック
export const canViewProfile = query({
  args: {
    targetUserId: v.id("users"),
    viewerUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser || targetUser.deletedAt) {
      return { canView: false, reason: "user_not_found" as const };
    }

    // フォロー機能が無効の場合は全員閲覧可能（鍵アカウント制限も無効化）
    const followEnabled = await isFollowEnabled(ctx);
    if (!followEnabled) {
      return { canView: true, reason: "follow_disabled" as const };
    }

    // 公開アカウントなら誰でも閲覧可能
    if (!targetUser.isPrivate) {
      return { canView: true, reason: "public" as const };
    }

    // 鍵アカウントの場合
    // ログインしていない場合は閲覧不可
    if (!args.viewerUserId) {
      return { canView: false, reason: "private_not_logged_in" as const };
    }

    // 自分自身のプロフィールは閲覧可能
    if (args.viewerUserId === args.targetUserId) {
      return { canView: true, reason: "own_profile" as const };
    }

    // フォローしていれば閲覧可能
    const isFollowing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", args.viewerUserId!).eq("followingId", args.targetUserId)
      )
      .first();

    if (isFollowing) {
      return { canView: true, reason: "following" as const };
    }

    return { canView: false, reason: "private_not_following" as const };
  },
});

// タイムライン訪問時刻を更新
export const updateTimelineVisit = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastTimelineVisit: Date.now(),
    });
  },
});

// タイムライン上の新規投稿数を取得
export const getNewTimelinePostsCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return 0;

    const lastVisit = user.lastTimelineVisit || 0;

    // フォロー中のユーザーを取得
    const following = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", args.userId))
      .collect();

    if (following.length === 0) return 0;

    const followingIds = following.map((f) => f.followingId);

    // lastVisit以降に投稿された、フォロー中のユーザーの投稿を数える
    const allNoodles = await ctx.db.query("noodles").collect();
    const newPosts = allNoodles.filter(
      (noodle) =>
        followingIds.includes(noodle.userId) &&
        noodle.createdAt &&
        noodle.createdAt > lastVisit
    );

    return newPosts.length;
  },
});
