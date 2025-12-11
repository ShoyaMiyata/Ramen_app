"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Ticket, Search, CheckSquare, Square, Users } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils/cn";

interface TicketDistributionPanelProps {
  adminUserId: Id<"users">;
}

export function TicketDistributionPanel({ adminUserId }: TicketDistributionPanelProps) {
  // State管理
  const [ticketAmount, setTicketAmount] = useState<number>(10);
  const [targetMode, setTargetMode] = useState<"all" | "selected">("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userSearch, setUserSearch] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [distributionResult, setDistributionResult] = useState<{
    success: boolean;
    count: number;
    amount: number;
  } | null>(null);

  // Convex API
  const users = useQuery(api.admin.listUsersForNotification, { adminUserId });
  const distributeTickets = useMutation(api.admin.distributeTickets);

  // ユーザー検索フィルタ
  const filteredUsers = users?.filter((u) => {
    if (!userSearch) return true;
    const search = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  });

  // ユーザー選択トグル
  const toggleUser = (userId: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUsers(newSet);
  };

  // 全選択/全解除
  const toggleAllUsers = () => {
    if (!filteredUsers) return;
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u._id)));
    }
  };

  // 配布実行
  const handleDistribute = async () => {
    try {
      const targetUserIds =
        targetMode === "all"
          ? undefined
          : (Array.from(selectedUsers) as Id<"users">[]);

      const result = await distributeTickets({
        adminUserId,
        amount: ticketAmount,
        targetUserIds,
      });

      setDistributionResult({
        success: true,
        count: result.distributedCount,
        amount: ticketAmount,
      });
      setShowConfirmDialog(false);
      setSelectedUsers(new Set());

      // 3秒後に結果メッセージを消す
      setTimeout(() => setDistributionResult(null), 3000);
    } catch (error) {
      console.error("Ticket distribution failed:", error);
      alert(error instanceof Error ? error.message : "配布に失敗しました");
      setShowConfirmDialog(false);
    }
  };

  // 配布ボタンの無効化判定
  const isDistributeDisabled =
    ticketAmount < 1 ||
    ticketAmount > 100 ||
    (targetMode === "selected" && selectedUsers.size === 0);

  // 配布対象人数
  const targetCount =
    targetMode === "all"
      ? users?.length || 0
      : selectedUsers.size;

  return (
    <div className="space-y-4">
      {/* タイトル */}
      <div className="flex items-center gap-2">
        <Ticket className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-bold text-gray-900">チケット配布</h2>
      </div>

      {/* 配布枚数入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          配布枚数
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={100}
            value={ticketAmount}
            onChange={(e) => setTicketAmount(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-500">枚</span>
          {(ticketAmount < 1 || ticketAmount > 100) && (
            <span className="text-xs text-red-500">1〜100枚の範囲で入力</span>
          )}
        </div>
      </div>

      {/* 配布対象選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          配布対象
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="targetMode"
              checked={targetMode === "all"}
              onChange={() => setTargetMode("all")}
              className="w-4 h-4 text-orange-500"
            />
            <span className="text-sm text-gray-700">全ユーザー</span>
            {targetMode === "all" && users && (
              <span className="text-xs text-gray-400">({users.length}人)</span>
            )}
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="targetMode"
              checked={targetMode === "selected"}
              onChange={() => setTargetMode("selected")}
              className="w-4 h-4 text-orange-500"
            />
            <span className="text-sm text-gray-700">選択したユーザー</span>
            {targetMode === "selected" && selectedUsers.size > 0 && (
              <span className="text-xs text-orange-500">
                ({selectedUsers.size}人選択中)
              </span>
            )}
          </label>
        </div>
      </div>

      {/* ユーザー選択（選択モードの場合のみ表示） */}
      {targetMode === "selected" && (
        <div className="space-y-2">
          {/* 検索バー */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="ユーザー名・メールで検索"
              className="pl-9"
            />
          </div>

          {/* 全選択ボタン */}
          {filteredUsers && filteredUsers.length > 0 && (
            <button
              onClick={toggleAllUsers}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {selectedUsers.size === filteredUsers.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              全選択
            </button>
          )}

          {/* ユーザー一覧 */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {!filteredUsers ? (
              <div className="p-4 text-center">
                <Loading size="sm" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-400">
                ユーザーが見つかりません
              </p>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => toggleUser(u._id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 hover:bg-gray-50 border-b border-gray-100 last:border-0",
                    selectedUsers.has(u._id) && "bg-orange-50"
                  )}
                >
                  {selectedUsers.has(u._id) ? (
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
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* 配布ボタン */}
      <Button
        onClick={() => setShowConfirmDialog(true)}
        disabled={isDistributeDisabled}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
      >
        <Ticket className="w-4 h-4 mr-2" />
        {targetMode === "all"
          ? `全員にチケットを配布する (${targetCount}人)`
          : selectedUsers.size > 0
            ? `チケットを配布する (${targetCount}人)`
            : "配布対象を選択してください"}
      </Button>

      {/* 配布結果メッセージ */}
      {distributionResult && distributionResult.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700 text-center">
            {distributionResult.count}人に{distributionResult.amount}
            枚ずつ配布しました
          </p>
        </div>
      )}

      {/* 確認ダイアログ */}
      <Dialog.Root open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-sm z-50 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <Dialog.Title className="font-bold text-gray-900">
                  チケット配布確認
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500">
                  以下の内容で配布します
                </Dialog.Description>
              </div>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">配布枚数:</span>
                <span className="text-sm font-medium text-gray-900">
                  {ticketAmount}枚
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">配布対象:</span>
                <span className="text-sm font-medium text-gray-900">
                  {targetMode === "all" ? "全ユーザー" : "選択したユーザー"} (
                  {targetCount}人)
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirmDialog(false)}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleDistribute}
              >
                配布する
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
