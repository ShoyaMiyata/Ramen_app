"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserStats } from "@/hooks/useUserStats";
import { useTheme } from "@/contexts/ThemeContext";
import { Soup, Home, Heart, Trophy, Search, Bell, UserPlus, X, MessageCircle, MessageSquare } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const { user } = useCurrentUser();
  const { rank } = useUserStats(user?._id);
  const { themeColor } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    user?._id ? { userId: user._id } : "skip"
  );
  const notifications = useQuery(
    api.notifications.getByUser,
    user?._id ? { userId: user._id } : "skip"
  );
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleOpenChange = async (open: boolean) => {
    setIsNotificationOpen(open);
    if (open && user?._id && unreadCount && unreadCount > 0) {
      await markAllAsRead({ userId: user._id });
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    return `${days}日前`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Soup className="w-6 h-6" style={{ color: themeColor }} />
          <span className="font-bold text-lg">Nooodle</span>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <div
                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  background: rank.gradient || rank.color,
                }}
              >
                {rank.name}
              </div>

              {/* 通知ベル */}
              <Popover.Root open={isNotificationOpen} onOpenChange={handleOpenChange}>
                <Popover.Trigger asChild>
                  <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount !== undefined && unreadCount > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
                        style={{ backgroundColor: themeColor }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                </Popover.Trigger>

                <Popover.Portal>
                  <Popover.Content
                    className="bg-white rounded-xl shadow-lg border border-gray-200 w-80 max-h-96 overflow-hidden z-50"
                    align="end"
                    sideOffset={8}
                  >
                    <div className="flex items-center justify-between p-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">通知</h3>
                      <Popover.Close asChild>
                        <button className="p-1 hover:bg-gray-100 rounded-full">
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </Popover.Close>
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                      {notifications === undefined ? (
                        // ローディング状態（スケルトン）
                        <div className="space-y-0">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 border-b border-gray-50 animate-pulse">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-1/3" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <Link
                            key={notification._id}
                            href={
                              notification.type === "message"
                                ? `/chat/${notification.targetId}`
                                : notification.type === "comment" || notification.type === "like"
                                  ? `/noodles/${notification.targetId}`
                                  : notification.type === "follow_request"
                                    ? `/follow-requests`
                                    : `/users/${notification.fromUserId}`
                            }
                            onClick={() => setIsNotificationOpen(false)}
                            className={cn(
                              "flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0",
                              !notification.isRead && "bg-orange-50/50"
                            )}
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${themeColor}20` }}
                            >
                              {notification.fromUser?.imageUrl ? (
                                <img
                                  src={notification.fromUser.imageUrl}
                                  alt=""
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : notification.type === "message" ? (
                                <MessageSquare className="w-5 h-5" style={{ color: themeColor }} />
                              ) : notification.type === "comment" ? (
                                <MessageCircle className="w-5 h-5" style={{ color: themeColor }} />
                              ) : notification.type === "like" ? (
                                <Heart className="w-5 h-5" style={{ color: themeColor }} />
                              ) : (
                                <UserPlus className="w-5 h-5" style={{ color: themeColor }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">
                                  {notification.fromUser?.name || "ユーザー"}
                                </span>
                                {notification.type === "follow" && (
                                  <span className="text-gray-600">
                                    さんがあなたをフォローしました
                                  </span>
                                )}
                                {notification.type === "follow_request" && (
                                  <span className="text-gray-600">
                                    さんからフォローリクエストが届きました
                                  </span>
                                )}
                                {notification.type === "follow_request_approved" && (
                                  <span className="text-gray-600">
                                    さんがフォローリクエストを承認しました
                                  </span>
                                )}
                                {notification.type === "like" && (
                                  <span className="text-gray-600">
                                    さんがあなたの投稿にいいねしました
                                  </span>
                                )}
                                {notification.type === "comment" && (
                                  <span className="text-gray-600">
                                    さんがあなたの投稿にコメントしました
                                  </span>
                                )}
                                {notification.type === "message" && (
                                  <span className="text-gray-600">
                                    さんからメッセージが届きました
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: themeColor }}
                              />
                            )}
                          </Link>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">まだ通知はありません</p>
                          <p className="text-xs text-gray-300 mt-1">
                            フォローやコメントがあると通知されます
                          </p>
                        </div>
                      )}
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </>
          )}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { themeColor } = useTheme();

  const navItems = [
    { href: "/", icon: Home, label: "マイページ" },
    { href: "/noodles", icon: Soup, label: "タイムライン" },
    { href: "/users", icon: Search, label: "友達を探す" },
    { href: "/likes", icon: Heart, label: "いいね" },
    { href: "/ranking", icon: Trophy, label: "ランキング" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 transition-colors"
              style={{
                color: isActive ? themeColor : "#6B7280",
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
