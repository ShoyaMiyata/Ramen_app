import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ジャンル一覧取得（有効なもののみ）
export const list = query({
  args: {},
  handler: async (ctx) => {
    let genres = await ctx.db
      .query("genres")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // ジャンルが空の場合はデフォルトジャンルを返す
    if (genres.length === 0) {
      const defaultGenres = [
        { code: "醤油", label: "醤油", sortOrder: 0 },
        { code: "塩", label: "塩", sortOrder: 1 },
        { code: "味噌", label: "味噌", sortOrder: 2 },
        { code: "とんこつ", label: "とんこつ", sortOrder: 3 },
        { code: "家系", label: "家系", sortOrder: 4 },
        { code: "二郎系", label: "二郎系", sortOrder: 5 },
        { code: "魚介", label: "魚介", sortOrder: 6 },
        { code: "煮干し", label: "煮干し", sortOrder: 7 },
        { code: "つけ麺", label: "つけ麺", sortOrder: 8 },
        { code: "担々麺", label: "担々麺", sortOrder: 9 },
        { code: "鶏白湯", label: "鶏白湯", sortOrder: 10 },
        { code: "油そば・まぜそば", label: "油そば・まぜそば", sortOrder: 11 },
        { code: "背脂", label: "背脂", sortOrder: 12 },
        { code: "その他", label: "その他", sortOrder: 13 },
      ];
      return defaultGenres;
    }

    return genres.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// 全ジャンル取得（管理者用）
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) throw new Error("管理者権限が必要です");

    const genres = await ctx.db.query("genres").collect();
    return genres.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// ジャンル作成（管理者のみ）
export const create = mutation({
  args: {
    code: v.string(),
    label: v.string(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) throw new Error("管理者権限が必要です");

    // 既存チェック
    const existing = await ctx.db
      .query("genres")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existing) throw new Error("このジャンルコードは既に存在します");

    // sortOrderが指定されていない場合は最大値+1
    let sortOrder = args.sortOrder;
    if (sortOrder === undefined) {
      const allGenres = await ctx.db.query("genres").collect();
      sortOrder = allGenres.length > 0
        ? Math.max(...allGenres.map(g => g.sortOrder)) + 1
        : 0;
    }

    const now = Date.now();
    return await ctx.db.insert("genres", {
      code: args.code,
      label: args.label,
      sortOrder,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// ジャンル更新（管理者のみ）
export const update = mutation({
  args: {
    id: v.id("genres"),
    code: v.optional(v.string()),
    label: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) throw new Error("管理者権限が必要です");

    const genre = await ctx.db.get(args.id);
    if (!genre) throw new Error("ジャンルが見つかりません");

    // codeの重複チェック
    if (args.code && args.code !== genre.code) {
      const existing = await ctx.db
        .query("genres")
        .withIndex("by_code", (q) => q.eq("code", args.code))
        .first();
      if (existing) throw new Error("このジャンルコードは既に存在します");
    }

    const updateData: any = {
      updatedAt: Date.now(),
    };
    if (args.code !== undefined) updateData.code = args.code;
    if (args.label !== undefined) updateData.label = args.label;
    if (args.sortOrder !== undefined) updateData.sortOrder = args.sortOrder;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;

    await ctx.db.patch(args.id, updateData);
  },
});

// ジャンル削除（管理者のみ）
export const remove = mutation({
  args: {
    id: v.id("genres"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) throw new Error("管理者権限が必要です");

    // 使用チェック（既存のnoodlesで使われているか）
    const genre = await ctx.db.get(args.id);
    if (!genre) throw new Error("ジャンルが見つかりません");

    const noodles = await ctx.db.query("noodles").collect();
    const isUsed = noodles.some(n => n.genres.includes(genre.code));

    if (isUsed) {
      throw new Error("このジャンルは既に使用されているため削除できません。無効化してください。");
    }

    await ctx.db.delete(args.id);
  },
});

// 初期データ投入（管理者のみ）
export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("認証が必要です");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) throw new Error("管理者権限が必要です");

    const initialGenres = [
      { code: "醤油", label: "醤油" },
      { code: "塩", label: "塩" },
      { code: "味噌", label: "味噌" },
      { code: "とんこつ", label: "とんこつ" },
      { code: "家系", label: "家系" },
      { code: "二郎系", label: "二郎系" },
      { code: "魚介", label: "魚介" },
      { code: "煮干し", label: "煮干し" },
      { code: "つけ麺", label: "つけ麺" },
      { code: "担々麺", label: "担々麺" },
      { code: "鶏白湯", label: "鶏白湯" },
      { code: "油そば・まぜそば", label: "油そば・まぜそば" },
      { code: "背脂", label: "背脂" },
      { code: "その他", label: "その他" },
    ];

    const now = Date.now();
    let count = 0;

    for (let i = 0; i < initialGenres.length; i++) {
      const genre = initialGenres[i];

      // 既存チェック
      const existing = await ctx.db
        .query("genres")
        .withIndex("by_code", (q) => q.eq("code", genre.code))
        .first();

      if (!existing) {
        await ctx.db.insert("genres", {
          ...genre,
          sortOrder: i,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        count++;
      }
    }

    return { message: `${count}件のジャンルを追加しました` };
  },
});
