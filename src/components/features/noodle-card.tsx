"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ImageWithPlaceholder } from "@/components/ui/image-placeholder";

interface NoodleCardProps {
  noodle: Doc<"noodles"> & {
    user?: Doc<"users"> | null;
    shop?: Doc<"shops"> | null;
    imageUrl?: string | null;
  };
  showUser?: boolean;
  currentUserId?: Id<"users">;
}

export function NoodleCard({ noodle, showUser = true, currentUserId }: NoodleCardProps) {
  const isLiked = useQuery(
    api.likes.isLiked,
    currentUserId ? { userId: currentUserId, noodleId: noodle._id } : "skip"
  );

  const likeCount = useQuery(api.likes.getCount, { noodleId: noodle._id });

  const commentCount = useQuery(api.comments.getCount, { noodleId: noodle._id });

  const toggleLike = useMutation(api.likes.toggle);

  const isOwner = currentUserId === noodle.userId;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId || isOwner) return;
    await toggleLike({ userId: currentUserId, noodleId: noodle._id });
  };

  return (
    <Link
      href={`/noodles/${noodle._id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* 画像がある場合は表示 */}
      {noodle.imageUrl && (
        <ImageWithPlaceholder
          src={noodle.imageUrl}
          alt={noodle.ramenName}
          aspectRatio="video"
          className="w-full"
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600">
              {noodle.shop?.name || "不明な店舗"}
              {noodle.shop?.station && (
                <span className="text-gray-400 ml-1">
                  （{noodle.shop.station}）
                </span>
              )}
            </p>
            <h3 className="font-bold text-gray-900 truncate">{noodle.ramenName}</h3>
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
          <div className="flex items-center gap-3">
            {showUser && noodle.user && (
              <span>{noodle.user.name}</span>
            )}
            {noodle.visitDate && (
              <span>{formatDate(noodle.visitDate)}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* コメント数 */}
            {commentCount !== undefined && commentCount > 0 && (
              <div className="flex items-center gap-1 text-gray-400">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs font-medium">{commentCount}</span>
              </div>
            )}

            {/* いいねボタン */}
            {currentUserId && !isOwner && (
              <button
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full transition-colors",
                  isLiked
                    ? "text-red-500 bg-red-50"
                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                )}
              >
                <Heart
                  className={cn("w-4 h-4", isLiked && "fill-current")}
                />
                {likeCount !== undefined && likeCount > 0 && (
                  <span className="text-xs font-medium">{likeCount}</span>
                )}
              </button>
            )}

            {/* 自分の投稿の場合はいいね数のみ表示 */}
            {currentUserId && isOwner && likeCount !== undefined && likeCount > 0 && (
              <div className="flex items-center gap-1 text-gray-400">
                <Heart className="w-4 h-4" />
                <span className="text-xs font-medium">{likeCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
