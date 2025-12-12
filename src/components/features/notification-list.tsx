"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, UserPlus, UserCheck, Bell } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Id } from "../../../convex/_generated/dataModel";

type Notification = {
  _id: Id<"notifications">;
  type: string;
  fromUser: { _id: Id<"users">; name?: string; imageUrl?: string } | null;
  targetId?: string;
  title?: string;
  message?: string;
  isRead: boolean;
  createdAt: number;
};

interface NotificationListProps {
  notifications: Notification[];
  themeColor: string;
}

export function NotificationList({ notifications, themeColor }: NotificationListProps) {
  const router = useRouter();
  const markAsRead = useMutation(api.notifications.markAsRead);
  const [mounted, setMounted] = useState(false);

  // クライアント側でのみ時刻を表示（ハイドレーションエラー回避）
  useEffect(() => {
    setMounted(true);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case "follow_request":
        return <UserPlus className="w-5 h-5 text-orange-500" />;
      case "follow_request_approved":
        return <UserCheck className="w-5 h-5 text-green-500" />;
      case "admin_announcement":
        return <Bell className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const userName = notification.fromUser?.name || "誰か";

    switch (notification.type) {
      case "like":
        return `${userName}さんがあなたの投稿にいいねしました`;
      case "comment":
        return `${userName}さんがコメントしました`;
      case "follow":
        return `${userName}さんがあなたをフォローしました`;
      case "follow_request":
        return `${userName}さんからフォローリクエストが届きました`;
      case "follow_request_approved":
        return `${userName}さんがフォローリクエストを承認しました`;
      case "admin_announcement":
        return notification.title || "お知らせ";
      default:
        return "新しい通知があります";
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case "like":
      case "comment":
        return notification.targetId ? `/noodles/${notification.targetId}` : null;
      case "follow":
      case "follow_request_approved":
        return notification.fromUser?._id ? `/users/${notification.fromUser._id}` : null;
      case "follow_request":
        return "/follow-requests";
      default:
        return null;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // 未読の場合は既読にする
    if (!notification.isRead) {
      await markAsRead({ notificationId: notification._id });
    }

    // 遷移先がある場合は遷移
    const link = getNotificationLink(notification);
    if (link) {
      router.push(link);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;

    return new Date(timestamp).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <button
          key={notification._id}
          onClick={() => handleNotificationClick(notification)}
          className={cn(
            "w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left",
            !notification.isRead && "border-l-4"
          )}
          style={!notification.isRead ? { borderLeftColor: themeColor } : undefined}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm text-gray-900",
                !notification.isRead && "font-semibold"
              )}>
                {getNotificationText(notification)}
              </p>
              {notification.message && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {notification.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {mounted ? formatTime(notification.createdAt) : ""}
              </p>
            </div>

            {/* Unread Badge */}
            {!notification.isRead && (
              <div
                className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                style={{ backgroundColor: themeColor }}
              />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
