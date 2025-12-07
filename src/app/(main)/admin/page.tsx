"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAdmin } from "@/hooks/useAdmin";
import { useTheme } from "@/contexts/ThemeContext";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

type Tab = "overview" | "users" | "noodles" | "feedbacks";

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
        await bulkSoftDeleteUsers({
          adminUserId: user._id,
          targetUserIds: Array.from(selectedUsers) as Id<"users">[],
        });
        setSelectedUsers(new Set());
      } else if (bulkDeleteTarget.type === "noodles") {
        await bulkDeleteNoodles({
          adminUserId: user._id,
          noodleIds: Array.from(selectedNoodles) as Id<"noodles">[],
        });
        setSelectedNoodles(new Set());
      } else if (bulkDeleteTarget.type === "feedbacks") {
        await bulkDeleteFeedbacks({
          adminUserId: user._id,
          feedbackIds: Array.from(selectedFeedbacks) as Id<"feedbacks">[],
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

  const tabs = [
    { id: "overview" as Tab, label: "概要", icon: BarChart3 },
    { id: "users" as Tab, label: "ユーザー", icon: Users },
    { id: "noodles" as Tab, label: "投稿", icon: FileText },
    { id: "feedbacks" as Tab, label: "フィードバック", icon: MessageSquare },
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
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{
                borderColor: activeTab === tab.id ? themeColor : "transparent",
              }}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
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
                  <div className="flex items-center gap-2">
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
    </div>
  );
}
