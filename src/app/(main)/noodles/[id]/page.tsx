"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatDate } from "@/lib/utils/date";
import { ArrowLeft, Edit, Trash2, Heart } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

export default function NoodleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const noodle = useQuery(api.noodles.getById, {
    id: id as Id<"noodles">,
  });

  const isLiked = useQuery(
    api.likes.isLiked,
    user && noodle
      ? { userId: user._id, noodleId: noodle._id }
      : "skip"
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
        <div className="rounded-xl overflow-hidden shadow-sm">
          <img
            src={noodle.imageUrl}
            alt={noodle.ramenName}
            className="w-full aspect-video object-cover"
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
    </div>
  );
}
