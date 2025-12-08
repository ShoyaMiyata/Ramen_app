"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { useTheme } from "@/contexts/ThemeContext";
import { Settings, ChevronLeft, Lock, UserPlus, Bell } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export default function SettingsPage() {
  const { user, isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();

  const updatePrivacy = useMutation(api.users.updatePrivacy);
  const pendingRequestCount = useQuery(
    api.follows.getPendingRequestCount,
    user?._id ? { userId: user._id } : "skip"
  );

  const [isUpdating, setIsUpdating] = useState(false);

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
                "relative w-12 h-7 rounded-full transition-colors",
                user.isPrivate ? "bg-orange-500" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform",
                  user.isPrivate ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {user.isPrivate && (
            <div className="mt-3 p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-700">
                鍵アカウントが有効です。新しいフォロワーはあなたの承認が必要になります。
              </p>
            </div>
          )}
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
