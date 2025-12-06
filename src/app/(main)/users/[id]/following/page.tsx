"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { UserCard } from "@/components/features/user-card";
import { ArrowLeft } from "lucide-react";

export default function FollowingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = id as Id<"users">;

  const { user: currentUser, isLoaded } = useCurrentUser();
  const profileUser = useQuery(api.users.getById, { id: userId });
  const following = useQuery(api.follows.getFollowing, { userId });

  if (!isLoaded || profileUser === undefined || following === undefined) {
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
          <h1 className="text-lg font-bold text-gray-900">フォロー中</h1>
          <p className="text-sm text-gray-500">{profileUser.name}</p>
        </div>
      </div>

      {/* Following List */}
      <div className="space-y-2">
        {following.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">まだ誰もフォローしていません</p>
          </div>
        ) : (
          following.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              currentUserId={currentUser?._id}
            />
          ))
        )}
      </div>
    </div>
  );
}
