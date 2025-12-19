/**
 * プラン制限チェック関数
 * Convex functions内で使用
 */

import { DatabaseReader } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export const PLAN_LIMITS = {
  free: {
    maxNoodlesPerMonth: 30,
    maxLikes: 50,
  },
  premium: {
    maxNoodlesPerMonth: Infinity,
    maxLikes: Infinity,
  },
} as const;

export type PlanType = "free" | "premium";

/**
 * 今月の開始タイムスタンプを取得
 */
function getMonthStartTimestamp(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

/**
 * ユーザーの今月の投稿数をカウント
 */
export async function countUserNoodlesThisMonth(
  db: DatabaseReader,
  userId: Id<"users">
): Promise<number> {
  const monthStart = getMonthStartTimestamp();

  const noodles = await db
    .query("noodles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  // createdAtフィールドで今月分をフィルタ
  const thisMonthNoodles = noodles.filter(
    (n) => n.createdAt && n.createdAt >= monthStart
  );

  return thisMonthNoodles.length;
}

/**
 * ユーザーのお気に入り総数をカウント
 */
export async function countUserLikes(
  db: DatabaseReader,
  userId: Id<"users">
): Promise<number> {
  const likes = await db
    .query("likes")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  return likes.length;
}

/**
 * ユーザーが投稿可能かチェック
 */
export async function canCreateNoodle(
  db: DatabaseReader,
  userId: Id<"users">
): Promise<{ allowed: boolean; reason?: string; current?: number; limit?: number }> {
  const user = await db.get(userId);
  if (!user) {
    return { allowed: false, reason: "ユーザーが見つかりません" };
  }

  const planType: PlanType = user.plan === "premium" ? "premium" : "free";
  const limit = PLAN_LIMITS[planType].maxNoodlesPerMonth;

  if (limit === Infinity) {
    return { allowed: true };
  }

  const currentCount = await countUserNoodlesThisMonth(db, userId);

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `今月の投稿上限（${limit}件）に達しました`,
      current: currentCount,
      limit,
    };
  }

  return { allowed: true, current: currentCount, limit };
}

/**
 * ユーザーがお気に入り追加可能かチェック
 */
export async function canCreateLike(
  db: DatabaseReader,
  userId: Id<"users">
): Promise<{ allowed: boolean; reason?: string; current?: number; limit?: number }> {
  const user = await db.get(userId);
  if (!user) {
    return { allowed: false, reason: "ユーザーが見つかりません" };
  }

  const planType: PlanType = user.plan === "premium" ? "premium" : "free";
  const limit = PLAN_LIMITS[planType].maxLikes;

  if (limit === Infinity) {
    return { allowed: true };
  }

  const currentCount = await countUserLikes(db, userId);

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `お気に入りの上限（${limit}件）に達しました`,
      current: currentCount,
      limit,
    };
  }

  return { allowed: true, current: currentCount, limit };
}
