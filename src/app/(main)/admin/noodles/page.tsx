"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Users, Lock, Check } from "lucide-react";
import Link from "next/link";
import { Id } from "../../../../../convex/_generated/dataModel";
import * as Dialog from "@radix-ui/react-dialog";

type Visibility = "public" | "followers" | "private";

const VISIBILITY_OPTIONS: { value: Visibility; label: string; icon: any; color: string }[] = [
  { value: "public", label: "公開", icon: Globe, color: "text-green-600" },
  { value: "followers", label: "フォロワー限定", icon: Users, color: "text-blue-600" },
  { value: "private", label: "非公開", icon: Lock, color: "text-gray-600" },
];

export default function AdminNoodlesPage() {
  const { user, isLoaded } = useCurrentUser();
  const noodles = useQuery(
    api.admin.listNoodles,
    user?._id ? { adminUserId: user._id } : "skip"
  );

  const updateVisibility = useMutation(api.admin.updateNoodleVisibility);
  const bulkUpdateVisibility = useMutation(api.admin.bulkUpdateNoodleVisibility);

  const [selectedIds, setSelectedIds] = useState<Set<Id<"noodles">>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
  const [selectedNoodleForVisibility, setSelectedNoodleForVisibility] = useState<Id<"noodles"> | null>(null);
  const [bulkVisibilityModalOpen, setBulkVisibilityModalOpen] = useState(false);

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

  const handleBulkVisibilityChange = async (visibility: Visibility) => {
    if (selectedIds.size === 0) {
      alert("投稿を選択してください");
      return;
    }

    const option = VISIBILITY_OPTIONS.find((o) => o.value === visibility);
    if (!confirm(`${selectedIds.size}件の投稿を「${option?.label}」に変更しますか？`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await bulkUpdateVisibility({
        adminUserId: user._id,
        noodleIds: Array.from(selectedIds),
        visibility,
      });
      alert(`公開範囲を変更しました`);
      setSelectedIds(new Set());
      setBulkVisibilityModalOpen(false);
    } catch (error) {
      alert("エラーが発生しました");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVisibilityChange = async (noodleId: Id<"noodles">, visibility: Visibility) => {
    setIsProcessing(true);
    try {
      await updateVisibility({
        adminUserId: user._id,
        noodleId,
        visibility,
      });
      setVisibilityModalOpen(false);
      setSelectedNoodleForVisibility(null);
    } catch (error) {
      alert("エラーが発生しました");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getVisibilityInfo = (noodle: any) => {
    const visibility = noodle.visibility || "public";
    return VISIBILITY_OPTIONS.find((o) => o.value === visibility) || VISIBILITY_OPTIONS[0];
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
              onClick={() => setBulkVisibilityModalOpen(true)}
              disabled={isProcessing}
            >
              <Globe className="w-4 h-4 mr-1" />
              公開範囲変更
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
          noodles.map((noodle) => {
            const visibilityInfo = getVisibilityInfo(noodle);
            const VisibilityIcon = visibilityInfo.icon;

            return (
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
                    <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                      visibilityInfo.value === "public" ? "bg-green-100 text-green-600" :
                      visibilityInfo.value === "followers" ? "bg-blue-100 text-blue-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <VisibilityIcon className="w-3 h-3" />
                      {visibilityInfo.label}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => {
                    setSelectedNoodleForVisibility(noodle._id);
                    setVisibilityModalOpen(true);
                  }}
                  disabled={isProcessing}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="公開範囲を変更"
                >
                  <VisibilityIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Visibility Modal (Single) */}
      <Dialog.Root open={visibilityModalOpen} onOpenChange={setVisibilityModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-sm z-50 shadow-xl">
            <Dialog.Title className="font-bold text-gray-900 mb-4">
              公開範囲を変更
            </Dialog.Title>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => selectedNoodleForVisibility && handleVisibilityChange(selectedNoodleForVisibility, option.value)}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Icon className={`w-5 h-5 ${option.color}`} />
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Visibility Modal (Bulk) */}
      <Dialog.Root open={bulkVisibilityModalOpen} onOpenChange={setBulkVisibilityModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-sm z-50 shadow-xl">
            <Dialog.Title className="font-bold text-gray-900 mb-2">
              公開範囲を一括変更
            </Dialog.Title>
            <p className="text-sm text-gray-500 mb-4">
              {selectedIds.size}件の投稿の公開範囲を変更します
            </p>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleBulkVisibilityChange(option.value)}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Icon className={`w-5 h-5 ${option.color}`} />
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
