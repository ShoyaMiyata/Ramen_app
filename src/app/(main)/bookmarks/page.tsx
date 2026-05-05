"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useViewingUser } from "@/hooks/useViewingUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { NoodleCard } from "@/components/features/noodle-card";
import { Bookmark } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function BookmarksPage() {
  const { user, isLoaded } = useViewingUser();
  const { themeColor } = useTheme();

  const bookmarks = useQuery(
    api.bookmarks.getByUser,
    user?._id ? { userId: user._id } : "skip"
  );

  if (!isLoaded) {
    return <LoadingPage />;
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <p className="text-gray-500">ログインしてください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bookmark className="w-5 h-5" style={{ color: themeColor }} />
        <h1 className="font-bold text-xl text-gray-900">保存した一杯</h1>
      </div>

      <p className="text-sm text-gray-500">気になる一杯をいつでも見返せる場所</p>

      {bookmarks === undefined ? (
        <Loading className="py-8" />
      ) : bookmarks.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">保存した一杯はまだありません</p>
          <p className="text-sm text-gray-400">気になる投稿のしおりアイコンをタップして保存してみよう</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((bookmark) => (
            <NoodleCard key={bookmark._id} noodle={bookmark} currentUserId={user._id} />
          ))}
        </div>
      )}
    </div>
  );
}
