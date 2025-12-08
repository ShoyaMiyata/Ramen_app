"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { UserCard } from "@/components/features/user-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserMinus } from "lucide-react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

export default function FollowersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = id as Id<"users">;

  const { user: currentUser, isLoaded } = useCurrentUser();
  const profileUser = useQuery(api.users.getById, { id: userId });
  const followers = useQuery(api.follows.getFollowers, { userId });
  const removeFollower = useMutation(api.follows.removeFollower);

  const [removingFollowerId, setRemovingFollowerId] = useState<Id<"users"> | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // 自分のフォロワーページかどうか
  const isOwnProfile = currentUser?._id === userId;

  const handleRemoveFollower = async () => {
    if (!currentUser?._id || !removingFollowerId) return;

    setIsRemoving(true);
    try {
      await removeFollower({
        userId: currentUser._id,
        followerId: removingFollowerId,
      });
    } finally {
      setIsRemoving(false);
      setRemovingFollowerId(null);
    }
  };

  if (!isLoaded || profileUser === undefined || followers === undefined) {
    return <LoadingPage />;
  }

  if (!profileUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ユーザーが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link
          href={`/users/${userId}`}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">フォロワー</h1>
          <p className="text-sm text-gray-500">{profileUser.name}</p>
        </div>
      </div>

      {/* Followers List */}
      <div className="space-y-2">
        {followers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">まだフォロワーがいません</p>
          </div>
        ) : (
          followers.map((user) => (
            <div key={user._id} className="flex items-center gap-2">
              <div className="flex-1">
                <UserCard
                  user={user}
                  currentUserId={currentUser?._id}
                />
              </div>
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRemovingFollowerId(user._id)}
                  className="text-gray-400 hover:text-red-500 shrink-0"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Remove Follower Confirmation Dialog */}
      <AlertDialog.Root
        open={removingFollowerId !== null}
        onOpenChange={(open: boolean) => !open && setRemovingFollowerId(null)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-sm z-50 shadow-xl">
            <AlertDialog.Title className="text-lg font-bold text-gray-900 mb-2">
              フォロワーを削除
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mb-4">
              このユーザーをフォロワーから削除しますか？削除すると、相手はあなたをフォローしていない状態になります。
            </AlertDialog.Description>
            <div className="flex gap-2 justify-end">
              <AlertDialog.Cancel asChild>
                <Button variant="outline" disabled={isRemoving}>
                  キャンセル
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant="destructive"
                  onClick={handleRemoveFollower}
                  disabled={isRemoving}
                >
                  {isRemoving ? "削除中..." : "削除する"}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
