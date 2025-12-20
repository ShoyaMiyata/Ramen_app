"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { GroupJoinButton } from "@/components/features/groups/GroupJoinButton";
import { GroupMemberList } from "@/components/features/groups/GroupMemberList";
import { GroupTimeline } from "@/components/features/groups/GroupTimeline";
import { ArrowLeft, Users, FileText, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import * as Dialog from "@radix-ui/react-dialog";

type Tab = "timeline" | "members";

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const groupId = id as Id<"groups">;
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();

  const [activeTab, setActiveTab] = useState<Tab>("timeline");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const group = useQuery(api.groups.get, {
    groupId,
    viewerId: user?._id,
  });

  const remove = useMutation(api.groups.remove);

  if (!isLoaded || group === undefined) {
    return <LoadingPage />;
  }

  if (!group) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">グループが見つかりません</p>
        <Link href="/groups" className="text-orange-500 mt-2 inline-block">
          グループ一覧に戻る
        </Link>
      </div>
    );
  }

  // メンバーでない場合はアクセスを拒否
  if (!group.isMember) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">このグループにアクセスする権限がありません</p>
        <Link href="/groups" className="text-orange-500 mt-2 inline-block">
          グループ一覧に戻る
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      await remove({ groupId, userId: user._id });
      router.push("/groups");
    } catch (error: any) {
      console.error("Failed to delete group:", error);
      alert(error.message || "グループの削除に失敗しました");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/groups">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">
          {group.name}
        </h1>
        {group.isCreator && (
          <div className="flex gap-2">
            <Link href={`/groups/${groupId}/edit`}>
              <Button variant="outline" size="icon">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        )}
      </div>

      {/* Group Info */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Cover Image */}
        {group.coverImageUrl ? (
          <div className="relative w-full h-48">
            <img
              src={group.coverImageUrl}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="relative w-full h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-white opacity-50" />
          </div>
        )}

        {/* Group Details */}
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {group.name}
          </h2>
          <p className="text-gray-600 mb-4 whitespace-pre-wrap">
            {group.description}
          </p>

          {/* Stats */}
          <div className="flex gap-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{group.memberCount}人</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{group.noodleCount}件の投稿</span>
            </div>
          </div>

          {/* Action Buttons */}
          {user && (
            <div className="flex gap-2">
              {group.isCreator ? (
                <>
                  <Link href={`/groups/${groupId}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Edit className="w-4 h-4" />
                      編集
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    削除
                  </Button>
                </>
              ) : (
                <GroupJoinButton
                  groupId={groupId}
                  userId={user._id}
                  isMember={group.isMember}
                  isCreator={group.isCreator}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setActiveTab("timeline")}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === "timeline"
              ? "bg-orange-500 text-white"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          タイムライン
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === "members"
              ? "bg-orange-500 text-white"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          メンバー
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "timeline" ? (
        <GroupTimeline groupId={groupId} currentUserId={user?._id} />
      ) : (
        <GroupMemberList groupId={groupId} />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-sm z-50 shadow-xl">
            <Dialog.Title className="text-lg font-bold text-gray-900 mb-2">
              グループを削除しますか?
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-4">
              この操作は取り消せません。グループとすべてのメンバーシップが削除されます。
            </Dialog.Description>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "削除中..." : "削除する"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
