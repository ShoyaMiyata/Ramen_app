"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAdmin } from "@/hooks/useAdmin";
import { useTheme } from "@/contexts/ThemeContext";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils/cn";

type Tab = "genres" | "requests";

export default function GenreManagementPage() {
  const router = useRouter();
  const { isAdmin, isLoading, user } = useAdmin();
  const { themeColor } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("genres");

  // ジャンル管理用state
  const [editingGenre, setEditingGenre] = useState<any>(null);
  const [editCode, setEditCode] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // 申請管理用state
  const [reviewingRequest, setReviewingRequest] = useState<any>(null);
  const [finalGenreName, setFinalGenreName] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  // Convex queries
  const genres = useQuery(api.genres.listAll);
  const genreRequests = useQuery(api.genreRequests.listAll, {});

  // Convex mutations
  const createGenre = useMutation(api.genres.create);
  const updateGenre = useMutation(api.genres.update);
  const removeGenre = useMutation(api.genres.remove);
  const seedInitialData = useMutation(api.genres.seedInitialData);
  const approveRequest = useMutation(api.genreRequests.approve);
  const rejectRequest = useMutation(api.genreRequests.reject);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAdmin) {
    router.push("/");
    return null;
  }

  const handleAddGenre = async () => {
    if (!newCode.trim() || !newLabel.trim()) return;

    try {
      await createGenre({
        code: newCode.trim(),
        label: newLabel.trim(),
      });
      setNewCode("");
      setNewLabel("");
      setShowAddModal(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "ジャンルの追加に失敗しました");
    }
  };

  const handleUpdateGenre = async () => {
    if (!editingGenre || !editCode.trim() || !editLabel.trim()) return;

    try {
      await updateGenre({
        id: editingGenre._id,
        code: editCode.trim(),
        label: editLabel.trim(),
      });
      setEditingGenre(null);
      setEditCode("");
      setEditLabel("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "ジャンルの更新に失敗しました");
    }
  };

  const handleToggleActive = async (genre: any) => {
    try {
      await updateGenre({
        id: genre._id,
        isActive: !genre.isActive,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "ジャンルの更新に失敗しました");
    }
  };

  const handleDeleteGenre = async () => {
    if (!deleteTarget) return;

    try {
      await removeGenre({ id: deleteTarget.id as Id<"genres"> });
      setDeleteTarget(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "ジャンルの削除に失敗しました");
    }
  };

  const handleApproveRequest = async () => {
    if (!reviewingRequest || !finalGenreName.trim()) return;

    try {
      await approveRequest({
        requestId: reviewingRequest._id,
        finalGenreName: finalGenreName.trim(),
        reviewNote: reviewNote.trim() || undefined,
      });
      setReviewingRequest(null);
      setFinalGenreName("");
      setReviewNote("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "申請の承認に失敗しました");
    }
  };

  const handleRejectRequest = async (requestId: Id<"genreRequests">) => {
    if (!confirm("この申請を却下しますか？")) return;

    try {
      await rejectRequest({ requestId });
    } catch (error) {
      alert(error instanceof Error ? error.message : "申請の却下に失敗しました");
    }
  };

  const handleSeedData = async () => {
    if (!confirm("初期データを投入しますか？既存のジャンルは保持されます。")) return;

    try {
      const result = await seedInitialData({});
      alert((result as any).message);
    } catch (error) {
      alert(error instanceof Error ? error.message : "初期データの投入に失敗しました");
    }
  };

  const pendingRequests = genreRequests?.filter(r => r.status === "pending") || [];
  const processedRequests = genreRequests?.filter(r => r.status !== "pending") || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.push("/admin")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">ジャンル管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              ジャンルの追加・編集・削除、ユーザー申請の承認
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("genres")}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
              activeTab === "genres"
                ? "text-white"
                : "text-gray-600 bg-gray-100 hover:bg-gray-200"
            )}
            style={{
              backgroundColor: activeTab === "genres" ? themeColor : undefined,
            }}
          >
            ジャンル管理 {genres && `(${genres.length})`}
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors relative",
              activeTab === "requests"
                ? "text-white"
                : "text-gray-600 bg-gray-100 hover:bg-gray-200"
            )}
            style={{
              backgroundColor: activeTab === "requests" ? themeColor : undefined,
            }}
          >
            申請管理 {genreRequests && `(${pendingRequests.length})`}
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Genres Tab */}
      {activeTab === "genres" && (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddModal(true)}
              style={{ backgroundColor: themeColor }}
              className="text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              ジャンル追加
            </Button>
            <Button
              onClick={handleSeedData}
              variant="outline"
              className="border-gray-300"
            >
              初期データ投入
            </Button>
          </div>

          {/* Genres List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {!genres ? (
              <div className="p-8 text-center">
                <Loading size="sm" />
              </div>
            ) : genres.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                ジャンルがありません
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {genres.map((genre) => (
                  <div
                    key={genre._id}
                    className={cn(
                      "p-4",
                      !genre.isActive && "bg-gray-50"
                    )}
                  >
                    {editingGenre?._id === genre._id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            コード
                          </label>
                          <Input
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                            placeholder="醤油"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            表示名
                          </label>
                          <Input
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            placeholder="醤油"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleUpdateGenre}
                            style={{ backgroundColor: themeColor }}
                            className="text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingGenre(null);
                              setEditCode("");
                              setEditLabel("");
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            キャンセル
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium",
                              !genre.isActive && "text-gray-400"
                            )}>
                              {genre.label}
                            </span>
                            {!genre.isActive && (
                              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                                無効
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            コード: {genre.code} / 順序: {genre.sortOrder}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(genre)}
                            className={cn(
                              "border-gray-200",
                              genre.isActive
                                ? "text-gray-600 hover:bg-gray-50"
                                : "text-green-600 hover:bg-green-50"
                            )}
                            title={genre.isActive ? "無効化" : "有効化"}
                          >
                            {genre.isActive ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingGenre(genre);
                              setEditCode(genre.code);
                              setEditLabel(genre.label);
                            }}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setDeleteTarget({
                                id: genre._id,
                                name: genre.label,
                              })
                            }
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Pending Requests */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">
                承認待ち ({pendingRequests.length})
              </h3>
            </div>
            {!genreRequests ? (
              <div className="p-8 text-center">
                <Loading size="sm" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                承認待ちの申請はありません
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">
                          {request.requestedGenre}
                        </div>
                        {request.reason && (
                          <p className="text-sm text-gray-600 mb-2">
                            理由: {request.reason}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>申請者: {request.user?.name || request.user?.email}</span>
                          <span>•</span>
                          <span>{new Date(request.createdAt).toLocaleDateString("ja-JP")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setReviewingRequest(request);
                          setFinalGenreName(request.requestedGenre);
                        }}
                        style={{ backgroundColor: themeColor }}
                        className="text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        承認
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request._id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        却下
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Processed Requests */}
          {processedRequests.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-900">
                  処理済み ({processedRequests.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {processedRequests.map((request) => (
                  <div key={request._id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {request.requestedGenre}
                          </span>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded",
                              request.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            )}
                          >
                            {request.status === "approved" ? "承認済み" : "却下"}
                          </span>
                        </div>
                        {request.finalGenreName && (
                          <div className="text-sm text-gray-600 mb-1">
                            → {request.finalGenreName}
                          </div>
                        )}
                        {request.reviewNote && (
                          <p className="text-sm text-gray-600 mb-1">
                            メモ: {request.reviewNote}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>申請者: {request.user?.name || request.user?.email}</span>
                          <span>•</span>
                          <span>処理者: {request.reviewedByUser?.name || "不明"}</span>
                          <span>•</span>
                          <span>
                            {request.reviewedAt && new Date(request.reviewedAt).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Genre Modal */}
      <Dialog.Root open={showAddModal} onOpenChange={setShowAddModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-md z-50 shadow-xl">
            <Dialog.Title className="font-bold text-gray-900 mb-4">
              ジャンル追加
            </Dialog.Title>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  コード
                </label>
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="醤油"
                />
                <p className="text-xs text-gray-500 mt-1">
                  データベースで使用される一意のコード
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  表示名
                </label>
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="醤油"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ユーザーに表示される名前
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowAddModal(false);
                  setNewCode("");
                  setNewLabel("");
                }}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1 text-white"
                style={{ backgroundColor: themeColor }}
                onClick={handleAddGenre}
                disabled={!newCode.trim() || !newLabel.trim()}
              >
                追加
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Review Request Modal */}
      <Dialog.Root open={!!reviewingRequest} onOpenChange={() => setReviewingRequest(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-md z-50 shadow-xl">
            <Dialog.Title className="font-bold text-gray-900 mb-4">
              申請を承認
            </Dialog.Title>
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">申請されたジャンル名</div>
                <div className="font-medium text-gray-900">
                  {reviewingRequest?.requestedGenre}
                </div>
                {reviewingRequest?.reason && (
                  <div className="mt-2 text-sm text-gray-600">
                    理由: {reviewingRequest.reason}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最終ジャンル名 *
                </label>
                <Input
                  value={finalGenreName}
                  onChange={(e) => setFinalGenreName(e.target.value)}
                  placeholder="背脂"
                />
                <p className="text-xs text-gray-500 mt-1">
                  このジャンル名で登録されます
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  管理者メモ（任意）
                </label>
                <Textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="承認理由やメモ"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setReviewingRequest(null);
                  setFinalGenreName("");
                  setReviewNote("");
                }}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1 text-white"
                style={{ backgroundColor: themeColor }}
                onClick={handleApproveRequest}
                disabled={!finalGenreName.trim()}
              >
                <Check className="w-4 h-4 mr-1" />
                承認
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
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
            <p className="text-sm text-gray-700 mb-2">
              「{deleteTarget?.name}」を削除しますか？
            </p>
            <p className="text-xs text-orange-600 mb-6">
              ⚠️ 既存の投稿で使用されている場合は削除できません
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
                onClick={handleDeleteGenre}
              >
                削除する
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
