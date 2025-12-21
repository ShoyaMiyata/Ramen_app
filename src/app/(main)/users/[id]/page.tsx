"use client";

import { useState, useEffect, useRef } from "react";
import { use } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserStats } from "@/hooks/useUserStats";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoodleCard } from "@/components/features/noodle-card";
import { RankDisplay } from "@/components/features/rank-display";
import { TasteProfile } from "@/components/features/taste-profile";
import { BadgeDisplay, BadgeListModal } from "@/components/features/badge-display";
import { Gallery } from "@/components/features/gallery";
import { MyBestDisplay } from "@/components/features/my-best";
import { ArrowLeft, Grid3X3, List, Crown, Sparkles, MessageCircle, X, Lock, Clock, Heart, Pencil, Camera, Trash2, User, Plus, ChevronRight, SlidersHorizontal, MapPin, Settings, Wrench, Shield, Info, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useViewingUser } from "@/hooks/useViewingUser";
import { GENRES } from "@/lib/constants/genres";

type ViewMode = "list" | "gallery" | "likes";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = id as Id<"users">;

  const router = useRouter();
  const { user: currentUser, isLoaded } = useCurrentUser();
  const { user: viewingUser, realUser } = useViewingUser();
  const { themeColor } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [optimisticRequestPending, setOptimisticRequestPending] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 10;

  // プロフィール編集用
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [isBadgeListOpen, setIsBadgeListOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // フィルタ用
  const [showMyFilters, setShowMyFilters] = useState(false);
  const [mySearchText, setMySearchText] = useState("");
  const [mySelectedGenres, setMySelectedGenres] = useState<string[]>([]);
  const [myMinRating, setMyMinRating] = useState<number | undefined>();
  const [myMaxRating, setMyMaxRating] = useState<number | undefined>();

  const updateName = useMutation(api.users.updateName);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfileImage = useMutation(api.users.updateProfileImage);
  const removeProfileImage = useMutation(api.users.removeProfileImage);
  const profileImageUrl = useQuery(
    api.users.getProfileImageUrl,
    userId ? { userId } : "skip"
  );

  const getOrCreateRoom = useMutation(api.chat.getOrCreateRoom);

  const profileUser = useQuery(api.users.getById, { id: userId });
  const canViewProfile = useQuery(api.users.canViewProfile, {
    targetUserId: userId,
    viewerUserId: currentUser?._id,
  });
  const noodlesData = useQuery(
    api.noodles.getByUser,
    canViewProfile?.canView ? { userId, limit: LIMIT, offset } : "skip"
  );
  const galleryNoodles = useQuery(
    api.noodles.getGalleryByUser,
    canViewProfile?.canView ? { userId } : "skip"
  );
  const likedNoodles = useQuery(
    api.likes.getByUser,
    canViewProfile?.canView ? { userId } : "skip"
  );

  // 正確な店舗数を取得（全件データから計算）
  const userStats = useUserStats(userId);

  // 既読データを保持
  type NoodleItem = NonNullable<typeof noodlesData>["items"][number];
  const [allLoadedNoodles, setAllLoadedNoodles] = useState<NoodleItem[]>([]);

  useEffect(() => {
    if (noodlesData?.items) {
      setAllLoadedNoodles((prev) => {
        const existingIds = new Set(prev.map(n => n._id));
        const newItems = noodlesData.items.filter(n => !existingIds.has(n._id));
        return [...prev, ...newItems];
      });
    }
  }, [noodlesData]);

  useEffect(() => {
    if (offset === 0) {
      setAllLoadedNoodles([]);
    }
  }, [offset]);

  const loadMore = () => {
    if (noodlesData?.hasMore) {
      setOffset(prev => prev + LIMIT);
    }
  };
  const badges = useQuery(
    api.badges.getByUser,
    canViewProfile?.canView ? { userId } : "skip"
  );
  const userGroups = useQuery(
    api.groups.getByUser,
    currentUser?._id === userId && canViewProfile?.canView ? { userId } : "skip"
  );
  const followCounts = useQuery(api.follows.getCounts, { userId });
  const visitStats = useQuery(
    api.prefectures.getVisitStats,
    canViewProfile?.canView ? { userId } : "skip"
  );
  const isFollowing = useQuery(
    api.follows.isFollowing,
    currentUser?._id
      ? { followerId: currentUser._id, followingId: userId }
      : "skip"
  );
  // 鍵アカウントに関わらずリクエスト状態を取得（拒否後の再リクエスト対応）
  const followRequestStatus = useQuery(
    api.follows.getFollowRequestStatus,
    currentUser?._id
      ? { requesterId: currentUser._id, targetId: userId }
      : "skip"
  );

  const follow = useMutation(api.follows.follow);
  const unfollow = useMutation(api.follows.unfollow);

  // followRequestStatus が確定したらオプティミスティックな状態をリセット
  // ただし pending の場合はリセットしない（リクエスト中を維持）
  useEffect(() => {
    console.log("[Follow] useEffect: followRequestStatus =", followRequestStatus, "optimisticRequestPending =", optimisticRequestPending);
    if (followRequestStatus !== undefined && followRequestStatus !== "pending") {
      console.log("[Follow] Resetting optimisticRequestPending to false");
      setOptimisticRequestPending(false);
    }
  }, [followRequestStatus]);

  const menfluencerRank = useQuery(
    api.ranking.getMenfluencerRank,
    canViewProfile?.canView ? { userId } : "skip"
  );

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
  // 正確な店舗数（全件から計算）
  const shopCount = userStats.shopCount;
  const isPrivateAccount = profileUser?.isPrivate ?? false;
  const canView = canViewProfile?.canView ?? false;
  const isRequestPending = followRequestStatus === "pending" || optimisticRequestPending;

  const handleFollowToggle = async () => {
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      if (isFollowing) {
        await unfollow({ followerId: currentUser._id, followingId: userId });
        setOptimisticRequestPending(false);
      } else if (isRequestPending) {
        // リクエスト中の場合はキャンセル
        await unfollow({ followerId: currentUser._id, followingId: userId });
        setOptimisticRequestPending(false);
      } else {
        const result = await follow({ followerId: currentUser._id, followingId: userId });
        console.log("[Follow] result:", result, "isPrivate:", isPrivateAccount);
        // 鍵アカウントへのリクエストの場合、即座にUIを更新
        if (result?.type === "request_sent" || result?.type === "request_pending") {
          setOptimisticRequestPending(true);
          console.log("[Follow] Setting optimisticRequestPending to true");
        }
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
      {/* Profile Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
          {isOwnProfile ? (
            <button
              onClick={() => {
                setEditName(profileUser.name || "");
                setIsEditNameOpen(true);
              }}
              className="relative group"
            >
              {profileImageUrl || profileUser.imageUrl ? (
                <img
                  src={profileImageUrl || profileUser.imageUrl || ""}
                  alt={profileUser.name || ""}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pencil className="w-5 h-5 text-white" />
              </div>
            </button>
          ) : profileImageUrl || profileUser.imageUrl ? (
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full"
            >
              <img
                src={profileImageUrl || profileUser.imageUrl || ""}
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
              {isPrivateAccount && (
                <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              {menfluencerRank?.isMenbassador && (
                <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              {canView ? `${noodlesData?.totalCount || 0}件の記録` : "非公開アカウント"}
            </p>
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
              variant={isFollowing || isRequestPending ? "outline" : "default"}
              className="flex-1"
              onClick={handleFollowToggle}
              disabled={isSubmitting || isFollowing === undefined}
            >
              {isFollowing ? (
                "フォロー中"
              ) : isRequestPending ? (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  リクエスト中
                </span>
              ) : (
                "フォローする"
              )}
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

      {/* Private Account Message */}
      {!canView && !isOwnProfile && (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">このアカウントは非公開です</p>
          <p className="text-sm text-gray-400 mt-1">
            フォローすると記録を見ることができます
          </p>
        </div>
      )}

      {/* Content visible only when allowed */}
      {canView && (
        <>
          {/* Rank Display */}
          <RankDisplay shopCount={shopCount} />

          {/* Taste Profile */}
          <TasteProfile userId={userId} />

          {/* Conquest Map Link */}
          <Link
            href={`/users/${userId}/map`}
            className="block bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative hover:shadow-md transition-all"
          >
            <div
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-5"
              style={{ backgroundColor: themeColor }}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/users/${userId}/map`;
              }}
              className="w-full p-4 flex items-center justify-between relative"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" style={{ color: themeColor }} />
                <h2 className="font-bold text-gray-900">制覇マップを見る</h2>
                {visitStats && visitStats.summary.total > 0 && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    {visitStats.summary.total}都道府県
                  </span>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Link>

          {/* My Best */}
          <MyBestDisplay userId={userId} editable={isOwnProfile} />

          {/* New Record Button (自分のみ) */}
          {isOwnProfile && (
            <Link href="/noodles/new">
              <Button
                className="w-full gap-2 text-white"
                style={{ backgroundColor: themeColor }}
              >
                <Plus className="w-5 h-5" />
                一杯を記録する
              </Button>
            </Link>
          )}

          {/* Badges */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <button
              onClick={() => setIsBadgeListOpen(true)}
              className="w-full flex items-center justify-between mb-3"
            >
              <h2 className="font-bold text-gray-900">獲得バッジ</h2>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            {badges && badges.length > 0 ? (
              <BadgeDisplay userBadges={badges} />
            ) : (
              <p className="text-sm text-gray-400">まだバッジがありません</p>
            )}
          </div>

          {/* Groups */}
          {isOwnProfile && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <Link
                href="/groups"
                className="w-full flex items-center justify-between mb-3 group"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: themeColor }} />
                  <h2 className="font-bold text-gray-900">参加グループ</h2>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </Link>
              {userGroups && userGroups.length > 0 ? (
                <div className="space-y-2">
                  {userGroups.slice(0, 3).map((group) => (
                    <Link
                      key={group._id}
                      href={`/groups/${group._id}`}
                      className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {group.coverImageUrl ? (
                          <img
                            src={group.coverImageUrl}
                            alt={group.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${themeColor}20` }}
                          >
                            <Users className="w-5 h-5" style={{ color: themeColor }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{group.name}</p>
                          <p className="text-xs text-gray-500">
                            {group.memberCount}人のメンバー
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {userGroups.length > 3 && (
                    <Link
                      href="/groups"
                      className="block text-center py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      すべて見る ({userGroups.length}グループ)
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400 mb-2">まだグループに参加していません</p>
                  <Link href="/groups">
                    <Button
                      variant="outline"
                      className="gap-2"
                      style={{ borderColor: themeColor, color: themeColor }}
                    >
                      <Users className="w-4 h-4" />
                      グループを探す
                    </Button>
                  </Link>
                </div>
              )}
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
                  title="ギャラリー"
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
                  title="リスト"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("likes")}
                  className={cn(
                    "p-1.5 rounded",
                    viewMode === "likes"
                      ? "bg-white text-orange-500 shadow-sm"
                      : "text-gray-400"
                  )}
                  title="いいね"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>

            {viewMode === "gallery" ? (
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <Gallery noodles={galleryNoodles || []} />
              </div>
            ) : viewMode === "likes" ? (
              likedNoodles === undefined ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <p className="text-gray-400">読み込み中...</p>
                </div>
              ) : likedNoodles.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {isOwnProfile
                      ? "いいねした一杯はまだありません"
                      : "いいねした一杯はありません"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {likedNoodles.map((noodle) => (
                    <NoodleCard
                      key={noodle._id}
                      noodle={noodle}
                      currentUserId={currentUser?._id}
                    />
                  ))}
                </div>
              )
            ) : allLoadedNoodles.length > 0 ? (
              <>
                <div className="space-y-3">
                  {allLoadedNoodles.map((noodle) => (
                    <NoodleCard key={noodle._id} noodle={noodle} showUser={false} currentUserId={currentUser?._id} />
                  ))}
                </div>
                {noodlesData?.hasMore && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      className="w-full"
                    >
                      もっと見る ({noodlesData.totalCount - allLoadedNoodles.length}件)
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-500">まだ記録がありません</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer Links (自分のみ表示) */}
      {isOwnProfile && (
        <div className="flex items-center justify-center gap-4 py-3 text-sm text-gray-400">
          <Link
            href="/landing"
            className="flex items-center gap-1 hover:text-ramen-600 hover:font-medium transition-colors"
          >
            <Info className="w-3 h-3" />
            <span>Nooodleについて</span>
          </Link>
          <span>|</span>
          <Link
            href="/settings"
            className="flex items-center gap-1 hover:text-gray-600 transition-colors"
          >
            <Settings className="w-3 h-3" />
            <span>設定</span>
          </Link>
          <span>|</span>
          <Link
            href="/mentenance"
            className="flex items-center gap-1 hover:text-gray-600 transition-colors"
          >
            <Wrench className="w-3 h-3" />
            <span>麺テナンス</span>
          </Link>
          {realUser?.isAdmin && (
            <>
              <span>|</span>
              <Link
                href="/admin"
                className="flex items-center gap-1 hover:text-gray-600 transition-colors text-purple-600"
              >
                <Shield className="w-3 h-3" />
                <span>管理</span>
              </Link>
            </>
          )}
        </div>
      )}

      {/* Badge List Modal */}
      <BadgeListModal
        open={isBadgeListOpen}
        onOpenChange={setIsBadgeListOpen}
        earnedBadgeCodes={badges?.map((b) => b.badgeCode) || []}
      />

      {/* Edit Profile Dialog */}
      <Dialog.Root
        open={isEditNameOpen}
        onOpenChange={(open) => {
          setIsEditNameOpen(open);
          if (!open) {
            setPreviewImage(null);
            setSelectedFile(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-sm z-50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-bold text-gray-900">
                プロフィールを編集
              </Dialog.Title>
              <Dialog.Close className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </Dialog.Close>
            </div>
            <div className="space-y-4">
              {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {previewImage || profileImageUrl || profileUser.imageUrl ? (
                      <img
                        src={previewImage || profileImageUrl || profileUser.imageUrl || ""}
                        alt="プロフィール画像"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                      style={{ color: themeColor }}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setPreviewImage(ev.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {(profileImageUrl || profileUser.imageUrl || previewImage) && (
                    <button
                      onClick={async () => {
                        if (previewImage) {
                          setPreviewImage(null);
                          setSelectedFile(null);
                        } else if (userId) {
                          setIsUploadingImage(true);
                          try {
                            await removeProfileImage({ userId });
                          } finally {
                            setIsUploadingImage(false);
                          }
                        }
                      }}
                      className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      画像を削除
                    </button>
                  )}
                </div>

              {/* Name Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  名前
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="名前を入力"
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditNameOpen(false);
                    setPreviewImage(null);
                    setSelectedFile(null);
                  }}
                >
                  キャンセル
                </Button>
                <Button
                  className="flex-1"
                  disabled={!editName.trim() || isUploadingImage}
                  onClick={async () => {
                    if (!userId || !editName.trim()) return;

                    setIsUploadingImage(true);
                    try {
                      // 名前を更新
                      await updateName({
                        userId,
                        name: editName.trim(),
                      });

                      // 画像がある場合はアップロード
                      if (selectedFile) {
                        const uploadUrl = await generateUploadUrl();
                        const result = await fetch(uploadUrl, {
                          method: "POST",
                          headers: { "Content-Type": selectedFile.type },
                          body: selectedFile,
                        });
                        const { storageId } = await result.json();
                        await updateProfileImage({
                          userId,
                          imageId: storageId,
                        });
                      }

                      setIsEditNameOpen(false);
                      setPreviewImage(null);
                      setSelectedFile(null);
                    } finally {
                      setIsUploadingImage(false);
                    }
                  }}
                >
                  {isUploadingImage ? "保存中..." : "保存"}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
