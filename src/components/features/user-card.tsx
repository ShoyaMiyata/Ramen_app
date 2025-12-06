"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { getRankByShopCount } from "@/lib/constants/ranks";
import { useState } from "react";

interface UserCardProps {
  user: Doc<"users">;
  currentUserId?: Id<"users">;
  showFollowButton?: boolean;
}

export function UserCard({
  user,
  currentUserId,
  showFollowButton = true,
}: UserCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const noodles = useQuery(api.noodles.getByUser, { userId: user._id });
  const followCounts = useQuery(api.follows.getCounts, { userId: user._id });
  const isFollowing = useQuery(
    api.follows.isFollowing,
    currentUserId
      ? { followerId: currentUserId, followingId: user._id }
      : "skip"
  );

  const follow = useMutation(api.follows.follow);
  const unfollow = useMutation(api.follows.unfollow);

  const shopCount = noodles
    ? new Set(noodles.map((n) => n.shopId)).size
    : 0;
  const rank = getRankByShopCount(shopCount);

  const handleFollowToggle = async () => {
    if (!currentUserId) return;

    setIsSubmitting(true);
    try {
      if (isFollowing) {
        await unfollow({ followerId: currentUserId, followingId: user._id });
      } else {
        await follow({ followerId: currentUserId, followingId: user._id });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Link href={`/users/${user._id}`} className="flex-shrink-0">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.name || ""}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
              {user.name?.charAt(0) || "?"}
            </div>
          )}
        </Link>

        <Link href={`/users/${user._id}`} className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">
            {user.name || "ユーザー"}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span
              className="px-2 py-0.5 rounded-full text-white text-xs"
              style={{ background: rank.gradient || rank.color }}
            >
              {rank.name}
            </span>
            <span>{noodles?.length || 0}件</span>
            {followCounts && (
              <>
                <span>•</span>
                <span>{followCounts.followersCount}フォロワー</span>
              </>
            )}
          </div>
        </Link>

        {showFollowButton && currentUserId && currentUserId !== user._id && (
          <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            onClick={handleFollowToggle}
            disabled={isSubmitting || isFollowing === undefined}
          >
            {isFollowing ? "フォロー中" : "フォロー"}
          </Button>
        )}
      </div>
    </div>
  );
}
