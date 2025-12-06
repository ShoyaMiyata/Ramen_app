"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default function ChatListPage() {
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();

  const rooms = useQuery(
    api.chat.getRooms,
    user?._id ? { userId: user._id } : "skip"
  );

  if (!isLoaded || rooms === undefined) {
    return <LoadingPage />;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ログインしてください</p>
      </div>
    );
  }

  const formatTimeAgo = (timestamp: number | undefined) => {
    if (!timestamp) return "";
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return `${days}日前`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-bold text-xl text-gray-900">メッセージ</h1>
      </div>

      {/* Chat Room List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {rooms.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">まだメッセージはありません</p>
            <p className="text-sm text-gray-400">
              ユーザーページからメッセージを送ってみましょう
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rooms.map((room) => (
              <Link
                key={room._id}
                href={`/chat/${room._id}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                {/* User Avatar */}
                {room.otherUser?.imageUrl ? (
                  <img
                    src={room.otherUser.imageUrl}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg flex-shrink-0">
                    {room.otherUser?.name?.charAt(0) || "?"}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900 truncate">
                      {room.otherUser?.name || "ユーザー"}
                    </p>
                    {room.lastMessage && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTimeAgo(room.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {room.lastMessage && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {room.lastMessage.senderId === user._id && (
                        <span className="text-gray-400">あなた: </span>
                      )}
                      {room.lastMessage.content}
                    </p>
                  )}
                </div>

                {/* Unread Badge */}
                {room.unreadCount > 0 && (
                  <span
                    className="min-w-[20px] h-5 flex items-center justify-center text-xs font-bold text-white rounded-full px-1.5 flex-shrink-0"
                    style={{ backgroundColor: themeColor }}
                  >
                    {room.unreadCount > 99 ? "99+" : room.unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
