"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { NoodleCard } from "@/components/features/noodle-card";
import { Heart } from "lucide-react";

export default function LikesPage() {
  const { user, isLoaded } = useCurrentUser();

  const likes = useQuery(
    api.likes.getByUser,
    user?._id ? { userId: user._id } : "skip"
  );

  if (!isLoaded) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 text-orange-500" />
        <h1 className="font-bold text-xl text-gray-900">いいねした一杯</h1>
      </div>

      {likes === undefined ? (
        <Loading className="py-8" />
      ) : likes.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">いいねした一杯はまだありません</p>
          <p className="text-sm text-gray-400 mt-1">
            気になった一杯にいいねしてみよう
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {likes.map((noodle) => (
            <NoodleCard key={noodle._id} noodle={noodle} currentUserId={user?._id} />
          ))}
        </div>
      )}
    </div>
  );
}
