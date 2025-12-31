"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "@/contexts/ThemeContext";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function GenreRequestPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { themeColor } = useTheme();

  const [requestedGenre, setRequestedGenre] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex queries
  const myRequests = useQuery(
    api.genreRequests.myRequests,
    clerkUser ? {} : "skip"
  );

  // Convex mutations
  const createRequest = useMutation(api.genreRequests.create);

  if (!isClerkLoaded) {
    return <LoadingPage />;
  }

  if (!clerkUser) {
    router.push("/");
    return null;
  }

  const handleSubmit = async () => {
    if (!requestedGenre.trim()) return;

    setIsSubmitting(true);
    try {
      await createRequest({
        requestedGenre: requestedGenre.trim(),
        reason: reason.trim() || undefined,
      });
      setRequestedGenre("");
      setReason("");
      alert("ジャンル追加申請を送信しました");
    } catch (error) {
      alert(error instanceof Error ? error.message : "申請の送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRequests = myRequests?.filter(r => r.status === "pending") || [];
  const approvedRequests = myRequests?.filter(r => r.status === "approved") || [];
  const rejectedRequests = myRequests?.filter(r => r.status === "rejected") || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">ジャンル追加申請</h1>
            <p className="text-sm text-gray-500 mt-1">
              新しいジャンルの追加をリクエスト
            </p>
          </div>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-medium text-gray-900 mb-4">新しいジャンルを申請</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ジャンル名 *
            </label>
            <Input
              value={requestedGenre}
              onChange={(e) => setRequestedGenre(e.target.value)}
              placeholder="例: 背脂、あっさり、こってり"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              追加してほしいジャンル名を入力してください
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              申請理由（任意）
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="このジャンルが必要な理由を教えてください"
              rows={3}
              maxLength={200}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!requestedGenre.trim() || isSubmitting}
            className="w-full text-white"
            style={{ backgroundColor: themeColor }}
          >
            {isSubmitting ? (
              <Loading size="sm" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                申請を送信
              </>
            )}
          </Button>
        </div>
      </div>

      {/* My Requests */}
      <div className="space-y-4">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <h3 className="font-medium text-gray-900">
                  承認待ち ({pendingRequests.length})
                </h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingRequests.map((request) => (
                <div key={request._id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {request.requestedGenre}
                      </div>
                      {request.reason && (
                        <p className="text-sm text-gray-600 mb-2">
                          {request.reason}
                        </p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                      承認待ち
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(request.createdAt).toLocaleDateString("ja-JP")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Requests */}
        {approvedRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <h3 className="font-medium text-gray-900">
                  承認済み ({approvedRequests.length})
                </h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {approvedRequests.map((request) => (
                <div key={request._id} className="p-4 bg-green-50/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {request.requestedGenre}
                        {request.finalGenreName && request.finalGenreName !== request.requestedGenre && (
                          <span className="text-sm text-gray-600 ml-2">
                            → {request.finalGenreName}
                          </span>
                        )}
                      </div>
                      {request.reviewNote && (
                        <p className="text-sm text-gray-600 mb-2">
                          管理者メモ: {request.reviewNote}
                        </p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      承認済み
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>申請: {new Date(request.createdAt).toLocaleDateString("ja-JP")}</span>
                    {request.reviewedAt && (
                      <>
                        <span>•</span>
                        <span>承認: {new Date(request.reviewedAt).toLocaleDateString("ja-JP")}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Requests */}
        {rejectedRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-500" />
                <h3 className="font-medium text-gray-900">
                  却下 ({rejectedRequests.length})
                </h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {rejectedRequests.map((request) => (
                <div key={request._id} className="p-4 bg-red-50/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {request.requestedGenre}
                      </div>
                      {request.reviewNote && (
                        <p className="text-sm text-gray-600 mb-2">
                          理由: {request.reviewNote}
                        </p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                      却下
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>申請: {new Date(request.createdAt).toLocaleDateString("ja-JP")}</span>
                    {request.reviewedAt && (
                      <>
                        <span>•</span>
                        <span>却下: {new Date(request.reviewedAt).toLocaleDateString("ja-JP")}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {myRequests && myRequests.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm">
            まだ申請がありません
          </div>
        )}
      </div>
    </div>
  );
}
