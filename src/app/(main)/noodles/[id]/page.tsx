"use client";

import { use, useState, useEffect, useRef } from "react";
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
import { getPrefectureName } from "@/lib/utils/prefecture";
import { ArrowLeft, Edit, Trash2, Heart, MessageCircle, Send, X, User, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const handleImageTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleImageTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleImageTouchEnd = () => {
    if (noodle && noodle.imageUrls && Math.abs(touchDeltaX.current) > 50) {
      if (touchDeltaX.current < 0 && currentImageIndex < noodle.imageUrls.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
      } else if (touchDeltaX.current > 0 && currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1);
      }
    }
    touchDeltaX.current = 0;
  };

  const noodleId = id as Id<"noodles">;

  const noodle = useQuery(api.noodles.getById, { id: noodleId });
  const adjacentPosts = useQuery(api.noodles.getAdjacentPosts, {
    currentId: noodleId,
    viewerId: user?._id,
  });

  const commentsData = useQuery(api.comments.getByNoodle, { noodleId, limit: 20 });
  const commentCount = useQuery(api.comments.getCount, { noodleId });
  const createComment = useMutation(api.comments.create);
  const removeComment = useMutation(api.comments.remove);

  const commentIds = commentsData?.items.map(c => c._id) ?? [];
  const commentLikeCounts = useQuery(
    api.commentLikes.getCountBatch,
    commentIds.length > 0 ? { commentIds } : "skip"
  );
  const commentLikeStates = useQuery(
    api.commentLikes.isLikedBatch,
    user && commentIds.length > 0 ? { userId: user._id, commentIds } : "skip"
  );
  const toggleCommentLike = useMutation(api.commentLikes.toggle);

  useEffect(() => {
    if (commentsData?.items) {
      setAllComments(commentsData.items);
    }
  }, [commentsData]);

  const isLiked = useQuery(
    api.likes.isLiked,
    user && noodle ? { userId: user._id, noodleId: noodle._id } : "skip"
  );
  const likeCount = useQuery(api.likes.getCount, { noodleId });
  const likeUsers = useQuery(
    api.likes.getLikeUsers,
    showLikeUsersModal ? { noodleId } : "skip"
  );

  const toggleLike = useMutation(api.likes.toggle);
  const removeNoodle = useMutation(api.noodles.remove);

  if (!isLoaded || noodle === undefined) return <LoadingPage />;

  if (!noodle) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">記録が見つかりません</p>
        <Link href="/noodles"><Button variant="outline">一覧に戻る</Button></Link>
      </div>
    );
  }

  const isOwner = user?._id === noodle.userId;
  const isAdmin = user?.isAdmin === true;
  const canEdit = isOwner || isAdmin;

  const handleLike = async () => {
    if (!user) return;
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 400);
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
      await createComment({ noodleId, userId: user._id, content: commentText.trim() });
      setCommentText("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: Id<"comments">) => {
    if (!user) return;
    try { await removeComment({ commentId, userId: user._id }); }
    catch (error) { console.error("Failed to delete comment:", error); }
  };

  const handleCommentLike = async (commentId: Id<"comments">) => {
    if (!user) return;
    try { await toggleCommentLike({ userId: user._id, commentId }); }
    catch (error) { console.error("Failed to toggle comment like:", error); }
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
    <div className="-mx-4 -mt-4">
      {noodle.imageUrls && noodle.imageUrls.length > 0 && (
        <div
          className="relative"
          onTouchStart={handleImageTouchStart}
          onTouchMove={handleImageTouchMove}
          onTouchEnd={handleImageTouchEnd}
        >
          <div className="overflow-hidden aspect-square">
            <div
              className="flex transition-transform duration-300 ease-out h-full"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {noodle.imageUrls.map((url, idx) => (
                <div key={idx} className="w-full flex-shrink-0 h-full relative">
                  <Image
                    src={url}
                    alt={`${noodle.ramenName} ${idx + 1}`}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {noodle.imageUrls.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {noodle.imageUrls.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    idx === currentImageIndex ? "bg-white" : "bg-white/40"
                  )}
                />
              ))}
            </div>
          )}

          <div
            className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-4 py-3"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)" }}
          >
            <Link
              href="/noodles"
              className="p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1" />
            {adjacentPosts?.prev && (
              <Link
                href={`/noodles/${adjacentPosts.prev._id}`}
                className="p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            )}
            {adjacentPosts?.next && (
              <Link
                href={`/noodles/${adjacentPosts.next._id}`}
                className="p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
            {canEdit && (
              <Link
                href={`/noodles/${noodle._id}/edit`}
                className="p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
              >
                <Edit className="w-5 h-5" />
              </Link>
            )}
          </div>

          {noodle.user && (
            <Link
              href={`/users/${noodle.userId}`}
              className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-3 px-4 py-3"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)" }}
            >
              {noodle.user.imageUrl ? (
                <img
                  src={noodle.user.imageUrl}
                  alt={noodle.user.name || ""}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-white/80" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-white drop-shadow-sm block truncate">
                  {noodle.user.name || "ユーザー"}
                </span>
                <span className="text-xs text-white/70 drop-shadow-sm">
                  {formatDate(noodle._creationTime)}
                </span>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-4 mb-2">
          {!isOwner ? (
            <button onClick={handleLike} className="relative flex items-center justify-center">
              <motion.div
                animate={isLikeAnimating ? { scale: [1, 1.3, 0.9, 1.1, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Heart
                  className={cn(
                    "w-7 h-7 transition-colors",
                    isLiked ? "fill-red-500 text-red-500" : "text-gray-900 hover:text-gray-600"
                  )}
                />
              </motion.div>
            </button>
          ) : (
            <Heart className="w-7 h-7 text-gray-900" />
          )}
          <MessageCircle className="w-7 h-7 text-gray-900" />
          <div className="ml-auto">
            <StarRating value={noodle.evaluation} readonly size="md" />
          </div>
        </div>

        {likeCount !== undefined && likeCount > 0 && (
          <button
            onClick={() => setShowLikeUsersModal(true)}
            className="text-sm font-semibold text-gray-900 mb-1 block"
          >
            {likeCount.toLocaleString()}件のいいね
          </button>
        )}

        <div className="mb-1">
          {noodle.shopId ? (
            <Link
              href={`/shops/${noodle.shopId}?from=noodle&noodleId=${noodle._id}`}
              className="font-bold text-gray-900 hover:text-orange-500 transition-colors"
            >
              {noodle.shop?.name || "不明な店舗"}
            </Link>
          ) : (
            <span className="font-bold text-gray-900">{noodle.shop?.name || "不明な店舗"}</span>
          )}
          <span className="text-gray-600 ml-2">{noodle.ramenName}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {noodle.genres.map((genre) => (
            <Badge key={genre} rarity="common" className="text-[10px]">
              {genre}
            </Badge>
          ))}
        </div>

        {noodle.comment && (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-2">
            {noodle.user && <span className="font-semibold text-gray-900 mr-1">{noodle.user.name}</span>}
            {noodle.comment}
          </p>
        )}

        <div className="text-xs text-gray-500 space-x-2 mb-2">
          {noodle.visitDate && <span>訪問 {formatDate(noodle.visitDate)}</span>}
          {noodle.shop?.prefecture && <span>· {getPrefectureName(noodle.shop.prefecture)}</span>}
          {noodle.shop?.station && <span>· {noodle.shop.station}</span>}
        </div>

        {canEdit && (
          <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <Dialog.Trigger asChild>
              <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                この投稿を削除
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-sm z-[101]">
                <Dialog.Title className="font-bold text-lg text-gray-900 mb-2">記録を削除</Dialog.Title>
                <Dialog.Description className="text-gray-500 text-sm mb-4">
                  この記録を削除してもよろしいですか？この操作は取り消せません。
                </Dialog.Description>
                <div className="flex gap-3 justify-end">
                  <Dialog.Close asChild>
                    <Button variant="outline" size="sm">キャンセル</Button>
                  </Dialog.Close>
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? <Loading size="sm" /> : "削除する"}
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </div>

      <div className="border-t border-gray-100 mx-4" />

      <div className="px-4 py-3">
        {commentCount !== undefined && commentCount > 0 && (
          <p className="text-sm text-gray-500 mb-3">
            コメント{commentCount}件
          </p>
        )}

        <div className="space-y-3">
          {commentsData === undefined ? (
            <div className="py-4 text-center"><Loading size="sm" /></div>
          ) : allComments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">まだコメントはありません</p>
          ) : (
            allComments.map((comment) => (
              <div key={comment._id} className="flex gap-2.5 group">
                <Link href={`/users/${comment.userId}`} className="flex-shrink-0">
                  {comment.user?.imageUrl ? (
                    <img src={comment.user.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    <Link href={`/users/${comment.userId}`} className="font-semibold text-gray-900 mr-1 hover:underline">
                      {comment.user?.name || "ユーザー"}
                    </Link>
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                    {user && (
                      <button
                        onClick={() => handleCommentLike(comment._id)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        <Heart className={cn("w-3 h-3", commentLikeStates?.[comment._id] && "fill-orange-500 text-orange-500")} />
                        {commentLikeCounts?.[comment._id] !== undefined && commentLikeCounts[comment._id] > 0 && (
                          <span>{commentLikeCounts[comment._id]}</span>
                        )}
                      </button>
                    )}
                    {user?._id === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-xs text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {commentsData?.hasMore && (
            <button
              onClick={() => {}}
              className="text-sm text-center w-full py-1"
              style={{ color: themeColor }}
            >
              さらに表示
            </button>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
            )}
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="コメントを追加..."
              className="flex-1 text-sm bg-transparent border-none outline-none placeholder-gray-400"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(); }
              }}
            />
            <button
              onClick={handleCommentSubmit}
              disabled={!commentText.trim() || isSubmittingComment}
              className="text-sm font-semibold disabled:opacity-30 transition-opacity"
              style={{ color: themeColor }}
            >
              投稿
            </button>
          </div>
        )}
      </div>

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
                <h2 className="font-bold text-lg text-gray-900">いいねした人</h2>
                <button onClick={() => setShowLikeUsersModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {likeUsers === undefined ? (
                  <div className="flex justify-center py-8"><Loading size="sm" /></div>
                ) : likeUsers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">まだいいねがありません</p>
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
                          <img src={likeUser.imageUrl} alt={likeUser.name || ""} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{likeUser.name || "ユーザー"}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
