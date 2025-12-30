"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Archive, ArchiveX, Eye, EyeOff, Check } from "lucide-react";
import Link from "next/link";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function AdminNoodlesPage() {
  const { user, isLoaded } = useCurrentUser();
  const noodles = useQuery(
    api.admin.listNoodles,
    user?._id ? { adminUserId: user._id } : "skip"
  );

  const updateArchiveStatus = useMutation(api.admin.updateNoodleArchiveStatus);
  const bulkUpdateArchiveStatus = useMutation(api.admin.bulkUpdateNoodleArchiveStatus);
  const updateVisibility = useMutation(api.admin.updateNoodleVisibility);
  const bulkUpdateVisibility = useMutation(api.admin.bulkUpdateNoodleVisibility);

  const [selectedIds, setSelectedIds] = useState<Set<Id<"noodles">>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isLoaded || !noodles) {
    return <LoadingPage />;
  }

  if (!user?.isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">管理者権限が必要です</p>
      </div>
    );
  }

  const toggleSelection = (id: Id<"noodles">) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    setSelectedIds(new Set(noodles.map((n) => n._id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) {
      alert("投稿を選択してください");
      return;
    }

    if (!confirm(`${selectedIds.size}件の投稿をアーカイブしますか？`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await bulkUpdateArchiveStatus({
        adminUserId: user._id,
        noodleIds: Array.from(selectedIds),
        isArchived: true,
      });
      alert("アーカイブしました");
      setSelectedIds(new Set());
    } catch (error) {
      alert("エラーが発生しました");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUnarchive = async () => {
    if (selectedIds.size === 0) {
      alert("投稿を選択してください");
      return;
    }

    if (!confirm(`${selectedIds.size}件の投稿のアーカイブを解除しますか？`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await bulkUpdateArchiveStatus({
        adminUserId: user._id,
        noodleIds: Array.from(selectedIds),
        isArchived: false,
      });
      alert("アーカイブを解除しました");
      setSelectedIds(new Set());
    } catch (error) {
      alert("エラーが発生しました");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedIds.size === 0) {
      alert("投稿を選択してください");
      return;
    }

    if (!confirm(`${selectedIds.size}件の投稿を公開しますか？`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await bulkUpdateVisibility({
        adminUserId: user._id,
        noodleIds: Array.from(selectedIds),
        isDraft: false,
        groupIds: [],
      });
      alert("公開しました");
      setSelectedIds(new Set());
    } catch (error) {
      alert("エラーが発生しました");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDraft = async () => {
    if (selectedIds.size === 0) {
      alert("投稿を選択してください");
      return;
    }

    if (!confirm(`${selectedIds.size}件の投稿を下書きにしますか？`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await bulkUpdateVisibility({
        adminUserId: user._id,
        noodleIds: Array.from(selectedIds),
        isDraft: true,
      });
      alert("下書きにしました");
      setSelectedIds(new Set());
    } catch (error) {
      alert("エラーが発生しました");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleArchive = async (noodleId: Id<"noodles">, isArchived: boolean) => {
    setIsProcessing(true);
    try {
      await updateArchiveStatus({
        adminUserId: user._id,
        noodleId,
        isArchived: !isArchived,
      });
    } catch (error) {
      alert("エラーが発生しました");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleVisibility = async (noodleId: Id<"noodles">, isDraft: boolean) => {
    setIsProcessing(true);
    try {
      await updateVisibility({
        adminUserId: user._id,
        noodleId,
        isDraft: !isDraft,
      });
    } catch (error) {
      alert("エラーが発生しました");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">投稿管理</h1>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              {selectedIds.size}件選択中
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={deselectAll}
              disabled={isProcessing}
            >
              選択解除
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkArchive}
              disabled={isProcessing}
            >
              <Archive className="w-4 h-4 mr-1" />
              アーカイブ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkUnarchive}
              disabled={isProcessing}
            >
              <ArchiveX className="w-4 h-4 mr-1" />
              アーカイブ解除
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkPublish}
              disabled={isProcessing}
            >
              <Eye className="w-4 h-4 mr-1" />
              公開
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDraft}
              disabled={isProcessing}
            >
              <EyeOff className="w-4 h-4 mr-1" />
              下書き
            </Button>
          </div>
        </div>
      )}

      {/* Select All */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={selectAll}
          disabled={isProcessing}
        >
          全て選択
        </Button>
      </div>

      {/* Noodles List */}
      <div className="space-y-2">
        {noodles.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl">
            <p className="text-gray-500">投稿がありません</p>
          </div>
        ) : (
          noodles.map((noodle) => (
            <div
              key={noodle._id}
              className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleSelection(noodle._id)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedIds.has(noodle._id)
                    ? "bg-orange-500 border-orange-500"
                    : "border-gray-300 hover:border-orange-300"
                }`}
                disabled={isProcessing}
              >
                {selectedIds.has(noodle._id) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Image */}
              {noodle.imageUrl && (
                <img
                  src={noodle.imageUrl}
                  alt={noodle.ramenName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {noodle.ramenName}
                </h3>
                <p className="text-sm text-gray-500">
                  {noodle.user?.name || "不明"} @ {noodle.shop?.name || "不明"}
                </p>
                <div className="flex gap-2 mt-1">
                  {noodle.isDraft && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      下書き
                    </span>
                  )}
                  {noodle.isArchived && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                      アーカイブ
                    </span>
                  )}
                  {noodle.groupIds && noodle.groupIds.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                      グループ限定
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleArchive(noodle._id, !!noodle.isArchived)}
                  disabled={isProcessing}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={noodle.isArchived ? "アーカイブ解除" : "アーカイブ"}
                >
                  {noodle.isArchived ? (
                    <ArchiveX className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Archive className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={() => handleToggleVisibility(noodle._id, !!noodle.isDraft)}
                  disabled={isProcessing}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={noodle.isDraft ? "公開" : "下書きにする"}
                >
                  {noodle.isDraft ? (
                    <Eye className="w-5 h-5 text-gray-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
