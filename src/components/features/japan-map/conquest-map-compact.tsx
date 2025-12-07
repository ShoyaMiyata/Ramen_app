"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { JapanMapSVG } from "./japan-map-svg";
import { BADGE_TIERS } from "@/lib/constants/prefectures";
import { useTheme } from "@/contexts/ThemeContext";
import { MapPin, ChevronRight } from "lucide-react";

interface ConquestMapCompactProps {
  userId: Id<"users">;
  linkTo?: string;
  showLink?: boolean;
}

export function ConquestMapCompact({
  userId,
  linkTo = "/map",
  showLink = true,
}: ConquestMapCompactProps) {
  const { themeColor } = useTheme();
  const visitStats = useQuery(api.prefectures.getVisitStats, { userId });

  if (!visitStats) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="aspect-[4/3] bg-gray-100 rounded-lg" />
      </div>
    );
  }

  const { prefectures, summary } = visitStats;

  const prefectureData = Object.fromEntries(
    Object.entries(prefectures).map(([code, data]) => [
      code,
      { tier: data.tier, visitCount: data.visitCount },
    ])
  );

  const content = (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: themeColor }} />
          <span className="font-bold text-gray-900">制覇マップ</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="font-bold" style={{ color: themeColor }}>
            {summary.total}
          </span>
          <span className="text-gray-400">/47県</span>
          {showLink && (
            <ChevronRight className="w-4 h-4 text-gray-400 ml-1" />
          )}
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <JapanMapSVG
          prefectureData={prefectureData}
          className="w-full h-auto"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#E9ECEF" }}
          />
          <span className="text-gray-500">未訪問</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: BADGE_TIERS.bronze.color }}
          />
          <span className="text-gray-500">1+</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: BADGE_TIERS.silver.color }}
          />
          <span className="text-gray-500">5+</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: BADGE_TIERS.gold.color }}
          />
          <span className="text-gray-500">10+</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-bold" style={{ color: themeColor }}>
            {summary.total}
          </div>
          <div className="text-[10px] text-gray-400">制覇</div>
        </div>
        <div className="text-center">
          <div
            className="text-lg font-bold"
            style={{ color: BADGE_TIERS.bronze.color }}
          >
            {summary.bronze}
          </div>
          <div className="text-[10px] text-gray-400">銅</div>
        </div>
        <div className="text-center">
          <div
            className="text-lg font-bold"
            style={{ color: BADGE_TIERS.silver.color }}
          >
            {summary.silver}
          </div>
          <div className="text-[10px] text-gray-400">銀</div>
        </div>
        <div className="text-center">
          <div
            className="text-lg font-bold"
            style={{ color: BADGE_TIERS.gold.color }}
          >
            {summary.gold}
          </div>
          <div className="text-[10px] text-gray-400">金</div>
        </div>
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link href={linkTo} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
