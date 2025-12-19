import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * お問い合わせを送信
 */
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    category: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // メールアドレスの簡易バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("有効なメールアドレスを入力してください");
    }

    // 必須項目のバリデーション
    if (!args.name.trim() || !args.subject.trim() || !args.message.trim()) {
      throw new Error("すべての必須項目を入力してください");
    }

    // ログインユーザーの場合はuserIdも保存
    const identity = await ctx.auth.getUserIdentity();
    let userId = undefined;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (user) {
        userId = user._id;
      }
    }

    // お問い合わせを保存
    const contactId = await ctx.db.insert("contacts", {
      name: args.name,
      email: args.email,
      category: args.category,
      subject: args.subject,
      message: args.message,
      status: "new",
      userId,
      createdAt: Date.now(),
    });

    return {
      success: true,
      contactId,
    };
  },
});

/**
 * お問い合わせ一覧を取得（管理者用）
 */
export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 管理者チェック
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("認証が必要です");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user?.isAdmin) {
      throw new Error("管理者権限が必要です");
    }

    // お問い合わせ一覧を取得
    let contacts = await ctx.db
      .query("contacts")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    // ステータスでフィルタリング
    if (args.status) {
      contacts = contacts.filter((c) => c.status === args.status);
    }

    return contacts;
  },
});

/**
 * お問い合わせのステータスを更新（管理者用）
 */
export const updateStatus = mutation({
  args: {
    contactId: v.id("contacts"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // 管理者チェック
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("認証が必要です");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user?.isAdmin) {
      throw new Error("管理者権限が必要です");
    }

    // ステータスを更新
    await ctx.db.patch(args.contactId, {
      status: args.status,
    });

    return { success: true };
  },
});

