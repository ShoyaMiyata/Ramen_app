"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { PrefectureDetailModal } from "@/components/features/japan-map/prefecture-detail-modal";
import { BadgeCollection } from "@/components/features/prefecture-badge";
import {
  REGIONS,
  getPrefecturesByRegion,
  BADGE_TIERS,
  type PrefectureCode,
} from "@/lib/constants/prefectures";
import { useTheme } from "@/contexts/ThemeContext";
import { MapPin, Trophy, Check } from "lucide-react";

export default function MapPage() {
  const { user, isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();
  const [selectedPrefecture, setSelectedPrefecture] =
    useState<PrefectureCode | null>(null);

  const visitStats = useQuery(
    api.prefectures.getVisitStats,
    user?._id ? { userId: user._id } : "skip"
  );

  if (!isLoaded || !visitStats) {
    return <LoadingPage />;
  }

  const { prefectures, summary } = visitStats;

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5" style={{ color: themeColor }} />
        <h1 className="font-bold text-xl text-gray-900">制覇マップ</h1>
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4" style={{ color: themeColor }} />
          <span className="font-bold text-gray-900">統計</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold" style={{ color: themeColor }}>
              {summary.total}
            </div>
            <div className="text-xs text-gray-500">制覇</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div
              className="text-2xl font-bold"
              style={{ color: BADGE_TIERS.bronze.color }}
            >
              {summary.bronze}
            </div>
            <div className="text-xs text-gray-500">銅</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div
              className="text-2xl font-bold"
              style={{ color: BADGE_TIERS.silver.color }}
            >
              {summary.silver}
            </div>
            <div className="text-xs text-gray-500">銀</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div
              className="text-2xl font-bold"
              style={{ color: BADGE_TIERS.gold.color }}
            >
              {summary.gold}
            </div>
            <div className="text-xs text-gray-500">金</div>
          </div>
        </div>
      </div>

      {/* Region Progress */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-3">地方別進捗</h2>
        <div className="space-y-3">
          {REGIONS.map((region) => {
            const regionPrefectures = getPrefecturesByRegion(region.code);
            const visitedCount = regionPrefectures.filter(
              (p) => prefectures[p.code]
            ).length;
            const total = regionPrefectures.length;
            const progress = (visitedCount / total) * 100;
            const isComplete = visitedCount === total;

            return (
              <div key={region.code}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">{region.name}</span>
                    {isComplete && (
                      <Check
                        className="w-4 h-4"
                        style={{ color: themeColor }}
                      />
                    )}
                  </div>
                  <span className="text-gray-500">
                    {visitedCount}/{total}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: isComplete
                        ? BADGE_TIERS.gold.color
                        : themeColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge Collection */}
      {user && <BadgeCollection userId={user._id} showLocked />}

      {/* Prefecture List by Region */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-3">都道府県一覧</h2>
        <div className="space-y-4">
          {REGIONS.map((region) => {
            const regionPrefectures = getPrefecturesByRegion(region.code);

            return (
              <div key={region.code}>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {region.name}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {regionPrefectures.map((pref) => {
                    const data = prefectures[pref.code];
                    const tier = data?.tier;
                    const bgColor = tier
                      ? BADGE_TIERS[tier].color
                      : "#E9ECEF";
                    const textColor = tier ? "white" : "#6B7280";

                    return (
                      <button
                        key={pref.code}
                        onClick={() =>
                          setSelectedPrefecture(pref.code as PrefectureCode)
                        }
                        className="px-2 py-1 rounded text-xs font-medium transition-transform active:scale-95"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                        }}
                      >
                        {pref.name.replace(/[県府都道]$/, "")}
                        {data && (
                          <span className="ml-1 opacity-80">
                            ({data.visitCount})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prefecture Detail Modal */}
      {user && (
        <PrefectureDetailModal
          prefectureCode={selectedPrefecture}
          userId={user._id}
          onClose={() => setSelectedPrefecture(null)}
        />
      )}
    </div>
  );
}
