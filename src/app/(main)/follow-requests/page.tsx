"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Id } from "../../../../convex/_generated/dataModel";
import { UserPlus, ChevronLeft, Check, X } from "lucide-react";
import { useState } from "react";

export default function FollowRequestsPage() {
  const { user, isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();

  const pendingRequests = useQuery(
    api.follows.getPendingRequests,
    user?._id ? { userId: user._id } : "skip"
  );

  const approveRequest = useMutation(api.follows.approveRequest);
  const rejectRequest = useMutation(api.follows.rejectRequest);

  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleApprove = async (requestId: Id<"followRequests">) => {
    setProcessingIds((prev) => new Set(prev).add(requestId));
    try {
      await approveRequest({ requestId });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleReject = async (requestId: Id<"followRequests">) => {
    setProcessingIds((prev) => new Set(prev).add(requestId));
    try {
      await rejectRequest({ requestId });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  if (!isLoaded) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <UserPlus className="w-6 h-6" style={{ color: themeColor }} />
        <h1 className="text-xl font-bold text-gray-900">フォローリクエスト</h1>
      </div>

      <p className="text-sm text-gray-500">
        あなたをフォローしたい人からのリクエストです
      </p>

      <div className="space-y-2">
        {pendingRequests === undefined ? (
          <div className="text-center py-8 text-gray-400">読み込み中...</div>
        ) : pendingRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <UserPlus className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">フォローリクエストはありません</p>
          </div>
        ) : (
          pendingRequests.map((request) => (
            <div
              key={request.requestId}
              className="bg-white rounded-xl p-4 flex items-center gap-4"
            >
              <Link href={`/users/${request.user?._id}`} className="flex-shrink-0">
                {request.user?.imageUrl ? (
                  <img
                    src={request.user.imageUrl}
                    alt={request.user.name || ""}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                    {request.user?.name?.charAt(0) || "?"}
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/users/${request.user?._id}`}>
                  <p className="font-medium text-gray-900 truncate hover:underline">
                    {request.user?.name || "ユーザー"}
                  </p>
                </Link>
                <p className="text-xs text-gray-400">
                  {new Date(request.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleApprove(request.requestId)}
                  disabled={processingIds.has(request.requestId)}
                  className="gap-1"
                >
                  <Check className="w-4 h-4" />
                  承認
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(request.requestId)}
                  disabled={processingIds.has(request.requestId)}
                  className="gap-1"
                >
                  <X className="w-4 h-4" />
                  拒否
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
