"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatDate } from "@/lib/utils/date";
import { ArrowLeft, Edit, Trash2, Heart, MessageCircle, Send, X, User } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export default function NoodleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [showLikeUsersModal, setShowLikeUsersModal] = useState(false);

  const noodleId = id as Id<"noodles">;

  const noodle = useQuery(api.noodles.getById, {
    id: noodleId,
  });

  const commentsData = useQuery(api.comments.getByNoodle, { noodleId, limit: 20 });
  const commentCount = useQuery(api.comments.getCount, { noodleId });
  const createComment = useMutation(api.comments.create);
  const removeComment = useMutation(api.comments.remove);

  // コメントデータを状態にセット
  useEffect(() => {
    if (commentsData?.items) {
      setAllComments(commentsData.items);
    }
  }, [commentsData]);

  const isLiked = useQuery(
    api.likes.isLiked,
    user && noodle
      ? { userId: user._id, noodleId: noodle._id }
      : "skip"
  );

  const likeCount = useQuery(api.likes.getCount, { noodleId });

  const likeUsers = useQuery(
    api.likes.getLikeUsers,
    showLikeUsersModal ? { noodleId } : "skip"
  );

  const toggleLike = useMutation(api.likes.toggle);
  const removeNoodle = useMutation(api.noodles.remove);

  if (!isLoaded || noodle === undefined) {
    return <LoadingPage />;
  }

  if (!noodle) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">記録が見つかりません</p>
        <Link href="/noodles">
          <Button variant="outline">一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  const isOwner = user?._id === noodle.userId;

  const handleLike = async () => {
    if (!user) return;
    await toggleLike({ userId: user._id, noodleId: noodle._id });
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await removeNoodle({ id: noodle._id, userId: user._id });
      router.push("/noodles");
    } catch (error) {
      console.error("Failed to delete:", error);
      setIsDeleting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user || !commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await createComment({
        noodleId,
        userId: user._id,
        content: commentText.trim(),
      });
      setCommentText("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: Id<"comments">) => {
    if (!user) return;
    try {
      await removeComment({ commentId, userId: user._id });
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return formatDate(timestamp);
  };

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">戻る</span>
      </button>

      {/* Image */}
      {noodle.imageUrl && (
        <div className="rounded-xl overflow-hidden shadow-sm relative aspect-video">
          <Image
            src={noodle.imageUrl}
            alt={noodle.ramenName}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        {/* Header */}
        <div>
          <h1 className="font-bold text-xl text-gray-900">
            {noodle.shop?.name || "不明な店舗"}
          </h1>
          <p className="text-gray-600">{noodle.ramenName}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <StarRating value={noodle.evaluation} readonly size="md" />
          {noodle.evaluation === null ||
            (noodle.evaluation === undefined && (
              <span className="text-sm text-gray-400">未評価</span>
            ))}
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-2">
          {noodle.genres.map((genre) => (
            <Badge key={genre} rarity="common">
              {genre}
            </Badge>
          ))}
        </div>

        {/* Visit Date */}
        {noodle.visitDate && (
          <p className="text-sm text-gray-500">
            訪問日: {formatDate(noodle.visitDate)}
          </p>
        )}

        {/* Comment */}
        {noodle.comment && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-700 whitespace-pre-wrap">{noodle.comment}</p>
          </div>
        )}

        {/* User Info */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          {noodle.user?.imageUrl && (
            <img
              src={noodle.user.imageUrl}
              alt={noodle.user.name || ""}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {noodle.user?.name || "ユーザー"}
            </p>
            <p className="text-xs text-gray-400">
              投稿日: {formatDate(noodle._creationTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {isOwner ? (
          <>
            <Link href={`/noodles/${noodle._id}/edit`} className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <Edit className="w-4 h-4" />
                編集
              </Button>
            </Link>
            <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <Dialog.Trigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  削除
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-sm">
                  <Dialog.Title className="font-bold text-lg text-gray-900 mb-2">
                    記録を削除
                  </Dialog.Title>
                  <Dialog.Description className="text-gray-500 text-sm mb-4">
                    この記録を削除してもよろしいですか？この操作は取り消せません。
                  </Dialog.Description>
                  <div className="flex gap-3 justify-end">
                    <Dialog.Close asChild>
                      <Button variant="outline" size="sm">
                        キャンセル
                      </Button>
                    </Dialog.Close>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? <Loading size="sm" /> : "削除する"}
                    </Button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </>
        ) : (
          <Button
            variant={isLiked ? "default" : "outline"}
            className="flex-1 gap-2"
            onClick={handleLike}
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
            />
            {isLiked ? "いいね済み" : "いいね"}
          </Button>
        )}
      </div>

      {/* Like Count - クリックでいいねしたユーザー一覧表示 */}
      {likeCount !== undefined && likeCount > 0 && (
        <button
          onClick={() => setShowLikeUsersModal(true)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <Heart className="w-4 h-4" style={{ color: themeColor }} />
          <span>{likeCount}人がいいね</span>
        </button>
      )}

      {/* Like Users Modal */}
      <AnimatePresence>
        {showLikeUsersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLikeUsersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full max-h-[60vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-lg">いいねした人</h2>
                <button
                  onClick={() => setShowLikeUsersModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {likeUsers === undefined ? (
                  <div className="flex justify-center py-8">
                    <Loading size="sm" />
                  </div>
                ) : likeUsers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    まだいいねがありません
                  </p>
                ) : (
                  <div className="space-y-3">
                    {likeUsers.map((likeUser) => (
                      <Link
                        key={likeUser._id}
                        href={`/users/${likeUser._id}`}
                        onClick={() => setShowLikeUsersModal(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                      >
                        {likeUser.imageUrl ? (
                          <img
                            src={likeUser.imageUrl}
                            alt={likeUser.name || ""}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">
                          {likeUser.name || "ユーザー"}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5" style={{ color: themeColor }} />
          <h2 className="font-bold text-gray-900">
            コメント {commentCount !== undefined && commentCount > 0 && `(${commentCount})`}
          </h2>
        </div>

        {/* Comment Input */}
        {user && (
          <div className="flex gap-2 mb-4">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt=""
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
            )}
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="コメントを入力..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <button
                onClick={handleCommentSubmit}
                disabled={!commentText.trim() || isSubmittingComment}
                className="p-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: themeColor, color: "white" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-3">
          {commentsData === undefined ? (
            <div className="py-4 text-center">
              <Loading size="sm" />
            </div>
          ) : allComments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              まだコメントはありません
            </p>
          ) : (
            allComments.map((comment) => (
              <div key={comment._id} className="flex gap-2 group">
                <Link href={`/users/${comment.userId}`}>
                  {comment.user?.imageUrl ? (
                    <img
                      src={comment.user.imageUrl}
                      alt=""
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <Link
                      href={`/users/${comment.userId}`}
                      className="text-sm font-medium text-gray-900 hover:underline"
                    >
                      {comment.user?.name || "ユーザー"}
                    </Link>
                    <p className="text-sm text-gray-700 break-words">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                    {user?._id === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {/* Load More Button */}
          {commentsData?.hasMore && (
            <button
              onClick={() => {/* TODO: Load more comments */}}
              className="text-sm text-center w-full py-2 hover:text-gray-600"
              style={{ color: themeColor }}
            >
              さらに表示
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
