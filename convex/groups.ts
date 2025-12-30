import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==============================
// Mutations
// ==============================

// グループを作成
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    coverImageId: v.optional(v.id("_storage")),
    userId: v.id("users"), // 作成者のユーザーID
  },
  handler: async (ctx, args) => {
    // グループ名のバリデーション
    const trimmedName = args.name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 50) {
      throw new Error("グループ名は1〜50文字で入力してください");
    }

    // 説明のバリデーション
    const trimmedDescription = args.description.trim();
    if (trimmedDescription.length > 500) {
      throw new Error("説明は500文字以内で入力してください");
    }

    // ユーザーの存在確認
    const user = await ctx.db.get(args.userId);
    if (!user || user.deletedAt) {
      throw new Error("ユーザーが見つかりません");
    }

    // 管理者チェック
    if (!user.isAdmin) {
      throw new Error("グループの作成は管理者のみ可能です");
    }

    // グループを作成
    const groupId = await ctx.db.insert("groups", {
      name: trimmedName,
      description: trimmedDescription,
      coverImageId: args.coverImageId,
      creatorId: args.userId,
      createdAt: Date.now(),
      memberCount: 1, // 作成者が最初のメンバー
      noodleCount: 0,
    });

    // 作成者を最初のメンバーとして追加
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: args.userId,
      joinedAt: Date.now(),
    });

    return groupId;
  },
});

// グループ情報を更新
export const update = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    description: v.string(),
    coverImageId: v.union(v.id("_storage"), v.null()),
    userId: v.id("users"), // 更新するユーザーID（権限チェック用）
  },
  handler: async (ctx, args) => {
    // グループの存在確認
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("グループが見つかりません");
    }

    // 作成者のみ更新可能
    if (group.creatorId !== args.userId) {
      throw new Error("グループの更新権限がありません");
    }

    // グループ名のバリデーション
    const trimmedName = args.name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 50) {
      throw new Error("グループ名は1〜50文字で入力してください");
    }

    // 説明のバリデーション
    const trimmedDescription = args.description.trim();
    if (trimmedDescription.length > 500) {
      throw new Error("説明は500文字以内で入力してください");
    }

    // カバー画像の処理
    let newCoverImageId = args.coverImageId;

    // 画像が明示的にnullに設定された場合（削除）
    if (args.coverImageId === null && group.coverImageId) {
      await ctx.storage.delete(group.coverImageId);
      newCoverImageId = undefined;
    }
    // 新しい画像が指定され、かつ古い画像と異なる場合
    else if (args.coverImageId && group.coverImageId && args.coverImageId !== group.coverImageId) {
      await ctx.storage.delete(group.coverImageId);
    }

    // グループ情報を更新
    await ctx.db.patch(args.groupId, {
      name: trimmedName,
      description: trimmedDescription,
      coverImageId: newCoverImageId,
    });

    return true;
  },
});

// グループを削除
export const remove = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"), // 削除するユーザーID（権限チェック用）
  },
  handler: async (ctx, args) => {
    // グループの存在確認
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("グループが見つかりません");
    }

    // 作成者のみ削除可能
    if (group.creatorId !== args.userId) {
      throw new Error("グループの削除権限がありません");
    }

    // グループメンバーを全て削除
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // カバー画像を削除
    if (group.coverImageId) {
      await ctx.storage.delete(group.coverImageId);
    }

    // グループを削除
    await ctx.db.delete(args.groupId);

    return true;
  },
});

// グループに参加
export const join = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // グループの存在確認
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("グループが見つかりません");
    }

    // 既にメンバーかどうか確認
    const existingMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (existingMembership) {
      throw new Error("既にグループに参加しています");
    }

    // メンバー数チェック（最大20人）
    if (group.memberCount >= 20) {
      throw new Error("グループの定員に達しています（最大20人）");
    }

    // グループメンバーに追加
    await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId: args.userId,
      joinedAt: Date.now(),
    });

    // メンバー数を更新
    await ctx.db.patch(args.groupId, {
      memberCount: group.memberCount + 1,
    });

    return true;
  },
});

// 他のユーザーをグループに追加（メンバーのみ実行可能）
export const addMember = mutation({
  args: {
    groupId: v.id("groups"),
    adderId: v.id("users"), // 追加する人のユーザーID
    targetUserId: v.id("users"), // 追加されるユーザーID
  },
  handler: async (ctx, args) => {
    // グループの存在確認
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("グループが見つかりません");
    }

    // 追加する人がメンバーかどうか確認
    const adderMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.adderId)
      )
      .first();

    if (!adderMembership) {
      throw new Error("グループメンバーのみがユーザーを追加できます");
    }

    // 追加されるユーザーの存在確認
    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser || targetUser.deletedAt) {
      throw new Error("ユーザーが見つかりません");
    }

    // 既にメンバーかどうか確認
    const existingMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.targetUserId)
      )
      .first();

    if (existingMembership) {
      throw new Error("既にグループに参加しています");
    }

    // メンバー数チェック（最大20人）
    if (group.memberCount >= 20) {
      throw new Error("グループの定員に達しています（最大20人）");
    }

    // グループメンバーに追加
    await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId: args.targetUserId,
      joinedAt: Date.now(),
    });

    // メンバー数を更新
    await ctx.db.patch(args.groupId, {
      memberCount: group.memberCount + 1,
    });

    // 通知を作成
    await ctx.db.insert("notifications", {
      userId: args.targetUserId, // 追加されたユーザーに通知
      type: "group_added",
      fromUserId: args.adderId, // 追加したユーザー
      targetId: args.groupId, // グループID
      message: group.name, // グループ名を保存
      isRead: false,
      createdAt: Date.now(),
    });

    return true;
  },
});

// グループから退出
export const leave = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // グループの存在確認
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("グループが見つかりません");
    }

    // 作成者は退出できない
    if (group.creatorId === args.userId) {
      throw new Error("グループの作成者は退出できません。グループを削除してください。");
    }

    // メンバーシップを確認
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("グループに参加していません");
    }

    // グループメンバーから削除
    await ctx.db.delete(membership._id);

    // メンバー数を更新
    await ctx.db.patch(args.groupId, {
      memberCount: group.memberCount - 1,
    });

    return true;
  },
});

// 画像アップロード用URL生成
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// グループの投稿数を更新
export const updateNoodleCount = mutation({
  args: {
    groupId: v.id("groups"),
    increment: v.number(), // 増減値（+1 or -1）
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("グループが見つかりません");
    }

    const newCount = Math.max(0, group.noodleCount + args.increment);
    await ctx.db.patch(args.groupId, {
      noodleCount: newCount,
    });

    return newCount;
  },
});

// ==============================
// Queries
// ==============================

// グループを取得
export const get = query({
  args: {
    groupId: v.id("groups"),
    viewerId: v.optional(v.id("users")), // 閲覧者のユーザーID
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      return null;
    }

    // カバー画像のURLを取得
    let coverImageUrl = null;
    if (group.coverImageId) {
      coverImageUrl = await ctx.storage.getUrl(group.coverImageId);
    }

    // 作成者情報を取得
    const creator = await ctx.db.get(group.creatorId);

    // 閲覧者が作成者かどうか
    const isCreator = args.viewerId ? group.creatorId === args.viewerId : false;

    // 閲覧者がメンバーかどうか
    let isMember = false;
    if (args.viewerId) {
      const viewerId = args.viewerId;
      const membership = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_and_user", (q) =>
          q.eq("groupId", args.groupId).eq("userId", viewerId)
        )
        .first();
      isMember = !!membership;
    }

    // グループメンバーの全投稿数を計算
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const memberUserIds = new Set(members.map((m) => m.userId));
    const allNoodles = await ctx.db.query("noodles").collect();
    const memberNoodlesCount = allNoodles.filter((n) =>
      memberUserIds.has(n.userId)
    ).length;

    return {
      ...group,
      noodleCount: memberNoodlesCount, // 計算した投稿数を使用
      coverImageUrl,
      creator,
      isCreator,
      isMember,
    };
  },
});

// グループ一覧を取得（ページネーション）
export const list = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    searchText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;

    let groups = await ctx.db
      .query("groups")
      .order("desc")
      .collect();

    // 検索テキストでフィルタ
    if (args.searchText) {
      const searchLower = args.searchText.toLowerCase();
      groups = groups.filter((group) =>
        group.name.toLowerCase().includes(searchLower) ||
        group.description.toLowerCase().includes(searchLower)
      );
    }

    // ページネーション
    const paginatedGroups = groups.slice(offset, offset + limit);

    // カバー画像URLと作成者情報を追加
    const enrichedGroups = await Promise.all(
      paginatedGroups.map(async (group) => {
        let coverImageUrl = null;
        if (group.coverImageId) {
          coverImageUrl = await ctx.storage.getUrl(group.coverImageId);
        }

        const creator = await ctx.db.get(group.creatorId);

        return {
          ...group,
          coverImageUrl,
          creator,
        };
      })
    );

    return {
      groups: enrichedGroups,
      total: groups.length,
      hasMore: offset + limit < groups.length,
    };
  },
});

// グループをIDで取得（シンプル版）
export const getById = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.groupId);
  },
});

// ユーザーが参加しているグループ一覧を取得
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // ユーザーが所属するグループメンバーシップを取得
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // 全ての投稿を取得（効率化のため一度だけ取得）
    const allNoodles = await ctx.db.query("noodles").collect();

    // グループ情報を取得
    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group) return null;

        // カバー画像のURLを取得
        let coverImageUrl: string | null = null;
        if (group.coverImageId) {
          coverImageUrl = await ctx.storage.getUrl(group.coverImageId);
        }

        // グループメンバーの全投稿数を計算
        const groupMembers = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (q) => q.eq("groupId", membership.groupId))
          .collect();

        const memberUserIds = new Set(groupMembers.map((m) => m.userId));
        const memberNoodlesCount = allNoodles.filter((n) =>
          memberUserIds.has(n.userId)
        ).length;

        return {
          ...group,
          noodleCount: memberNoodlesCount,
          coverImageUrl,
        };
      })
    );

    // nullを除外してソート（作成日時の新しい順）
    return groups
      .filter((g): g is NonNullable<typeof g> => g !== null)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ユーザーがグループのメンバーかどうかを確認
export const isMember = query({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    return !!membership;
  },
});

// グループのメンバー一覧を取得
export const getMembers = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    // グループの存在確認
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      return [];
    }

    // グループメンバーを取得
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // ユーザー情報を取得
    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        if (!user || user.deletedAt) return null;

        return {
          ...user,
          joinedAt: membership.joinedAt,
          isCreator: group.creatorId === user._id,
        };
      })
    );

    // nullを除外してソート（作成者を先頭、その後は参加日順）
    return members
      .filter((m) => m !== null)
      .sort((a, b) => {
        if (a!.isCreator) return -1;
        if (b!.isCreator) return 1;
        return a!.joinedAt - b!.joinedAt;
      });
  },
});
