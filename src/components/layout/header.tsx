"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useViewingUser } from "@/hooks/useViewingUser";
import { useUserStats } from "@/hooks/useUserStats";
import { useTheme } from "@/contexts/ThemeContext";
import { Soup, Home, Heart, Trophy, Search, Bell, UserPlus, X, MessageCircle, MessageSquare, BarChart3, TrendingUp, Users, Menu, Map as MapIcon, Settings, Info, Wrench, Shield, ExternalLink } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const { user, realUser } = useViewingUser();
  const { rank } = useUserStats(user?._id);
  const { themeColor } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    realUser?._id ? { userId: realUser._id } : "skip"
  );
  const notifications = useQuery(
    api.notifications.getByUser,
    realUser?._id ? { userId: realUser._id } : "skip"
  );
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleOpenChange = async (open: boolean) => {
    setIsNotificationOpen(open);
    if (open && realUser?._id && unreadCount && unreadCount > 0) {
      await markAllAsRead({ userId: realUser._id });
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

  // ログイン済みユーザーの場合は自分のマイページへ、未ログインの場合は /
  const homeHref = realUser?._id ? `/users/${realUser._id}` : "/";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={homeHref} className="flex items-center gap-2">
          <Soup className="w-6 h-6" style={{ color: themeColor }} />
          <span className="font-bold text-lg">Nooodle</span>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-1"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>

              {/* ハンバーガーメニューオーバーレイ */}
              {isMenuOpen && (
                <div
                  className="fixed inset-0 z-[60] bg-black/50 transition-opacity"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div
                    className="absolute top-0 left-0 bottom-0 w-64 bg-white shadow-xl flex flex-col transform transition-transform duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h2 className="font-bold text-lg text-gray-900">メニュー</h2>
                      <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6 text-gray-500" />
                      </button>
                    </div>

                    <div className="p-4 overflow-y-auto flex-1">
                      {/* ランク表示 */}
                      <div className="mb-6 p-4 bg-gray-50 rounded-xl flex flex-col items-center">
                        <div className="font-medium text-xs text-gray-500 mb-2">現在のランク</div>
                        <div
                          className="px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-sm"
                          style={{
                            background: rank.gradient || rank.color,
                          }}
                        >
                          {rank.name}
                        </div>
                      </div>

                      {/* メニュー項目 */}
                      <nav className="space-y-1">
                        <Link
                          href="/insights"
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <BarChart3 className="w-5 h-5 text-gray-500" />
                          <span>インサイト</span>
                        </Link>

                        <div className="my-2 border-t border-gray-100" />

                        <Link
                          href="/landing"
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Info className="w-5 h-5 text-gray-500" />
                          <span>Nooodleについて</span>
                        </Link>

                        <Link
                          href="/settings"
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5 text-gray-500" />
                          <span>設定</span>
                        </Link>

                        <Link
                          href="/mentenance"
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Wrench className="w-5 h-5 text-gray-500" />
                          <span>麺テナンス</span>
                        </Link>

                        {realUser?.isAdmin && (
                          <>
                            <div className="my-2 border-t border-gray-100" />
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl text-purple-700 font-medium transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Shield className="w-5 h-5 text-purple-500" />
                              <span>管理</span>
                            </Link>
                          </>
                        )}

                        <div className="my-2 border-t border-gray-100" />
                        <div className="px-3 py-2">
                          <h3 className="text-xs font-semibold text-gray-500 mb-2">外部サービス</h3>
                          <a
                            href="https://dolphins-seven.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <ExternalLink className="w-5 h-5 text-gray-500" />
                            <span>Dolphins</span>
                          </a>
                        </div>
                      </nav>
                    </div>
                  </div>
                </div>
              )}

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
                        notifications.map((notification) => {
                          // 管理者通知はリンクなし
                          const isAdminAnnouncement = notification.type === "admin_announcement";
                          const href = isAdminAnnouncement
                            ? "#"
                            : notification.type === "message"
                              ? `/chat/${notification.targetId}`
                              : notification.type === "comment" || notification.type === "like"
                                ? `/noodles/${notification.targetId}`
                                : notification.type === "follow_request"
                                  ? `/follow-requests`
                                  : notification.type === "rank_up"
                                    ? `/users/${notification.fromUserId}`
                                    : notification.type === "group_added"
                                      ? `/groups/${notification.targetId}`
                                      : `/users/${notification.fromUserId}`;

                          const handleClick = () => {
                            setIsNotificationOpen(false);
                          };

                          const content = (
                            <>
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: isAdminAnnouncement ? "#8B5CF620" : `${themeColor}20` }}
                              >
                                {notification.fromUser?.imageUrl ? (
                                  <img
                                    src={notification.fromUser.imageUrl}
                                    alt=""
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : notification.type === "admin_announcement" ? (
                                  <Bell className="w-5 h-5 text-purple-500" />
                                ) : notification.type === "message" ? (
                                  <MessageSquare className="w-5 h-5" style={{ color: themeColor }} />
                                ) : notification.type === "comment" ? (
                                  <MessageCircle className="w-5 h-5" style={{ color: themeColor }} />
                                ) : notification.type === "like" ? (
                                  <Heart className="w-5 h-5" style={{ color: themeColor }} />
                                ) : notification.type === "rank_up" ? (
                                  <TrendingUp className="w-5 h-5" style={{ color: themeColor }} />
                                ) : notification.type === "group_added" ? (
                                  <Users className="w-5 h-5" style={{ color: themeColor }} />
                                ) : (
                                  <UserPlus className="w-5 h-5" style={{ color: themeColor }} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                {notification.type === "admin_announcement" ? (
                                  <>
                                    <p className="text-sm font-medium text-purple-700">
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                      {notification.message}
                                    </p>
                                  </>
                                ) : (
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
                                    {notification.type === "rank_up" && (
                                      <span className="text-gray-600">
                                        さんが{notification.message}
                                      </span>
                                    )}
                                    {notification.type === "group_added" && (
                                      <span className="text-gray-600">
                                        さんがあなたを「{notification.message}」に追加しました
                                      </span>
                                    )}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {formatTime(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: isAdminAnnouncement ? "#8B5CF6" : themeColor }}
                                />
                              )}
                            </>
                          );

                          return isAdminAnnouncement ? (
                            <div
                              key={notification._id}
                              onClick={handleClick}
                              className={cn(
                                "flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 cursor-default",
                                !notification.isRead && "bg-purple-50/50"
                              )}
                            >
                              {content}
                            </div>
                          ) : (
                            <Link
                              key={notification._id}
                              href={href}
                              onClick={handleClick}
                              className={cn(
                                "flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0",
                                !notification.isRead && "bg-orange-50/50"
                              )}
                            >
                              {content}
                            </Link>
                          );
                        })
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
  const { realUser } = useViewingUser();

  const newTimelinePostsCount = useQuery(
    api.users.getNewTimelinePostsCount,
    realUser?._id ? { userId: realUser._id } : "skip"
  );

  const myProfileHref = realUser?._id ? `/users/${realUser._id}` : "/";

  const navItems = [
    { href: myProfileHref, icon: Home, label: "マイページ", isProfile: true },
    { href: "/noodles", icon: Soup, label: "タイムライン", badge: newTimelinePostsCount },
    { href: "/map", icon: MapIcon, label: "マップ" },
    { href: "/search", icon: Search, label: "検索" },
    { href: "/ranking", icon: Trophy, label: "ランキング" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          // プロフィールページの場合は / または /users/[id] がアクティブ
          const isActive = item.isProfile
            ? pathname === "/" || pathname === myProfileHref
            : pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 transition-colors relative"
              style={{
                color: isActive ? themeColor : "#6B7280",
              }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-bold text-white rounded-full px-0.5"
                    style={{ backgroundColor: themeColor }}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
