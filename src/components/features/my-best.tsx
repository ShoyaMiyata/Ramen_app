"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { StarRating } from "@/components/ui/star-rating";
import { Trophy, ChevronDown, Check, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { cn } from "@/lib/utils/cn";

const BEST_CATEGORIES = [
  { code: "overall", label: "総合ベスト", genreFilter: null }, // 全て選択可能
  { code: "shoyu", label: "醤油部門", genreFilter: "醤油" },
  { code: "shio", label: "塩部門", genreFilter: "塩" },
  { code: "miso", label: "味噌部門", genreFilter: "味噌" },
  { code: "tonkotsu", label: "とんこつ部門", genreFilter: "とんこつ" },
  { code: "iekei", label: "家系部門", genreFilter: "家系" },
  { code: "jiro", label: "二郎系部門", genreFilter: "二郎系" },
  { code: "gyokai", label: "魚介部門", genreFilter: "魚介" },
  { code: "niboshi", label: "煮干し部門", genreFilter: "煮干し" },
  { code: "tsukemen", label: "つけ麺部門", genreFilter: "つけ麺" },
  { code: "tantan", label: "担々麺部門", genreFilter: "担々麺" },
  { code: "toripaitan", label: "鶏白湯部門", genreFilter: "鶏白湯" },
  { code: "other", label: "その他部門", genreFilter: "その他" },
];

interface MyBestDisplayProps {
  userId: Id<"users">;
  editable?: boolean;
}

export function MyBestDisplay({ userId, editable = false }: MyBestDisplayProps) {
  const myBests = useQuery(api.myBests.getByUser, { userId });
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (myBests === undefined) {
    return <Loading className="py-4" />;
  }

  const bestsByCategory = new Map(myBests.map((b) => [b.category, b]));

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="font-bold text-gray-900">推しメン</h2>
        </div>
        {editable && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
            編集
          </Button>
        )}
      </div>

      {myBests.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          まだ選んでいません
        </p>
      ) : (
        <div className="space-y-3">
          {BEST_CATEGORIES.map((cat) => {
            const best = bestsByCategory.get(cat.code);
            if (!best) return null;

            return (
              <Link
                key={cat.code}
                href={`/noodles/${best.noodle._id}`}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {best.noodle.imageUrl && (
                  <img
                    src={best.noodle.imageUrl}
                    alt={best.noodle.ramenName}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-orange-500 font-medium">
                    {cat.label}
                  </p>
                  <p className="font-medium text-gray-900 truncate">
                    {best.noodle.shop?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {best.noodle.ramenName}
                  </p>
                </div>
                {best.noodle.evaluation && (
                  <StarRating value={best.noodle.evaluation} readonly size="sm" />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {editable && (
        <MyBestEditDialog
          userId={userId}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </div>
  );
}

interface MyBestEditDialogProps {
  userId: Id<"users">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MyBestEditDialog({ userId, open, onOpenChange }: MyBestEditDialogProps) {
  // ダイアログが開いている時だけクエリを実行
  const myNoodles = useQuery(
    api.noodles.getByUser,
    open ? { userId } : "skip"
  );
  const myBests = useQuery(
    api.myBests.getByUser,
    open ? { userId } : "skip"
  );
  const setMyBest = useMutation(api.myBests.set);
  const removeMyBest = useMutation(api.myBests.remove);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || !myNoodles || !myBests) {
    return null;
  }

  const bestsByCategory = new Map(myBests.map((b) => [b.category, b]));

  const handleSelect = async (noodleId: Id<"noodles">) => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    try {
      await setMyBest({
        userId,
        category: selectedCategory,
        noodleId,
      });
      setSelectedCategory(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (category: string) => {
    setIsSubmitting(true);
    try {
      await removeMyBest({ userId, category });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <Dialog.Title className="font-bold text-lg">
              推しメンを編集
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {selectedCategory ? (
              (() => {
                const category = BEST_CATEGORIES.find((c) => c.code === selectedCategory);
                const genreFilter = category?.genreFilter;

                // ジャンルでフィルタリング（総合の場合は全て表示）
                const filteredNoodles = genreFilter
                  ? myNoodles.items.filter((noodle: any) =>
                      noodle.genres.some(
                        (g: any) => g === genreFilter || g.includes(genreFilter) || genreFilter.includes(g)
                      )
                    )
                  : myNoodles.items;

                return (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {category?.label}を選択
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                      >
                        戻る
                      </Button>
                    </div>

                    {filteredNoodles.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          {genreFilter}の記録がありません
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {genreFilter}タグを付けたラーメンを登録してください
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredNoodles.map((noodle) => (
                          <button
                            key={noodle._id}
                            onClick={() => handleSelect(noodle._id)}
                            disabled={isSubmitting}
                            className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {noodle.imageUrl && (
                              <img
                                src={noodle.imageUrl}
                                alt={noodle.ramenName}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0 text-left">
                              <p className="font-medium text-gray-900 truncate">
                                {noodle.shop?.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {noodle.ramenName}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {noodle.genres.map((genre: any) => (
                                  <span
                                    key={genre}
                                    className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded"
                                  >
                                    {genre}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {noodle.evaluation && (
                              <StarRating value={noodle.evaluation} readonly size="sm" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              <div className="space-y-2">
                {BEST_CATEGORIES.map((cat) => {
                  const current = bestsByCategory.get(cat.code);

                  return (
                    <div
                      key={cat.code}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{cat.label}</p>
                        {current ? (
                          <p className="text-sm text-gray-500 truncate">
                            {current.noodle.shop?.name} - {current.noodle.ramenName}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">未選択</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCategory(cat.code)}
                        >
                          選択
                        </Button>
                        {current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(cat.code)}
                            disabled={isSubmitting}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
