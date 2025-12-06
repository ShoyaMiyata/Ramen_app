"use client";

import { useState } from "react";
import { use } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { NoodleCard } from "@/components/features/noodle-card";
import { RankDisplay } from "@/components/features/rank-display";
import { BadgeDisplay } from "@/components/features/badge-display";
import { Gallery } from "@/components/features/gallery";
import { MyBestDisplay } from "@/components/features/my-best";
import { ArrowLeft, Grid3X3, List } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ViewMode = "list" | "gallery";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = id as Id<"users">;

  const { user: currentUser, isLoaded } = useCurrentUser();
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileUser = useQuery(api.users.getById, { id: userId });
  const noodles = useQuery(api.noodles.getByUser, { userId });
  const galleryNoodles = useQuery(api.noodles.getGalleryByUser, { userId });
  const badges = useQuery(api.badges.getByUser, { userId });
  const followCounts = useQuery(api.follows.getCounts, { userId });
  const isFollowing = useQuery(
    api.follows.isFollowing,
    currentUser?._id
      ? { followerId: currentUser._id, followingId: userId }
      : "skip"
  );

  const follow = useMutation(api.follows.follow);
  const unfollow = useMutation(api.follows.unfollow);

  if (!isLoaded || profileUser === undefined) {
    return <LoadingPage />;
  }

  if (!profileUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ユーザーが見つかりません</p>
        <Link href="/users" className="text-orange-500 mt-2 inline-block">
          ユーザー一覧に戻る
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === userId;
  const shopCount = noodles
    ? new Set(noodles.map((n) => n.shopId)).size
    : 0;

  const handleFollowToggle = async () => {
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      if (isFollowing) {
        await unfollow({ followerId: currentUser._id, followingId: userId });
      } else {
        await follow({ followerId: currentUser._id, followingId: userId });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/users" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">プロフィール</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
          {profileUser.imageUrl ? (
            <img
              src={profileUser.imageUrl}
              alt={profileUser.name || ""}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">
              {profileUser.name?.charAt(0) || "?"}
            </div>
          )}
          <div className="flex-1">
            <h2 className="font-bold text-xl text-gray-900">
              {profileUser.name || "ユーザー"}
            </h2>
            <p className="text-sm text-gray-500">{noodles?.length || 0}件の記録</p>
          </div>
        </div>

        {/* Follow Stats */}
        {followCounts && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
            <Link
              href={`/users/${userId}/following`}
              className="text-center hover:bg-gray-50 px-3 py-1 rounded-lg"
            >
              <p className="font-bold text-gray-900">
                {followCounts.followingCount}
              </p>
              <p className="text-xs text-gray-500">フォロー中</p>
            </Link>
            <Link
              href={`/users/${userId}/followers`}
              className="text-center hover:bg-gray-50 px-3 py-1 rounded-lg"
            >
              <p className="font-bold text-gray-900">
                {followCounts.followersCount}
              </p>
              <p className="text-xs text-gray-500">フォロワー</p>
            </Link>
          </div>
        )}

        {/* Follow Button */}
        {!isOwnProfile && currentUser && (
          <div className="mt-4">
            <Button
              variant={isFollowing ? "outline" : "default"}
              className="w-full"
              onClick={handleFollowToggle}
              disabled={isSubmitting || isFollowing === undefined}
            >
              {isFollowing ? "フォロー中" : "フォローする"}
            </Button>
          </div>
        )}
      </div>

      {/* Rank Display */}
      <RankDisplay shopCount={shopCount} />

      {/* My Best */}
      <MyBestDisplay userId={userId} editable={isOwnProfile} />

      {/* Badges */}
      {badges && badges.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">獲得バッジ</h2>
          <BadgeDisplay userBadges={badges} />
        </div>
      )}

      {/* Records */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">記録</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("gallery")}
              className={cn(
                "p-1.5 rounded",
                viewMode === "gallery"
                  ? "bg-white text-orange-500 shadow-sm"
                  : "text-gray-400"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded",
                viewMode === "list"
                  ? "bg-white text-orange-500 shadow-sm"
                  : "text-gray-400"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === "gallery" ? (
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <Gallery noodles={galleryNoodles || []} />
          </div>
        ) : noodles && noodles.length > 0 ? (
          <div className="space-y-3">
            {noodles.map((noodle) => (
              <NoodleCard key={noodle._id} noodle={noodle} showUser={false} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">まだ記録がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
