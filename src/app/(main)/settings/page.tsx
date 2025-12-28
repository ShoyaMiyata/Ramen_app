"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { useTheme } from "@/contexts/ThemeContext";
import { Settings, ChevronLeft, Lock, UserPlus, Bell, Shield, MessageSquare, Eye, Users as UsersIcon, Palette } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useUserStats } from "@/hooks/useUserStats";
import { ThemeSelector } from "@/components/features/theme-selector";

export default function SettingsPage() {
  const { user, isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();
  const { rank } = useUserStats(user?._id);

  const updatePrivacy = useMutation(api.users.updatePrivacy);
  const updatePostVisibility = useMutation(api.users.updatePostVisibility);
  const updateThemeLevel = useMutation(api.users.updateThemeLevel);
  const pendingRequestCount = useQuery(
    api.follows.getPendingRequestCount,
    user?._id ? { userId: user._id } : "skip"
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);

  const handlePrivacyToggle = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updatePrivacy({
        userId: user._id,
        isPrivate: !user.isPrivate,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVisibilityChange = async (visibility: "public" | "followers_and_groups") => {
    if (!user) return;
    setIsUpdatingVisibility(true);
    try {
      await updatePostVisibility({
        userId: user._id,
        postVisibility: visibility,
      });
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleThemeSelect = async (level: number) => {
    if (!user) return;
    setIsUpdatingTheme(true);
    try {
      await updateThemeLevel({
        userId: user._id,
        themeLevel: level,
      });
    } finally {
      setIsUpdatingTheme(false);
    }
  };

  if (!isLoaded) {
    return <LoadingPage />;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ログインしてください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <Settings className="w-6 h-6" style={{ color: themeColor }} />
        <h1 className="text-xl font-bold text-gray-900">設定</h1>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-900 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            プライバシー
          </h2>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">アカウントを非公開にする</p>
              <p className="text-sm text-gray-500 mt-0.5">
                フォロワーのみがあなたの記録を見ることができます
              </p>
            </div>
            <button
              onClick={handlePrivacyToggle}
              disabled={isUpdating}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors flex-shrink-0",
                user.isPrivate ? "bg-orange-500" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform",
                  user.isPrivate && "translate-x-5"
                )}
              />
            </button>
          </div>

          {/* 鍵アカウントの説明（常に表示） */}
          <div className={cn(
            "mt-4 p-3 rounded-lg space-y-2",
            user.isPrivate ? "bg-orange-50" : "bg-gray-50"
          )}>
            <p className={cn(
              "text-sm font-medium",
              user.isPrivate ? "text-orange-800" : "text-gray-700"
            )}>
              {user.isPrivate ? "🔒 鍵アカウントが有効です" : "🔓 鍵アカウントを有効にすると"}
            </p>
            <ul className={cn(
              "text-sm space-y-1 list-disc list-inside",
              user.isPrivate ? "text-orange-700" : "text-gray-500"
            )}>
              <li>あなたのプロフィールはフォロワーのみ閲覧可能</li>
              <li>タイムラインにはフォロワーにのみ表示</li>
              <li>フォローには承認が必要</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Post Visibility Settings */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-900 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            投稿の公開範囲
          </h2>
        </div>

        <div className="p-4 space-y-3">
          {/* Public Option */}
          <button
            onClick={() => handleVisibilityChange("public")}
            disabled={isUpdatingVisibility}
            className={cn(
              "w-full p-4 rounded-lg border-2 transition-colors text-left",
              (!user.postVisibility || user.postVisibility === "public")
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                (!user.postVisibility || user.postVisibility === "public")
                  ? "border-orange-500"
                  : "border-gray-300"
              )}>
                {(!user.postVisibility || user.postVisibility === "public") && (
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">タイムラインに表示する</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  全てのユーザーのタイムラインに投稿が表示されます
                </p>
              </div>
            </div>
          </button>

          {/* Followers and Groups Only Option */}
          <button
            onClick={() => handleVisibilityChange("followers_and_groups")}
            disabled={isUpdatingVisibility}
            className={cn(
              "w-full p-4 rounded-lg border-2 transition-colors text-left",
              user.postVisibility === "followers_and_groups"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                user.postVisibility === "followers_and_groups"
                  ? "border-orange-500"
                  : "border-gray-300"
              )}>
                {user.postVisibility === "followers_and_groups" && (
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">グループとフォロワーのみ</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  フォロワーとグループメンバーのみがあなたの投稿を見られます
                </p>
              </div>
            </div>
          </button>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <UsersIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>グループ内では設定に関わらず、メンバー全員に投稿が表示されます</span>
            </p>
          </div>
        </div>
      </div>

      {/* Follow Requests Link */}
      {user.isPrivate && (
        <Link
          href="/follow-requests"
          className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">フォローリクエスト</span>
          </div>
          <div className="flex items-center gap-2">
            {pendingRequestCount !== undefined && pendingRequestCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {pendingRequestCount}
              </span>
            )}
            <span className="text-gray-400">→</span>
          </div>
        </Link>
      )}

      {/* Admin Section */}
      {user.isAdmin && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-purple-600">管理者メニュー</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            <Link
              href="/admin/contacts"
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">お問い合わせ管理</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
      )}

      {/* Theme Color Settings */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-900 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            テーマカラー
          </h2>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-4">
            ランクを上げると新しいテーマカラーが解放されます
          </p>
          <ThemeSelector
            currentRank={rank}
            selectedThemeLevel={user.selectedThemeLevel}
            onThemeSelect={handleThemeSelect}
            isUpdating={isUpdatingTheme}
          />
        </div>
      </div>

      {/* Notifications Settings (placeholder) */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden opacity-50">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-900 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            通知
          </h2>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
