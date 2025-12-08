"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useViewingUser } from "@/hooks/useViewingUser";
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
import { Plus, ChevronRight, Grid3X3, List, Pencil, X, Wrench, Camera, Trash2, User, MapPin, Shield, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/contexts/ThemeContext";
import * as Dialog from "@radix-ui/react-dialog";

type ViewMode = "list" | "gallery";

export default function HomePage() {
  const { user, realUser, isLoaded, isTestMode } = useViewingUser();
  const { shopCount, postCount, badges, isLoading: statsLoading } = useUserStats(
    user?._id
  );
  const { themeColor } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [isBadgeListOpen, setIsBadgeListOpen] = useState(false);

  const updateName = useMutation(api.users.updateName);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfileImage = useMutation(api.users.updateProfileImage);
  const removeProfileImage = useMutation(api.users.removeProfileImage);
  const profileImageUrl = useQuery(
    api.users.getProfileImageUrl,
    user?._id ? { userId: user._id } : "skip"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const followingCount = useQuery(
    api.follows.getCounts,
    user?._id ? { userId: user._id } : "skip"
  );

  const myNoodles = useQuery(
    api.noodles.getByUser,
    user?._id ? { userId: user._id } : "skip"
  );

  const galleryNoodles = useQuery(
    api.noodles.getGalleryByUser,
    user?._id ? { userId: user._id } : "skip"
  );

  if (!isLoaded || statsLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <LoadingPage />;
  }

  const recentNoodles = myNoodles?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
          {isTestMode ? (
            // テストモード時は編集不可
            <div className="relative">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={user.name || ""}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setEditName(user.name || "");
                setIsEditNameOpen(true);
              }}
              className="relative group"
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={user.name || ""}
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
          )}
          <div>
            <Link href={`/users/${user._id}`}>
              <h1 className="font-bold text-xl text-gray-900 hover:underline">{user.name || "ユーザー"}</h1>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{postCount}杯を制覇</span>
              <span className="text-gray-300">|</span>
              <Link
                href="/mymen"
                className="hover:underline"
                style={{ color: themeColor }}
              >
                マイメン {followingCount?.followingCount ?? 0}
              </Link>
            </div>
          </div>
        </div>
      </div>

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
              {/* Profile Image */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {previewImage || profileImageUrl ? (
                    <img
                      src={previewImage || profileImageUrl || ""}
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
                {(profileImageUrl || previewImage) && (
                  <button
                    onClick={async () => {
                      if (previewImage) {
                        setPreviewImage(null);
                        setSelectedFile(null);
                      } else if (user._id) {
                        setIsUploadingImage(true);
                        try {
                          await removeProfileImage({ userId: user._id });
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
                    if (!user._id || !editName.trim()) return;

                    setIsUploadingImage(true);
                    try {
                      // 名前を更新
                      await updateName({
                        userId: user._id,
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
                          userId: user._id,
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

      {/* Rank Display */}
      <RankDisplay shopCount={shopCount} userId={user._id} />

      {/* Taste Profile */}
      <TasteProfile userId={user._id} />

      {/* My Best */}
      <MyBestDisplay userId={user._id} editable />

      {/* Badges */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <button
          onClick={() => setIsBadgeListOpen(true)}
          className="w-full flex items-center justify-between mb-3"
        >
          <h2 className="font-bold text-gray-900">獲得バッジ</h2>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        {badges.length > 0 ? (
          <BadgeDisplay userBadges={badges} />
        ) : (
          <p className="text-sm text-gray-400">まだバッジがありません</p>
        )}
      </div>

      <BadgeListModal
        open={isBadgeListOpen}
        onOpenChange={setIsBadgeListOpen}
        earnedBadgeCodes={badges.map((b) => b.badgeCode)}
      />

      {/* New Record Button (テストモード時は非表示) */}
      {!isTestMode && (
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

      {/* Records */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">啜ったラーメン</h2>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("gallery")}
                className={cn(
                  "p-1.5 rounded",
                  viewMode === "gallery"
                    ? "bg-white shadow-sm"
                    : "text-gray-400"
                )}
                style={viewMode === "gallery" ? { color: themeColor } : undefined}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded",
                  viewMode === "list"
                    ? "bg-white shadow-sm"
                    : "text-gray-400"
                )}
                style={viewMode === "list" ? { color: themeColor } : undefined}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            {myNoodles && myNoodles.length > 5 && viewMode === "list" && (
              <Link
                href="/noodles"
                className="text-sm flex items-center gap-1"
                style={{ color: themeColor }}
              >
                すべて
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {viewMode === "gallery" ? (
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <Gallery noodles={galleryNoodles || []} />
          </div>
        ) : recentNoodles.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-4">まだ記録がありません</p>
            <Link href="/noodles/new">
              <Button size="sm">最初の一杯を記録</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentNoodles.map((noodle) => (
              <NoodleCard key={noodle._id} noodle={noodle} showUser={false} currentUserId={user._id} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Links */}
      <div className="flex items-center justify-center gap-4 py-3 text-sm text-gray-400">
        <Link
          href="/map"
          className="hover:text-gray-600 transition-colors"
        >
          制覇マップ
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
    </div>
  );
}
