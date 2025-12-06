"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { UserCard } from "@/components/features/user-card";
import { useTheme } from "@/contexts/ThemeContext";
import { Users, ChevronLeft } from "lucide-react";

export default function MyMenPage() {
  const { user, isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();

  const following = useQuery(
    api.follows.getFollowing,
    user?._id ? { userId: user._id } : "skip"
  );

  if (!isLoaded) {
    return <LoadingPage />;
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
        <Users className="w-6 h-6" style={{ color: themeColor }} />
        <h1 className="text-xl font-bold text-gray-900">マイメン</h1>
      </div>

      <p className="text-sm text-gray-500">
        フォローしている仲間たちです
      </p>

      {/* ユーザー一覧 */}
      <div className="space-y-2">
        {following === undefined ? (
          <div className="text-center py-8 text-gray-400">読み込み中...</div>
        ) : following.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">まだマイメンがいません</p>
            <p className="text-sm text-gray-400 mt-1">
              「友達を探す」から仲間を見つけよう
            </p>
            <Link
              href="/users"
              className="inline-block mt-4 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              友達を探す
            </Link>
          </div>
        ) : (
          following.map((u) => (
            <UserCard key={u._id} user={u} currentUserId={user?._id} />
          ))
        )}
      </div>
    </div>
  );
}
