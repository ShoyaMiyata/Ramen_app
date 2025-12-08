"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAdmin } from "@/hooks/useAdmin";
import { useTheme } from "@/contexts/ThemeContext";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckSquare,
  Square,
  Bell,
  Settings,
  Send,
  Search,
  Eye,
  Award,
  Plus,
  X,
} from "lucide-react";
import { BADGES, HIDDEN_BADGES, ALL_BADGES, type BadgeCode, type HiddenBadgeCode, type AllBadgeCode } from "@/lib/constants/badges";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { useTestUser } from "@/contexts/TestUserContext";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils/cn";

type Tab = "overview" | "users" | "noodles" | "feedbacks" | "notifications" | "settings" | "badges";

const FEEDBACK_STATUSES = [
  { value: "new", label: "新規", color: "#3B82F6" },
  { value: "in_progress", label: "対応中", color: "#F59E0B" },
  { value: "resolved", label: "解決済み", color: "#10B981" },
  { value: "rejected", label: "却下", color: "#6B7280" },
];

const CATEGORY_LABELS: Record<string, string> = {
  feature: "新機能",
  improvement: "改善",
  bug: "バグ",
  other: "その他",
};

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isLoading, user } = useAdmin();
  const { themeColor } = useTheme();
  const { setTestUserId } = useTestUser();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "user" | "noodle" | "feedback";
    id: string;
    name: string;
  } | null>(null);

  // 複数選択用state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedNoodles, setSelectedNoodles] = useState<Set<string>>(new Set());
  const [selectedFeedbacks, setSelectedFeedbacks] = useState<Set<string>>(new Set());
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{
    type: "users" | "noodles" | "feedbacks";
    count: number;
  } | null>(null);

  // 通知送信用state
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [recipientSearch, setRecipientSearch] = useState("");
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);

  // 設定更新用state
  const [isUpdatingSetting, setIsUpdatingSetting] = useState(false);

  // バッジシミュレーション用state
  const [selectedUserForBadge, setSelectedUserForBadge] = useState<Id<"users"> | null>(null);
  const [badgeSearchText, setBadgeSearchText] = useState("");
  const [showBadgeGrantModal, setShowBadgeGrantModal] = useState(false);
  const [selectedBadgeCode, setSelectedBadgeCode] = useState<string>("");

  // 管理者用API
  const stats = useQuery(
    api.admin.getStats,
    user?._id ? { adminUserId: user._id } : "skip"
  );
  const users = useQuery(
    api.admin.listUsers,
    user?._id && activeTab === "users" ? { adminUserId: user._id } : "skip"
  );
  const noodles = useQuery(
    api.admin.listNoodles,
    user?._id && activeTab === "noodles" ? { adminUserId: user._id } : "skip"
  );
  const feedbacks = useQuery(
    api.admin.listFeedbacks,
    user?._id && activeTab === "feedbacks" ? { adminUserId: user._id } : "skip"
  );

  const softDeleteUser = useMutation(api.admin.softDeleteUser);
  const restoreUser = useMutation(api.admin.restoreUser);
  const deleteNoodle = useMutation(api.admin.deleteNoodle);
  const updateFeedbackStatus = useMutation(api.admin.updateFeedbackStatus);
  const deleteFeedback = useMutation(api.admin.deleteFeedback);
  const bulkSoftDeleteUsers = useMutation(api.admin.bulkSoftDeleteUsers);
  const bulkDeleteNoodles = useMutation(api.admin.bulkDeleteNoodles);
  const bulkDeleteFeedbacks = useMutation(api.admin.bulkDeleteFeedbacks);

  // 通知・設定用API
  const usersForNotification = useQuery(
    api.admin.listUsersForNotification,
    user?._id && activeTab === "notifications" ? { adminUserId: user._id } : "skip"
  );
  const appSettings = useQuery(
    api.admin.getAllAppSettings,
    user?._id && activeTab === "settings" ? { adminUserId: user._id } : "skip"
  );
  const followEnabled = useQuery(api.follows.getFollowEnabled);
  const sendAnnouncement = useMutation(api.admin.sendAnnouncement);
  const sendAnnouncementToAll = useMutation(api.admin.sendAnnouncementToAll);
  const updateAppSetting = useMutation(api.admin.updateAppSetting);

  // バッジシミュレーション用API
  const usersForBadge = useQuery(
    api.admin.listUsersForNotification,
    user?._id && activeTab === "badges" ? { adminUserId: user._id } : "skip"
  );
  const selectedUserBadges = useQuery(
    api.admin.getUserBadges,
    user?._id && selectedUserForBadge
      ? { adminUserId: user._id, targetUserId: selectedUserForBadge }
      : "skip"
  );
  const grantBadge = useMutation(api.admin.grantBadge);
  const revokeBadge = useMutation(api.admin.revokeBadge);
  const revokeAllBadges = useMutation(api.admin.revokeAllBadges);

  // ローディング中
  if (isLoading) {
    return <LoadingPage />;
  }

  // 管理者でなければリダイレクト
  if (!isAdmin) {
    router.push("/");
    return null;
  }

  const handleDelete = async () => {
    if (!deleteTarget || !user?._id) return;

    try {
      if (deleteTarget.type === "user") {
        await softDeleteUser({
          adminUserId: user._id,
          targetUserId: deleteTarget.id as Id<"users">,
        });
      } else if (deleteTarget.type === "noodle") {
        await deleteNoodle({
          adminUserId: user._id,
          noodleId: deleteTarget.id as Id<"noodles">,
        });
      } else if (deleteTarget.type === "feedback") {
        await deleteFeedback({
          adminUserId: user._id,
          feedbackId: deleteTarget.id as Id<"feedbacks">,
        });
      }
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleRestore = async (userId: Id<"users">) => {
    if (!user?._id) return;
    try {
      await restoreUser({
        adminUserId: user._id,
        targetUserId: userId,
      });
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const handleStatusChange = async (
    feedbackId: Id<"feedbacks">,
    status: string
  ) => {
    if (!user?._id) return;
    try {
      await updateFeedbackStatus({
        adminUserId: user._id,
        feedbackId,
        status,
      });
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  // 一括削除処理
  const handleBulkDelete = async () => {
    if (!bulkDeleteTarget || !user?._id) return;

    try {
      if (bulkDeleteTarget.type === "users") {
        const userIds = Array.from(selectedUsers) as Id<"users">[];
        await bulkSoftDeleteUsers({
          adminUserId: user._id,
          targetUserIds: userIds,
        });
        setSelectedUsers(new Set());
      } else if (bulkDeleteTarget.type === "noodles") {
        const noodleIds = Array.from(selectedNoodles) as Id<"noodles">[];
        await bulkDeleteNoodles({
          adminUserId: user._id,
          noodleIds: noodleIds,
        });
        setSelectedNoodles(new Set());
      } else if (bulkDeleteTarget.type === "feedbacks") {
        const feedbackIds = Array.from(selectedFeedbacks) as Id<"feedbacks">[];
        await bulkDeleteFeedbacks({
          adminUserId: user._id,
          feedbackIds: feedbackIds,
        });
        setSelectedFeedbacks(new Set());
      }
      setBulkDeleteTarget(null);
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  // 選択トグル
  const toggleUserSelection = (id: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedUsers(newSet);
  };

  const toggleNoodleSelection = (id: string) => {
    const newSet = new Set(selectedNoodles);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedNoodles(newSet);
  };

  const toggleFeedbackSelection = (id: string) => {
    const newSet = new Set(selectedFeedbacks);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedFeedbacks(newSet);
  };

  // 全選択/全解除
  const toggleAllUsers = () => {
    if (!users) return;
    const deletableUsers = users.filter((u) => !u.isAdmin && !u.deletedAt);
    if (selectedUsers.size === deletableUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(deletableUsers.map((u) => u._id)));
    }
  };

  const toggleAllNoodles = () => {
    if (!noodles) return;
    if (selectedNoodles.size === noodles.length) {
      setSelectedNoodles(new Set());
    } else {
      setSelectedNoodles(new Set(noodles.map((n) => n._id)));
    }
  };

  const toggleAllFeedbacks = () => {
    if (!feedbacks) return;
    if (selectedFeedbacks.size === feedbacks.length) {
      setSelectedFeedbacks(new Set());
    } else {
      setSelectedFeedbacks(new Set(feedbacks.map((f) => f._id)));
    }
  };

  // 通知送信処理
  const handleSendNotification = async () => {
    if (!user?._id) return;

    setIsSendingNotification(true);
    try {
      if (selectedRecipients.size === 0) {
        // 全員に送信
        await sendAnnouncementToAll({
          adminUserId: user._id,
          title: notificationTitle,
          message: notificationMessage,
        });
      } else {
        // 選択したユーザーに送信
        await sendAnnouncement({
          adminUserId: user._id,
          targetUserIds: Array.from(selectedRecipients) as Id<"users">[],
          title: notificationTitle,
          message: notificationMessage,
        });
      }
      // 成功後リセット
      setNotificationTitle("");
      setNotificationMessage("");
      setSelectedRecipients(new Set());
      setShowSendConfirm(false);
      alert("通知を送信しました");
    } catch (error) {
      console.error("Send notification failed:", error);
      alert("通知の送信に失敗しました");
    } finally {
      setIsSendingNotification(false);
    }
  };

  // 通知先トグル
  const toggleRecipient = (id: string) => {
    const newSet = new Set(selectedRecipients);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRecipients(newSet);
  };

  // 全員選択/解除
  const toggleAllRecipients = () => {
    if (!usersForNotification) return;
    if (selectedRecipients.size === usersForNotification.length) {
      setSelectedRecipients(new Set());
    } else {
      setSelectedRecipients(new Set(usersForNotification.map((u) => u._id)));
    }
  };

  // フォロー機能のオンオフ
  const handleToggleFollowEnabled = async () => {
    if (!user?._id || followEnabled === undefined) return;

    setIsUpdatingSetting(true);
    try {
      await updateAppSetting({
        adminUserId: user._id,
        key: "followEnabled",
        value: !followEnabled,
      });
    } catch (error) {
      console.error("Update setting failed:", error);
    } finally {
      setIsUpdatingSetting(false);
    }
  };

  // 検索でフィルタされたユーザー
  const filteredUsersForNotification = usersForNotification?.filter((u) => {
    if (!recipientSearch) return true;
    const search = recipientSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  });

  // バッジ付与処理
  const handleGrantBadge = async () => {
    if (!user?._id || !selectedUserForBadge || !selectedBadgeCode) return;

    try {
      await grantBadge({
        adminUserId: user._id,
        targetUserId: selectedUserForBadge,
        badgeCode: selectedBadgeCode,
      });
      setShowBadgeGrantModal(false);
      setSelectedBadgeCode("");
    } catch (error) {
      console.error("Grant badge failed:", error);
      alert(error instanceof Error ? error.message : "バッジの付与に失敗しました");
    }
  };

  // バッジ削除処理
  const handleRevokeBadge = async (badgeId: Id<"userBadges">) => {
    if (!user?._id) return;

    try {
      await revokeBadge({
        adminUserId: user._id,
        badgeId,
      });
    } catch (error) {
      console.error("Revoke badge failed:", error);
    }
  };

  // 全バッジ削除処理
  const handleRevokeAllBadges = async () => {
    if (!user?._id || !selectedUserForBadge) return;

    if (!confirm("本当にすべてのバッジを削除しますか？")) return;

    try {
      await revokeAllBadges({
        adminUserId: user._id,
        targetUserId: selectedUserForBadge,
      });
    } catch (error) {
      console.error("Revoke all badges failed:", error);
    }
  };

  // バッジ検索フィルタ
  const filteredBadges = Object.entries(ALL_BADGES).filter(([code, badge]) => {
    if (!badgeSearchText) return true;
    const search = badgeSearchText.toLowerCase();
    return (
      badge.name.toLowerCase().includes(search) ||
      badge.description.toLowerCase().includes(search) ||
      code.toLowerCase().includes(search)
    );
  });

  // 獲得済みバッジコードのSet
  const earnedBadgeCodes = new Set(
    selectedUserBadges?.map((ub) => ub.badgeCode) || []
  );

  const tabs = [
    { id: "overview" as Tab, label: "概要", icon: BarChart3 },
    { id: "users" as Tab, label: "ユーザー", icon: Users },
    { id: "noodles" as Tab, label: "投稿", icon: FileText },
    { id: "feedbacks" as Tab, label: "FB", icon: MessageSquare },
    { id: "notifications" as Tab, label: "通知", icon: Bell },
    { id: "settings" as Tab, label: "設定", icon: Settings },
    { id: "badges" as Tab, label: "バッジ", icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">管理画面</h1>
        <p className="text-sm text-gray-500 mt-1">
          ユーザー、投稿、フィードバックを管理
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{
                borderColor: activeTab === tab.id ? themeColor : "transparent",
              }}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Overview Tab */}
          {activeTab === "overview" && stats && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.users.active}
                  </div>
                  <div className="text-xs text-blue-600/70">ユーザー</div>
                  {stats.users.deleted > 0 && (
                    <div className="text-[10px] text-gray-400 mt-1">
                      +{stats.users.deleted} 削除済み
                    </div>
                  )}
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.noodles.total}
                  </div>
                  <div className="text-xs text-orange-600/70">投稿</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.feedbacks.total}
                  </div>
                  <div className="text-xs text-purple-600/70">FB</div>
                </div>
              </div>

              {/* Feedback Status Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  フィードバック状況
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {FEEDBACK_STATUSES.map((status) => (
                    <div
                      key={status.value}
                      className="text-center p-2 bg-white rounded-lg"
                    >
                      <div
                        className="text-lg font-bold"
                        style={{ color: status.color }}
                      >
                        {stats.feedbacks.byStatus[
                          status.value as keyof typeof stats.feedbacks.byStatus
                        ] || 0}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {status.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-2">
              {/* 一括操作バー */}
              {users && users.filter((u) => !u.isAdmin && !u.deletedAt).length > 0 && (
                <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg mb-3">
                  <button
                    onClick={toggleAllUsers}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {selectedUsers.size === users.filter((u) => !u.isAdmin && !u.deletedAt).length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    全選択
                  </button>
                  {selectedUsers.size > 0 && (
                    <Button
                      size="sm"
                      onClick={() =>
                        setBulkDeleteTarget({
                          type: "users",
                          count: selectedUsers.size,
                        })
                      }
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {selectedUsers.size}件削除
                    </Button>
                  )}
                </div>
              )}
              {users?.map((u) => (
                <div
                  key={u._id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    u.deletedAt ? "bg-red-50" : selectedUsers.has(u._id) ? "bg-blue-50" : "bg-gray-50"
                  }`}
                >
                  {/* チェックボックス */}
                  {!u.isAdmin && !u.deletedAt && (
                    <button
                      onClick={() => toggleUserSelection(u._id)}
                      className="flex-shrink-0"
                    >
                      {selectedUsers.has(u._id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium truncate ${
                          u.deletedAt ? "text-gray-400 line-through" : ""
                        }`}
                      >
                        {u.name || "名前なし"}
                      </span>
                      {u.isAdmin && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">
                          管理者
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {u.email}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      投稿: {u.postCount}件
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* テスト閲覧ボタン */}
                    {!u.deletedAt && !u.isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTestUserId(u._id as Id<"users">);
                          router.push("/");
                        }}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    )}
                    {u.deletedAt ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(u._id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        復元
                      </Button>
                    ) : (
                      !u.isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setDeleteTarget({
                              type: "user",
                              id: u._id,
                              name: u.name || u.email,
                            })
                          }
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )
                    )}
                  </div>
                </div>
              ))}
              {users?.length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  ユーザーがいません
                </p>
              )}
            </div>
          )}

          {/* Noodles Tab */}
          {activeTab === "noodles" && (
            <div className="space-y-2">
              {/* 一括操作バー */}
              {noodles && noodles.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg mb-3">
                  <button
                    onClick={toggleAllNoodles}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {selectedNoodles.size === noodles.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    全選択
                  </button>
                  {selectedNoodles.size > 0 && (
                    <Button
                      size="sm"
                      onClick={() =>
                        setBulkDeleteTarget({
                          type: "noodles",
                          count: selectedNoodles.size,
                        })
                      }
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {selectedNoodles.size}件削除
                    </Button>
                  )}
                </div>
              )}
              {noodles?.map((n) => (
                <div
                  key={n._id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    selectedNoodles.has(n._id) ? "bg-blue-50" : "bg-gray-50"
                  }`}
                >
                  {/* チェックボックス */}
                  <button
                    onClick={() => toggleNoodleSelection(n._id)}
                    className="flex-shrink-0"
                  >
                    {selectedNoodles.has(n._id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {n.imageUrl && (
                    <img
                      src={n.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{n.ramenName}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {n.shop?.name} / {n.user?.name || "不明"}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleDateString("ja-JP")
                        : "-"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setDeleteTarget({
                        type: "noodle",
                        id: n._id,
                        name: n.ramenName,
                      })
                    }
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {noodles?.length === 0 && (
                <p className="text-center text-gray-400 py-8">投稿がありません</p>
              )}
            </div>
          )}

          {/* Feedbacks Tab */}
          {activeTab === "feedbacks" && (
            <div className="space-y-2">
              {/* 一括操作バー */}
              {feedbacks && feedbacks.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg mb-3">
                  <button
                    onClick={toggleAllFeedbacks}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {selectedFeedbacks.size === feedbacks.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    全選択
                  </button>
                  {selectedFeedbacks.size > 0 && (
                    <Button
                      size="sm"
                      onClick={() =>
                        setBulkDeleteTarget({
                          type: "feedbacks",
                          count: selectedFeedbacks.size,
                        })
                      }
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {selectedFeedbacks.size}件削除
                    </Button>
                  )}
                </div>
              )}
              {feedbacks?.map((f) => (
                <div
                  key={f._id}
                  className={`p-3 rounded-lg space-y-2 ${
                    selectedFeedbacks.has(f._id) ? "bg-blue-50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* チェックボックス */}
                    <button
                      onClick={() => toggleFeedbackSelection(f._id)}
                      className="flex-shrink-0 mt-1"
                    >
                      {selectedFeedbacks.has(f._id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                          {CATEGORY_LABELS[f.category] || f.category}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(f.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {f.message}
                      </p>
                      <div className="text-[10px] text-gray-400 mt-1">
                        by {f.user?.name || f.user?.email || "不明"}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setDeleteTarget({
                          type: "feedback",
                          id: f._id,
                          name: f.message.slice(0, 20) + "...",
                        })
                      }
                      className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 ml-8">
                    <span className="text-[10px] text-gray-500">ステータス:</span>
                    <select
                      value={f.status}
                      onChange={(e) =>
                        handleStatusChange(f._id, e.target.value)
                      }
                      className="text-xs px-2 py-1 border border-gray-200 rounded-lg bg-white"
                      style={{
                        color: FEEDBACK_STATUSES.find((s) => s.value === f.status)
                          ?.color,
                      }}
                    >
                      {FEEDBACK_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {feedbacks?.length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  フィードバックがありません
                </p>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              {/* 通知作成フォーム */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイトル
                  </label>
                  <Input
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    placeholder="お知らせのタイトル"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メッセージ
                  </label>
                  <Textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="お知らせの内容を入力"
                    rows={3}
                    maxLength={500}
                  />
                </div>
              </div>

              {/* 送信先選択 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    送信先
                    {selectedRecipients.size > 0 && (
                      <span className="ml-2 text-xs text-orange-500">
                        ({selectedRecipients.size}人選択中)
                      </span>
                    )}
                    {selectedRecipients.size === 0 && (
                      <span className="ml-2 text-xs text-gray-400">
                        (未選択の場合は全員に送信)
                      </span>
                    )}
                  </label>
                  {usersForNotification && usersForNotification.length > 0 && (
                    <button
                      onClick={toggleAllRecipients}
                      className="text-xs text-orange-500 hover:text-orange-600"
                    >
                      {selectedRecipients.size === usersForNotification.length
                        ? "全解除"
                        : "全選択"}
                    </button>
                  )}
                </div>

                {/* 検索 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    placeholder="ユーザー名・メールで検索"
                    className="pl-9"
                  />
                </div>

                {/* ユーザー一覧 */}
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredUsersForNotification === undefined ? (
                    <div className="p-4 text-center">
                      <Loading size="sm" />
                    </div>
                  ) : filteredUsersForNotification.length === 0 ? (
                    <p className="p-4 text-center text-sm text-gray-400">
                      ユーザーが見つかりません
                    </p>
                  ) : (
                    filteredUsersForNotification.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => toggleRecipient(u._id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 hover:bg-gray-50 border-b border-gray-100 last:border-0",
                          selectedRecipients.has(u._id) && "bg-orange-50"
                        )}
                      >
                        {selectedRecipients.has(u._id) ? (
                          <CheckSquare className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                        {u.imageUrl ? (
                          <img
                            src={u.imageUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                            {u.name?.charAt(0) || "?"}
                          </div>
                        )}
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {u.name || "名前なし"}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {u.email}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* 送信ボタン */}
              <Button
                onClick={() => setShowSendConfirm(true)}
                disabled={!notificationTitle.trim() || !notificationMessage.trim()}
                className="w-full"
                style={{ backgroundColor: themeColor }}
              >
                <Send className="w-4 h-4 mr-2" />
                {selectedRecipients.size > 0
                  ? `${selectedRecipients.size}人に送信`
                  : "全員に送信"}
              </Button>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              {/* フォロー機能のオンオフ */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">フォロー機能</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      オフにすると、鍵アカウントの閲覧制限が解除されます
                    </p>
                  </div>
                  <button
                    onClick={handleToggleFollowEnabled}
                    disabled={isUpdatingSetting || followEnabled === undefined}
                    className={cn(
                      "relative w-12 h-7 rounded-full transition-colors flex-shrink-0",
                      followEnabled ? "bg-green-500" : "bg-gray-300",
                      isUpdatingSetting && "opacity-50"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform",
                        followEnabled && "translate-x-5"
                      )}
                    />
                  </button>
                </div>
                {!followEnabled && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-700">
                      ⚠️ フォロー機能は現在無効です。鍵アカウントの閲覧制限が解除され、全ユーザーの投稿が公開されています。
                    </p>
                  </div>
                )}
              </div>

              {/* 設定一覧（デバッグ用） */}
              {appSettings && appSettings.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-900 mb-2">現在の設定</h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    {appSettings.map((s) => (
                      <div key={s._id} className="flex justify-between">
                        <span>{s.key}</span>
                        <span className="font-mono">
                          {typeof s.parsedValue === "boolean"
                            ? s.parsedValue
                              ? "有効"
                              : "無効"
                            : String(s.parsedValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === "badges" && (
            <div className="space-y-4">
              {/* ユーザー選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象ユーザー
                </label>
                <select
                  value={selectedUserForBadge || ""}
                  onChange={(e) =>
                    setSelectedUserForBadge(
                      e.target.value ? (e.target.value as Id<"users">) : null
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">ユーザーを選択</option>
                  {usersForBadge?.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name || "名前なし"} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedUserForBadge && (
                <>
                  {/* 獲得済みバッジ */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        獲得済みバッジ ({selectedUserBadges?.length || 0})
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setShowBadgeGrantModal(true)}
                          className="text-white"
                          style={{ backgroundColor: themeColor }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          付与
                        </Button>
                        {selectedUserBadges && selectedUserBadges.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRevokeAllBadges}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            全削除
                          </Button>
                        )}
                      </div>
                    </div>

                    {selectedUserBadges === undefined ? (
                      <div className="text-center py-4">
                        <Loading size="sm" />
                      </div>
                    ) : selectedUserBadges.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        バッジはありません
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedUserBadges.map((ub) => {
                          const isHidden = HIDDEN_BADGES[ub.badgeCode as HiddenBadgeCode];
                          return (
                            <div
                              key={ub._id}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-lg",
                                isHidden
                                  ? "bg-gradient-to-r from-purple-50 to-indigo-50"
                                  : "bg-white"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <BadgeUI
                                  rarity={ub.badge?.rarity || "common"}
                                  className="text-xs"
                                >
                                  {ub.badge?.name || ub.badgeCode}
                                </BadgeUI>
                                {isHidden && (
                                  <span className="text-[10px] text-purple-500">
                                    シークレット
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleRevokeBadge(ub._id)}
                                className="p-1 hover:bg-red-100 rounded text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* バッジ一覧 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-medium text-gray-900 mb-3">
                      全バッジ一覧
                    </h3>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={badgeSearchText}
                        onChange={(e) => setBadgeSearchText(e.target.value)}
                        placeholder="バッジ名で検索"
                        className="pl-9"
                      />
                    </div>

                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {filteredBadges.map(([code, badge]) => {
                        const isEarned = earnedBadgeCodes.has(code);
                        const isHidden = HIDDEN_BADGES[code as HiddenBadgeCode];
                        return (
                          <div
                            key={code}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-lg text-sm",
                              isEarned
                                ? "bg-green-50"
                                : isHidden
                                  ? "bg-purple-50/50"
                                  : "bg-white"
                            )}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <BadgeUI
                                rarity={badge.rarity}
                                className="text-[10px] flex-shrink-0"
                              >
                                {badge.name}
                              </BadgeUI>
                              {isHidden && (
                                <span className="text-[10px] text-purple-400">
                                  秘密
                                </span>
                              )}
                              <span className="text-xs text-gray-400 truncate">
                                {badge.description}
                              </span>
                            </div>
                            {isEarned ? (
                              <span className="text-xs text-green-600 flex-shrink-0">
                                獲得済
                              </span>
                            ) : (
                              <button
                                onClick={async () => {
                                  if (!user?._id || !selectedUserForBadge) return;
                                  try {
                                    await grantBadge({
                                      adminUserId: user._id,
                                      targetUserId: selectedUserForBadge,
                                      badgeCode: code,
                                    });
                                  } catch (error) {
                                    console.error("Grant badge failed:", error);
                                  }
                                }}
                                className="text-xs text-orange-500 hover:text-orange-600 flex-shrink-0"
                              >
                                付与
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-sm z-50 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <Dialog.Title className="font-bold text-gray-900">
                  削除確認
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500">
                  この操作は取り消せません
                </Dialog.Description>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              「{deleteTarget?.name}」を削除しますか？
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteTarget(null)}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
              >
                削除する
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog.Root
        open={!!bulkDeleteTarget}
        onOpenChange={() => setBulkDeleteTarget(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-sm z-50 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <Dialog.Title className="font-bold text-gray-900">
                  一括削除確認
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500">
                  この操作は取り消せません
                </Dialog.Description>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              {bulkDeleteTarget?.type === "users" && (
                <>選択した <span className="font-bold text-red-600">{bulkDeleteTarget.count}件</span> のユーザーを削除しますか？</>
              )}
              {bulkDeleteTarget?.type === "noodles" && (
                <>選択した <span className="font-bold text-red-600">{bulkDeleteTarget.count}件</span> の投稿を削除しますか？</>
              )}
              {bulkDeleteTarget?.type === "feedbacks" && (
                <>選択した <span className="font-bold text-red-600">{bulkDeleteTarget.count}件</span> のフィードバックを削除しますか？</>
              )}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setBulkDeleteTarget(null)}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleBulkDelete}
              >
                一括削除
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Send Notification Confirmation Dialog */}
      <Dialog.Root
        open={showSendConfirm}
        onOpenChange={setShowSendConfirm}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-sm z-50 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Bell className="w-5 h-5" style={{ color: themeColor }} />
              </div>
              <div>
                <Dialog.Title className="font-bold text-gray-900">
                  通知送信確認
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500">
                  以下の内容で通知を送信します
                </Dialog.Description>
              </div>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
              <div>
                <p className="text-[10px] text-gray-500">送信先</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedRecipients.size > 0
                    ? `${selectedRecipients.size}人`
                    : "全ユーザー"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">タイトル</p>
                <p className="text-sm font-medium text-gray-900">
                  {notificationTitle}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">メッセージ</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {notificationMessage}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSendConfirm(false)}
                disabled={isSendingNotification}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1 text-white"
                style={{ backgroundColor: themeColor }}
                onClick={handleSendNotification}
                disabled={isSendingNotification}
              >
                {isSendingNotification ? (
                  <Loading size="sm" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    送信
                  </>
                )}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
