"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { PrefectureBadgeIcon, PrefectureBadgeLocked } from "./prefecture-badge-icon";
import {
  PREFECTURES,
  REGIONS,
  getPrefecturesByRegion,
  type PrefectureCode,
  type BadgeTier,
} from "@/lib/constants/prefectures";
import { useTheme } from "@/contexts/ThemeContext";
import { Award } from "lucide-react";

interface BadgeCollectionProps {
  userId: Id<"users">;
  showLocked?: boolean;
  compact?: boolean;
}

export function BadgeCollection({
  userId,
  showLocked = true,
  compact = false,
}: BadgeCollectionProps) {
  const { themeColor } = useTheme();
  const badges = useQuery(api.prefectures.getUserBadges, { userId });

  if (!badges) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="h-2 bg-gray-100 rounded w-6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // バッジをマップに変換
  const badgeMap = new Map(
    badges.map((b) => [b.prefecture, b.tier as BadgeTier])
  );

  const earnedCount = badges.length;
  const totalCount = PREFECTURES.length;

  if (compact) {
    // コンパクト表示：獲得済みバッジのみ横スクロール
    if (badges.length === 0) {
      return null;
    }

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4" style={{ color: themeColor }} />
          <span className="font-bold text-gray-900">ご当地バッジ</span>
          <span className="text-sm text-gray-400">
            {earnedCount}/{totalCount}
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {badges.map((badge) => (
            <PrefectureBadgeIcon
              key={badge.prefecture}
              prefectureCode={badge.prefecture as PrefectureCode}
              tier={badge.tier as BadgeTier}
              size="sm"
              showName
            />
          ))}
        </div>
      </div>
    );
  }

  // フル表示：地方別にグループ化
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5" style={{ color: themeColor }} />
        <span className="font-bold text-gray-900 text-lg">ご当地バッジ</span>
        <span className="text-sm text-gray-400 ml-auto">
          {earnedCount}/{totalCount}
        </span>
      </div>

      <div className="space-y-6">
        {REGIONS.map((region) => {
          const regionPrefectures = getPrefecturesByRegion(region.code);
          const regionBadges = regionPrefectures.filter((p) =>
            badgeMap.has(p.code)
          );

          // このリージョンにバッジがない場合、showLockedがfalseならスキップ
          if (!showLocked && regionBadges.length === 0) {
            return null;
          }

          return (
            <div key={region.code}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-medium text-gray-500">
                  {region.name}
                </h3>
                <span className="text-xs text-gray-400">
                  {regionBadges.length}/{regionPrefectures.length}
                </span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                {regionPrefectures.map((pref) => {
                  const tier = badgeMap.get(pref.code);

                  if (tier) {
                    return (
                      <PrefectureBadgeIcon
                        key={pref.code}
                        prefectureCode={pref.code as PrefectureCode}
                        tier={tier}
                        size="sm"
                        showName
                      />
                    );
                  }

                  if (showLocked) {
                    return (
                      <PrefectureBadgeLocked
                        key={pref.code}
                        prefectureCode={pref.code as PrefectureCode}
                        size="sm"
                        showName
                      />
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
