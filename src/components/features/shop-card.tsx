"use client";

import Link from "next/link";
import { Doc } from "../../../convex/_generated/dataModel";
import { MapPin, Navigation, Star } from "lucide-react";

interface ShopCardProps {
  shop: Doc<"shops"> & {
    stats?: {
      totalPosts: number;
      visitorCount: number;
      avgRating: number;
    };
  };
}

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <Link
      href={`/shops/${shop._id}?from=search`}
      className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="space-y-2">
        <h3 className="font-bold text-gray-900 text-lg">{shop.name}</h3>

        <div className="space-y-1 text-sm text-gray-600">
          {shop.prefecture && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{shop.prefecture}</span>
            </div>
          )}

          {shop.station && (
            <div className="flex items-center gap-1">
              <Navigation className="w-4 h-4 flex-shrink-0" />
              <span>最寄り駅: {shop.station}</span>
            </div>
          )}

          {shop.address && (
            <div className="flex items-start gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{shop.address}</span>
            </div>
          )}
        </div>

        {shop.stats && (
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">投稿数:</span>
              <span className="text-sm font-medium text-gray-900">
                {shop.stats.totalPosts}件
              </span>
            </div>

            {shop.stats.avgRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">
                  {shop.stats.avgRating.toFixed(1)}
                </span>
              </div>
            )}

            {shop.stats.visitorCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">訪問者:</span>
                <span className="text-sm font-medium text-gray-900">
                  {shop.stats.visitorCount}人
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
