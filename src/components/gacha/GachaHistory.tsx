"use client";

import { Star, Clock } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils/date";

interface GachaHistoryItem {
  _id: string;
  badgeCode: string;
  rarity: number;
  gachaType: string;
  createdAt: number;
  badge?: {
    name: string;
    icon: string;
    description: string;
  };
}

interface GachaHistoryProps {
  history: GachaHistoryItem[];
}

const RARITY_COLORS = {
  1: "text-gray-600 bg-gray-50 border-gray-200",
  2: "text-green-600 bg-green-50 border-green-200",
  3: "text-blue-600 bg-blue-50 border-blue-200",
  4: "text-purple-600 bg-purple-50 border-purple-200",
  5: "text-orange-600 bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-300",
};

const GACHA_TYPE_LABELS = {
  daily: "デイリー",
  ticket: "チケット",
  special: "特別",
};

export function GachaHistory({ history }: GachaHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">まだガチャを引いていません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((item) => {
        const colors = RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS[1];

        return (
          <div
            key={item._id}
            className={`flex items-center gap-3 p-3 rounded-xl border ${colors} transition-all hover:scale-[1.02]`}
          >
            {/* バッジアイコン */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 shadow-sm">
                <span className="text-2xl">{item.badge?.icon || "🍜"}</span>
              </div>
            </div>

            {/* 情報 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-sm truncate">
                  {item.badge?.name || item.badgeCode}
                </h4>
                {/* レアリティ星 */}
                <div className="flex gap-0.5">
                  {[...Array(item.rarity)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-0.5 rounded-full bg-white/50 border">
                  {GACHA_TYPE_LABELS[item.gachaType as keyof typeof GACHA_TYPE_LABELS] || item.gachaType}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(item.createdAt)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
