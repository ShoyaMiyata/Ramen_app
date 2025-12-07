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
import { ArrowLeft, Grid3X3, List, Crown, Sparkles, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "list" | "gallery";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = id as Id<"users">;

  const router = useRouter();
  const { user: currentUser, isLoaded } = useCurrentUser();
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const getOrCreateRoom = useMutation(api.chat.getOrCreateRoom);

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
  const menfluencerRank = useQuery(api.ranking.getMenfluencerRank, { userId });

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

  const handleStartChat = async () => {
    if (!currentUser) return;
    try {
      const roomId = await getOrCreateRoom({
        userId1: currentUser._id,
        userId2: userId,
      });
      router.push(`/chat/${roomId}`);
    } catch (error) {
      console.error("Failed to start chat:", error);
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
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full"
            >
              <img
                src={profileUser.imageUrl}
                alt={profileUser.name || ""}
                className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
            </button>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">
              {profileUser.name?.charAt(0) || "?"}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <h2 className="font-bold text-xl text-gray-900">
                {profileUser.name || "ユーザー"}
              </h2>
              {menfluencerRank?.isMenbassador && (
                <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500">{noodles?.length || 0}件の記録</p>
            {menfluencerRank?.isMenbassador ? (
              <div className="flex items-center gap-1 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-medium text-purple-500">
                  麺バサダー
                </span>
              </div>
            ) : menfluencerRank?.isMenfluencer ? (
              <div className="flex items-center gap-1 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-xs font-medium text-pink-400">
                  麺フルエンサー
                </span>
              </div>
            ) : null}
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

        {/* Follow Button & Message Button */}
        {!isOwnProfile && currentUser && (
          <div className="mt-4 flex gap-2">
            <Button
              variant={isFollowing ? "outline" : "default"}
              className="flex-1"
              onClick={handleFollowToggle}
              disabled={isSubmitting || isFollowing === undefined}
            >
              {isFollowing ? "フォロー中" : "フォローする"}
            </Button>
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={handleStartChat}
            >
              <MessageCircle className="w-4 h-4" />
              メッセージ
            </Button>
          </div>
        )}
      </div>

      {/* Rank Display */}
      <RankDisplay shopCount={shopCount} />

      {/* Conquest Map Link */}
      <Link
        href={`/users/${userId}/map`}
        className="block bg-white rounded-xl p-4 shadow-sm hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-700">制覇マップを見る</span>
          <span className="text-gray-400">→</span>
        </div>
      </Link>

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
              <NoodleCard key={noodle._id} noodle={noodle} showUser={false} currentUserId={currentUser?._id} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">まだ記録がありません</p>
          </div>
        )}
      </div>

      {/* Avatar Modal */}
      <Dialog.Root open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <AnimatePresence>
          {isAvatarModalOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 z-50"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  onClick={() => setIsAvatarModalOpen(false)}
                >
                  <Dialog.Close asChild>
                    <button
                      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                      aria-label="閉じる"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </Dialog.Close>
                  {profileUser.imageUrl && (
                    <motion.img
                      src={profileUser.imageUrl}
                      alt={profileUser.name || ""}
                      className="max-w-full max-h-full rounded-lg object-contain"
                      onClick={(e) => e.stopPropagation()}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.3 }}
                    />
                  )}
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </div>
  );
}
