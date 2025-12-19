/**
 * プラン体系の定数
 */

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
 * ユーザーのプランタイプを取得（デフォルト: free）
 */
export function getUserPlanType(plan?: string | null): PlanType {
  return plan === "premium" ? "premium" : "free";
}

/**
 * 今月の開始タイムスタンプを取得
 */
export function getMonthStartTimestamp(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}
