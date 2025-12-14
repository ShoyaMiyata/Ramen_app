"use client";

import { TopShop } from "./types";
import { MapPin, Star, TrendingUp } from "lucide-react";

interface TopShopsListProps {
  data: TopShop[];
}

export function TopShopsList({ data }: TopShopsListProps) {
  // データを投稿数でソート（降順）してTOP10を取得
  const sortedData = [...data].sort((a, b) => b.postCount - a.postCount).slice(0, 10);

  // ランキング表示用のメダルカラー
  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"; // 金
      case 1:
        return "bg-gradient-to-br from-gray-300 to-gray-500 text-white"; // 銀
      case 2:
        return "bg-gradient-to-br from-amber-600 to-amber-800 text-white"; // 銅
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRankBorderColor = (index: number) => {
    switch (index) {
      case 0:
        return "border-yellow-500";
      case 1:
        return "border-gray-400";
      case 2:
        return "border-amber-700";
      default:
        return "border-gray-200";
    }
  };

  return (
    <div className="space-y-3">
      {sortedData.map((shop, index) => (
        <div
          key={shop._id}
          className={`
            bg-white rounded-lg p-4 border-2 transition-all duration-200
            hover:shadow-md hover:scale-[1.02]
            ${getRankBorderColor(index)}
          `}
        >
          <div className="flex items-start gap-3">
            {/* ランキング番号 */}
            <div
              className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                font-bold text-lg
                ${getRankColor(index)}
              `}
            >
              {index + 1}
            </div>

            {/* 店舗情報 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                {shop.name}
              </h3>

              {/* 場所情報 */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  {shop.station && shop.prefecture
                    ? `${shop.prefecture} / ${shop.station}`
                    : shop.station || shop.prefecture || "場所不明"}
                </span>
              </div>

              {/* 統計情報 */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-orange-600">
                    {shop.postCount}
                  </span>
                  <span className="text-gray-500">杯</span>
                </div>

                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-700">
                    {shop.averageRating.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {sortedData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">まだ人気店舗のデータがありません</p>
          <p className="text-sm mt-2">投稿を増やしてランキングを盛り上げましょう！</p>
        </div>
      )}
    </div>
  );
}
