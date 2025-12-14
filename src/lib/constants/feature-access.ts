import { Rank } from "./ranks";

/**
 * 機能ごとのアクセス要件
 */
export const FEATURE_REQUIREMENTS = {
  // 制覇マップ - 麺歩き (Lv2, 5店舗) で解放
  conquestMap: {
    minLevel: 2,
    minShops: 5,
    featureName: "制覇マップ",
    description: "47都道府県の訪問状況を地図で確認できます",
  },
  // 詳細統計 - 麺探 (Lv3, 20店舗) で解放
  detailedStats: {
    minLevel: 3,
    minShops: 20,
    featureName: "詳細統計",
    description: "より詳しい統計情報と分析機能が利用できます",
  },
} as const;

export type FeatureKey = keyof typeof FEATURE_REQUIREMENTS;

/**
 * 統計情報の表示レベル
 */
export const STATS_DISPLAY_LEVEL = {
  // 麺見習い (Lv1): 基本統計のみ
  level1: {
    basicStats: true, // サマリーカード
    genreAnalysis: "limited", // ジャンル分析（上位3つのみ）
    regionalAnalysis: false, // 地域分析（完全ロック）
    monthlyTrend: false, // 月別推移（完全ロック）
    ratingDistribution: false, // 評価分布（完全ロック）
    topShops: false, // 人気店舗（完全ロック）
  },
  // 麺歩き (Lv2): 基本+一部詳細
  level2: {
    basicStats: true,
    genreAnalysis: "full", // 全ジャンル表示
    regionalAnalysis: "limited", // 地域分析（TOP5）
    monthlyTrend: "preview", // 月別推移（プレビュー）
    ratingDistribution: true, // 評価分布
    topShops: "limited", // 人気店舗（TOP3）
  },
  // 麺探以降 (Lv3+): 全機能
  level3Plus: {
    basicStats: true,
    genreAnalysis: "full",
    regionalAnalysis: "full", // 全地域
    monthlyTrend: "full", // 完全版
    ratingDistribution: true,
    topShops: "full", // 全店舗
  },
} as const;

/**
 * ランクレベルに応じた表示レベルを取得
 */
export function getStatsDisplayLevel(rankLevel: number) {
  if (rankLevel >= 3) {
    return STATS_DISPLAY_LEVEL.level3Plus;
  }
  if (rankLevel >= 2) {
    return STATS_DISPLAY_LEVEL.level2;
  }
  return STATS_DISPLAY_LEVEL.level1;
}

/**
 * 機能へのアクセス権を判定
 */
export function hasFeatureAccess(
  featureKey: FeatureKey,
  currentRank: Rank,
  shopCount: number
): boolean {
  const requirement = FEATURE_REQUIREMENTS[featureKey];
  return (
    currentRank.level >= requirement.minLevel &&
    shopCount >= requirement.minShops
  );
}

/**
 * アンロックまでの進捗を計算
 */
export function getUnlockProgress(
  featureKey: FeatureKey,
  shopCount: number
): {
  current: number;
  required: number;
  remaining: number;
  percentage: number;
} {
  const requirement = FEATURE_REQUIREMENTS[featureKey];
  const remaining = Math.max(0, requirement.minShops - shopCount);
  const percentage = Math.min(
    100,
    (shopCount / requirement.minShops) * 100
  );

  return {
    current: shopCount,
    required: requirement.minShops,
    remaining,
    percentage,
  };
}
