"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { NotificationList } from "@/components/features/notification-list";
import { CheckCheck } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function NotificationsPage() {
  const { user, isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();
  const notifications = useQuery(
    api.notifications.getByUser,
    user?._id ? { userId: user._id } : "skip"
  );
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleMarkAllAsRead = async () => {
    if (!user?._id) return;
    await markAllAsRead({ userId: user._id });
  };

  if (!isLoaded) {
    return <LoadingPage />;
  }

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-gray-900">通知</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              未読 {unreadCount}件
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllAsRead}
            className="gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            全て既読
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications === undefined ? (
        <LoadingPage />
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">通知はありません</p>
        </div>
      ) : (
        <NotificationList notifications={notifications} themeColor={themeColor} />
      )}
    </div>
  );
}
