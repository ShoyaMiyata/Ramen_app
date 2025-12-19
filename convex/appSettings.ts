import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 設定キー定義
export const SETTING_KEYS = {
  POST_LOGIN_DESTINATION: "postLoginDestination", // "dashboard" | "landing"
} as const;

/**
 * アプリ設定を取得
 */
export const getSetting = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    return setting;
  },
});

/**
 * ログイン後の遷移先設定を取得
 */
export const getPostLoginDestination = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", SETTING_KEYS.POST_LOGIN_DESTINATION))
      .unique();

    // デフォルトは dashboard
    return setting ? JSON.parse(setting.value) : "dashboard";
  },
});

/**
 * アプリ設定を更新（管理者のみ）
 */
export const updateSetting = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("認証が必要です");
    }

    // 管理者チェック
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !user.isAdmin) {
      throw new Error("管理者権限が必要です");
    }

    // 既存の設定を検索
    const existingSetting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existingSetting) {
      // 更新
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    } else {
      // 新規作成
      await ctx.db.insert("appSettings", {
        key: args.key,
        value: args.value,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    }

    return { success: true };
  },
});

/**
 * ログイン後の遷移先設定を更新（管理者のみ）
 */
export const updatePostLoginDestination = mutation({
  args: {
    destination: v.union(v.literal("dashboard"), v.literal("landing")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("認証が必要です");
    }

    // 管理者チェック
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !user.isAdmin) {
      throw new Error("管理者権限が必要です");
    }

    // 既存の設定を検索
    const existingSetting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", SETTING_KEYS.POST_LOGIN_DESTINATION))
      .unique();

    const value = JSON.stringify(args.destination);

    if (existingSetting) {
      // 更新
      await ctx.db.patch(existingSetting._id, {
        value,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    } else {
      // 新規作成
      await ctx.db.insert("appSettings", {
        key: SETTING_KEYS.POST_LOGIN_DESTINATION,
        value,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    }

    return { success: true };
  },
});
