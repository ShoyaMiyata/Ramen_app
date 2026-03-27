"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { getRankByShopCount } from "@/lib/constants/ranks";
import { useState } from "react";
import { Lock, Clock, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showFollowSuccess, setShowFollowSuccess] = useState(false);

  const noodles = useQuery(api.noodles.getByUser, { userId: user._id });
  const followCounts = useQuery(api.follows.getCounts, { userId: user._id });
  const isFollowing = useQuery(
    api.follows.isFollowing,
    currentUserId
      ? { followerId: currentUserId, followingId: user._id }
      : "skip"
  );
  // 鍵アカウントに関わらずリクエスト状態を取得（拒否後の再リクエスト対応）
  const followRequestStatus = useQuery(
    api.follows.getFollowRequestStatus,
    currentUserId
      ? { requesterId: currentUserId, targetId: user._id }
      : "skip"
  );

  const follow = useMutation(api.follows.follow);
  const unfollow = useMutation(api.follows.unfollow);

  const isRequestPending = followRequestStatus === "pending";

  const shopCount = noodles
    ? new Set(noodles.items.map((n) => n.shopId)).size
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
        setShowFollowSuccess(true);
        setTimeout(() => setShowFollowSuccess(false), 1500);
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
              loading="lazy"
              decoding="async"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
              {user.name?.charAt(0) || "?"}
            </div>
          )}
        </Link>

        <Link href={`/users/${user._id}`} className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate flex items-center gap-1">
            {user.name || "ユーザー"}
            {user.isPrivate && (
              <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            )}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span
              className="px-2 py-0.5 rounded-full text-white text-xs"
              style={{ background: rank.gradient || rank.color }}
            >
              {rank.name}
            </span>
            <span>{noodles?.totalCount || 0}件</span>
            {followCounts && (
              <>
                <span>•</span>
                <span>{followCounts.followersCount}フォロワー</span>
              </>
            )}
          </div>
        </Link>

        {showFollowButton && currentUserId && currentUserId !== user._id && (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant={isFollowing || isRequestPending ? "outline" : "default"}
              size="sm"
              onClick={handleFollowToggle}
              disabled={isSubmitting || isFollowing === undefined}
              className="relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {showFollowSuccess ? (
                  <motion.span
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                  </motion.span>
                ) : isFollowing ? (
                  <motion.span
                    key="following"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    フォロー中
                  </motion.span>
                ) : isRequestPending ? (
                  <motion.span
                    key="pending"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    申請中
                  </motion.span>
                ) : (
                  <motion.span
                    key="follow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    フォロー
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
