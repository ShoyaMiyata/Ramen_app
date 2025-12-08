"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { Loading } from "@/components/ui/loading";
import { GENRES } from "@/lib/constants/genres";
import { formatDateInput, parseDateInput, getTodayDateInput } from "@/lib/utils/date";
import { compressImage } from "@/lib/utils/image";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils/cn";
import { BADGES, HIDDEN_BADGES, ALL_BADGES, type BadgeCode, type HiddenBadgeCode, type AllBadgeCode } from "@/lib/constants/badges";
import { getRankByShopCount, type Rank } from "@/lib/constants/ranks";
import { NewBadgeModal, HiddenBadgeCompleteModal } from "./badge-display";
import { RankUpModal } from "./rank-up-modal";
import { PrefectureSelect } from "@/components/ui/prefecture-select";
import { Camera, X } from "lucide-react";

interface NoodleFormProps {
  noodle?: Doc<"noodles"> & { shop?: Doc<"shops"> | null; imageUrl?: string | null };
}

export function NoodleForm({ noodle }: NoodleFormProps) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [shopName, setShopName] = useState(noodle?.shop?.name || "");
  const [shopAddress, setShopAddress] = useState(noodle?.shop?.address || "");
  const [shopPrefecture, setShopPrefecture] = useState<string | undefined>(
    noodle?.shop?.prefecture || undefined
  );
  const [shopSearch, setShopSearch] = useState("");
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [ramenName, setRamenName] = useState(noodle?.ramenName || "");
  const [ramenNameSearch, setRamenNameSearch] = useState("");
  const [showRamenNameDropdown, setShowRamenNameDropdown] = useState(false);
  const [genres, setGenres] = useState<string[]>(noodle?.genres || []);
  const [visitDate, setVisitDate] = useState(
    noodle ? formatDateInput(noodle.visitDate) : getTodayDateInput()
  );
  const [comment, setComment] = useState(noodle?.comment || "");
  const [evaluation, setEvaluation] = useState<number | null>(
    noodle?.evaluation ?? null
  );

  // 単一画像
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(noodle?.imageUrl || null);
  const [existingImageId] = useState<Id<"_storage"> | null>(noodle?.imageId || null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBadge, setNewBadge] = useState<(typeof ALL_BADGES)[AllBadgeCode] | null>(null);
  const [rankUpInfo, setRankUpInfo] = useState<{ from: Rank; to: Rank } | null>(null);
  const [hiddenBadgeComplete, setHiddenBadgeComplete] = useState<{
    show: boolean;
    earned: number;
    total: number;
  } | null>(null);
  const prevShopCountRef = useRef<number | null>(null);

  const shops = useQuery(api.shops.search, { searchText: shopSearch });
  const ramenNameSuggestions = useQuery(api.noodles.getRamenNameSuggestions, {
    searchText: ramenNameSearch,
  });
  const userNoodles = useQuery(
    api.noodles.getByUser,
    user?._id ? { userId: user._id } : "skip"
  );
  const getOrCreateShop = useMutation(api.shops.getOrCreate);
  const createNoodle = useMutation(api.noodles.create);
  const updateNoodle = useMutation(api.noodles.update);
  const checkBadges = useMutation(api.badges.checkAndAward);
  const generateUploadUrl = useMutation(api.noodles.generateUploadUrl);

  const currentShopCount = userNoodles
    ? new Set(userNoodles.map((n) => n.shopId)).size
    : 0;

  const [isCompressing, setIsCompressing] = useState(false);

  // 画像選択と圧縮
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);

    try {
      const compressedFile = await compressImage(file);

      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);

      setImageFile(compressedFile);
      setImageRemoved(false);
    } catch {
      // 圧縮失敗時は元のファイルを使用
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
      setImageRemoved(false);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 画像削除
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
  };

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !shopName || !ramenName || genres.length === 0) return;

    prevShopCountRef.current = currentShopCount;

    setIsSubmitting(true);
    try {
      // 画像アップロード
      let imageId: Id<"_storage"> | undefined;

      if (imageFile) {
        const uploadUrl = await generateUploadUrl();
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        const { storageId } = await uploadResponse.json();
        imageId = storageId;
      } else if (existingImageId && !imageRemoved) {
        imageId = existingImageId;
      }

      const shopId = await getOrCreateShop({
        name: shopName,
        address: shopAddress || undefined,
        prefecture: shopPrefecture,
      });

      if (noodle) {
        await updateNoodle({
          id: noodle._id,
          userId: user._id,
          shopId,
          ramenName,
          genres,
          visitDate: parseDateInput(visitDate),
          comment: comment || undefined,
          evaluation: evaluation ?? undefined,
          imageId,
          removeImage: imageRemoved,
        });
        router.push(`/noodles/${noodle._id}`);
      } else {
        const result = await createNoodle({
          userId: user._id,
          shopId,
          ramenName,
          genres,
          visitDate: parseDateInput(visitDate),
          comment: comment || undefined,
          evaluation: evaluation ?? undefined,
          imageId,
        });

        const noodleId = result.noodleId;

        // ランクアップ判定
        const isNewShop = !userNoodles?.some((n) => n.shopId === shopId);
        if (isNewShop && prevShopCountRef.current !== null) {
          const newShopCount = prevShopCountRef.current + 1;
          const prevRank = getRankByShopCount(prevShopCountRef.current);
          const newRank = getRankByShopCount(newShopCount);

          if (newRank.level > prevRank.level) {
            setRankUpInfo({ from: prevRank, to: newRank });
            return;
          }
        }

        // バッジチェック
        const badgeResult = await checkBadges({ userId: user._id });

        // 隠しバッジのマイルストーン達成チェック（5個、10個、20個、または全制覇）
        const { hiddenBadgeInfo } = badgeResult;
        const milestones = [5, 10, 20, hiddenBadgeInfo.totalAvailable];
        const prevEarned = hiddenBadgeInfo.totalEarned - hiddenBadgeInfo.newHiddenBadges.length;
        const currentEarned = hiddenBadgeInfo.totalEarned;

        // マイルストーンを超えたかチェック
        const reachedMilestone = milestones.find(
          (m) => prevEarned < m && currentEarned >= m
        );

        if (reachedMilestone) {
          setHiddenBadgeComplete({
            show: true,
            earned: currentEarned,
            total: hiddenBadgeInfo.totalAvailable,
          });
          return;
        }

        // 新しいバッジがある場合は表示
        if (badgeResult.newBadges.length > 0) {
          const badge = ALL_BADGES[badgeResult.newBadges[0] as AllBadgeCode];
          if (badge) {
            setNewBadge(badge);
            return;
          }
        }

        router.push(`/noodles/${noodleId}`);
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBadgeModalClose = () => {
    setNewBadge(null);
    router.push("/noodles");
  };

  const handleRankUpModalClose = () => {
    setRankUpInfo(null);
    router.push("/noodles");
  };

  const handleHiddenBadgeCompleteClose = () => {
    setHiddenBadgeComplete(null);
    router.push("/noodles");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 写真 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            写真
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* 画像プレビュー */}
          {imagePreview && (
            <div className="relative aspect-video mb-2 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="プレビュー"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 追加ボタン */}
          {isCompressing ? (
            <div className="w-full h-32 border-2 border-dashed border-orange-300 rounded-lg flex flex-col items-center justify-center gap-2 text-orange-400">
              <Loading size="sm" />
              <span className="text-sm">画像を圧縮中...</span>
            </div>
          ) : !imagePreview && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors"
            >
              <Camera className="w-6 h-6" />
              <span className="text-sm">タップして写真を追加</span>
            </button>
          )}
        </div>

        {/* Shop Name */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            店舗名 <span className="text-red-500">*</span>
          </label>
          <Input
            value={shopName}
            onChange={(e) => {
              setShopName(e.target.value);
              setShopSearch(e.target.value);
              setShowShopDropdown(true);
            }}
            onFocus={() => setShowShopDropdown(true)}
            onBlur={() => setTimeout(() => setShowShopDropdown(false), 200)}
            placeholder="店舗名を入力"
            required
          />
          {showShopDropdown && shops && shops.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
              {shops.map((shop) => (
                <button
                  key={shop._id}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                  onClick={() => {
                    setShopName(shop.name);
                    setShopAddress(shop.address || "");
                    setShopPrefecture(shop.prefecture || undefined);
                    setShowShopDropdown(false);
                  }}
                >
                  <span className="block">{shop.name}</span>
                  {shop.address && (
                    <span className="text-xs text-gray-400">{shop.address}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prefecture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            都道府県
          </label>
          <PrefectureSelect
            value={shopPrefecture}
            onChange={setShopPrefecture}
            placeholder="都道府県を選択"
          />
        </div>

        {/* Ramen Name */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メニュー名 <span className="text-red-500">*</span>
          </label>
          <Input
            value={ramenName}
            onChange={(e) => {
              setRamenName(e.target.value);
              setRamenNameSearch(e.target.value);
              setShowRamenNameDropdown(true);
            }}
            onFocus={() => setShowRamenNameDropdown(true)}
            onBlur={() => setTimeout(() => setShowRamenNameDropdown(false), 200)}
            placeholder="例: 特製醤油らーめん"
            required
          />
          {showRamenNameDropdown && ramenNameSuggestions && ramenNameSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
              {ramenNameSuggestions
                .filter((name) => name !== ramenName)
                .map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    onClick={() => {
                      setRamenName(name);
                      setShowRamenNameDropdown(false);
                    }}
                  >
                    {name}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Genres */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ジャンル <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre.code}
                type="button"
                onClick={() => toggleGenre(genre.code)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  genres.includes(genre.code)
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {genre.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visit Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            訪問日
          </label>
          <Input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            評価
          </label>
          <StarRating
            value={evaluation}
            onChange={setEvaluation}
            size="lg"
          />
          {evaluation === null && (
            <p className="text-xs text-gray-400 mt-1">未評価</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            コメント
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="味の感想やこだわりポイントなど"
            maxLength={1000}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {comment.length}/1000
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={
            isSubmitting || !shopName || !ramenName || genres.length === 0
          }
        >
          {isSubmitting ? (
            <Loading size="sm" className="text-white" />
          ) : noodle ? (
            "更新する"
          ) : (
            "この一杯を記録"
          )}
        </Button>
      </form>

      <NewBadgeModal badge={newBadge} onClose={handleBadgeModalClose} />
      <RankUpModal
        fromRank={rankUpInfo?.from ?? null}
        toRank={rankUpInfo?.to ?? null}
        onClose={handleRankUpModalClose}
      />
      <HiddenBadgeCompleteModal
        open={hiddenBadgeComplete?.show ?? false}
        onClose={handleHiddenBadgeCompleteClose}
        completedCount={hiddenBadgeComplete?.earned ?? 0}
        totalCount={hiddenBadgeComplete?.total ?? 0}
      />
    </>
  );
}
