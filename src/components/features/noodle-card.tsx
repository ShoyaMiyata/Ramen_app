"use client";

import Link from "next/link";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import { Doc } from "../../../convex/_generated/dataModel";

interface NoodleCardProps {
  noodle: Doc<"noodles"> & {
    user?: Doc<"users"> | null;
    shop?: Doc<"shops"> | null;
    imageUrl?: string | null;
  };
  showUser?: boolean;
}

export function NoodleCard({ noodle, showUser = true }: NoodleCardProps) {
  return (
    <Link
      href={`/noodles/${noodle._id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* 画像がある場合は表示 */}
      {noodle.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={noodle.imageUrl}
            alt={noodle.ramenName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">
              {noodle.shop?.name || "不明な店舗"}
            </h3>
            <p className="text-sm text-gray-600 truncate">{noodle.ramenName}</p>
          </div>
          <StarRating value={noodle.evaluation} readonly size="sm" />
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {noodle.genres.map((genre) => (
            <Badge key={genre} rarity="common" className="text-[10px]">
              {genre}
            </Badge>
          ))}
        </div>

        {noodle.comment && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
            {noodle.comment}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          {showUser && noodle.user && (
            <span>{noodle.user.name}</span>
          )}
          {noodle.visitDate && (
            <span>{formatDate(noodle.visitDate)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
