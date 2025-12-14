import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useViewingUser } from "./useViewingUser";
import { getRankByShopCount } from "@/lib/constants/ranks";
import {
  hasFeatureAccess,
  getUnlockProgress,
  getStatsDisplayLevel,
  type FeatureKey,
  FEATURE_REQUIREMENTS,
} from "@/lib/constants/feature-access";

/**
 * 機能アクセス制御のためのhook
 * テストモード時は表示中のユーザーのデータを参照
 */
export function useFeatureAccess(featureKey?: FeatureKey) {
  const { user } = useViewingUser();

  // ユーザーの訪問店舗数を取得
  const userStats = useQuery(
    api.users.getUserStats,
    user?._id ? { userId: user._id } : "skip"
  );

  return useMemo(() => {
    const shopCount = userStats?.visitedShopsCount ?? 0;
    const currentRank = getRankByShopCount(shopCount);
    const displayLevel = getStatsDisplayLevel(currentRank.level);

    // 特定の機能へのアクセス権をチェック
    const checkFeatureAccess = (key: FeatureKey) => {
      return hasFeatureAccess(key, currentRank, shopCount);
    };

    // 特定の機能のアンロック進捗を取得
    const getProgress = (key: FeatureKey) => {
      return getUnlockProgress(key, shopCount);
    };

    // 指定された機能のアクセス情報を返す
    if (featureKey) {
      const hasAccess = checkFeatureAccess(featureKey);
      const progress = getProgress(featureKey);
      const requirement = FEATURE_REQUIREMENTS[featureKey];

      return {
        hasAccess,
        progress,
        requirement,
        currentRank,
        shopCount,
        displayLevel,
        checkFeatureAccess,
        getProgress,
      };
    }

    // 全機能のアクセス情報を返す
    return {
      currentRank,
      shopCount,
      displayLevel,
      checkFeatureAccess,
      getProgress,
      // よく使う機能のショートカット
      canAccessConquestMap: checkFeatureAccess("conquestMap"),
      canAccessDetailedStats: checkFeatureAccess("detailedStats"),
    };
  }, [userStats, featureKey]);
}
