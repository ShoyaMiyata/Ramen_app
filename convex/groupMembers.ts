import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// グループに参加する（自由参加、承認不要）
export const join = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId, groupId } = args;

    // グループの存在確認
    const group = await ctx.db.get(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // 既にメンバーかどうか確認
    const existingMember = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", groupId).eq("userId", userId)
      )
      .first();

    if (existingMember) {
      return { success: false, message: "Already a member" };
    }

    // グループメンバーに追加
    await ctx.db.insert("groupMembers", {
      groupId,
      userId,
      joinedAt: Date.now(),
    });

    // グループのメンバー数をインクリメント
    await ctx.db.patch(groupId, {
      memberCount: group.memberCount + 1,
    });

    return { success: true };
  },
});

// グループから退出する
export const leave = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId, groupId } = args;

    // グループの存在確認
    const group = await ctx.db.get(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // 作成者は退出できない（削除が必要）
    if (group.creatorId === userId) {
      throw new Error("Creator cannot leave the group. Delete the group instead.");
    }

    // メンバーシップを確認
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", groupId).eq("userId", userId)
      )
      .first();

    if (!membership) {
      return { success: false, message: "Not a member" };
    }

    // メンバーシップを削除
    await ctx.db.delete(membership._id);

    // グループのメンバー数をデクリメント
    await ctx.db.patch(groupId, {
      memberCount: Math.max(0, group.memberCount - 1),
    });

    return { success: true };
  },
});

// メンバーを削除する（作成者のみ）
export const removeMember = mutation({
  args: {
    groupId: v.id("groups"),
    memberUserId: v.id("users"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { groupId, memberUserId, currentUserId } = args;

    // グループの存在確認
    const group = await ctx.db.get(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // 作成者であることを確認
    if (group.creatorId !== currentUserId) {
      throw new Error("Only the creator can remove members");
    }

    // 作成者は自分自身を削除できない
    if (memberUserId === currentUserId) {
      throw new Error("Creator cannot remove themselves");
    }

    // メンバーシップを確認
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", groupId).eq("userId", memberUserId)
      )
      .first();

    if (!membership) {
      return { success: false, message: "User is not a member" };
    }

    // メンバーシップを削除
    await ctx.db.delete(membership._id);

    // グループのメンバー数をデクリメント
    await ctx.db.patch(groupId, {
      memberCount: Math.max(0, group.memberCount - 1),
    });

    return { success: true };
  },
});

// グループのメンバー一覧を取得
export const getMembers = query({
  args: {
    groupId: v.id("groups"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    // グループメンバーを取得
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // ページネーション適用
    const paginatedMemberships = memberships
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .slice(offset, offset + limit);

    // ユーザー情報を取得
    const members = await Promise.all(
      paginatedMemberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        if (!user || user.deletedAt) return null;

        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          customImageId: user.customImageId,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return {
      members: members.filter((m) => m !== null),
      total: memberships.length,
      hasMore: offset + limit < memberships.length,
    };
  },
});

// グループのメンバー数を取得
export const getMemberCount = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) return 0;

    return group.memberCount;
  },
});

// ユーザーがメンバーかどうかをチェック
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

// 現在のユーザーがメンバーかどうかをチェック（認証済み）
export const isCurrentUserMember = query({
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

// ユーザーが参加しているグループ一覧を取得
export const getUserGroups = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        return group;
      })
    );

    return groups
      .filter((g) => g !== null)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});
