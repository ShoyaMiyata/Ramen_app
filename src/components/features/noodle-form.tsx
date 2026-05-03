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
import { StationSelect } from "@/components/ui/station-select";
import { ImageCropper } from "@/components/ui/image-cropper";
import { Camera, X } from "lucide-react";

interface NoodleFormProps {
  noodle?: Doc<"noodles"> & {
    shop?: Doc<"shops"> | null;
    imageUrl?: string | null;
    imageUrls?: string[];
    r2ImageUrls?: string[];
    r2ImageKeys?: string[];
  };
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
  const [shopStation, setShopStation] = useState(noodle?.shop?.station || "");
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
  const [isArchived, setIsArchived] = useState(noodle?.isArchived || false);
  const [isDraft, setIsDraft] = useState(noodle?.isDraft || false);

  const [images, setImages] = useState<Array<{ file?: File; preview: string; r2Url?: string; r2Key?: string }>>(() => {
    if (noodle?.r2ImageUrls && noodle.r2ImageUrls.length > 0) {
      return noodle.r2ImageUrls.map((url, i) => ({
        preview: url,
        r2Url: url,
        r2Key: noodle.r2ImageKeys?.[i],
      }));
    }
    if (noodle?.r2ImageUrl) {
      return [{ preview: noodle.r2ImageUrl, r2Url: noodle.r2ImageUrl, r2Key: noodle.r2ImageKey }];
    }
    if (noodle?.imageUrl) {
      return [{ preview: noodle.imageUrl }];
    }
    return [];
  });
  const [removedR2Keys, setRemovedR2Keys] = useState<string[]>([]);

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
  const availableGenres = useQuery(api.genres.list);
  const getOrCreateShop = useMutation(api.shops.getOrCreate);
  const createNoodle = useMutation(api.noodles.create);
  const updateNoodle = useMutation(api.noodles.update);
  const checkBadges = useMutation(api.badges.checkAndAward);

  const currentShopCount = userNoodles
    ? new Set(userNoodles.items.map((n: any) => n.shopId)).size
    : 0;

  const [isCompressing, setIsCompressing] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= 5) return;

    console.log("画像選択:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
    });

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageToCrop(ev.target?.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setImageToCrop(null);
    setIsCompressing(true);

    try {
      const croppedFile = new File([croppedBlob], "cropped-image.jpg", {
        type: "image/jpeg",
      });

      console.log("トリミング完了:", {
        size: `${(croppedFile.size / 1024 / 1024).toFixed(2)}MB`
      });

      const compressedFile = await compressImage(croppedFile, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8
      });

      console.log("画像圧縮完了:", {
        originalSize: `${(croppedFile.size / 1024 / 1024).toFixed(2)}MB`,
        compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
        ratio: `${((compressedFile.size / croppedFile.size) * 100).toFixed(1)}%`
      });

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(compressedFile);
      });

      setImages(prev => [...prev, { file: compressedFile, preview: dataUrl }]);
    } catch (error) {
      console.error("画像処理エラー:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
  };

  const handleRemoveImage = (index: number) => {
    const img = images[index];
    if (img.r2Key) {
      setRemovedR2Keys(prev => [...prev, img.r2Key!]);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
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
      let r2ImageUrls: string[] = [];
      let r2ImageKeys: string[] = [];

      await Promise.all(
        removedR2Keys.map((key) =>
          fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key }),
          }).catch((error) => console.error("Failed to delete R2 image:", error))
        )
      );

      const uploadResults = await Promise.all(
        images.map(async (img) => {
          if (img.file) {
            const formData = new FormData();
            formData.append("file", img.file);
            const uploadResponse = await fetch("/api/upload", { method: "POST", body: formData });
            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json().catch(() => ({ error: "不明なエラー" }));
              throw new Error(`画像のアップロードに失敗しました: ${errorData.error}`);
            }
            const { url, key } = await uploadResponse.json();
            return { url, key };
          } else if (img.r2Url) {
            return { url: img.r2Url, key: img.r2Key || "" };
          }
          return null;
        })
      );

      for (const result of uploadResults) {
        if (result) {
          r2ImageUrls.push(result.url);
          if (result.key) r2ImageKeys.push(result.key);
        }
      }

      const removeImage = images.length === 0 && !!(noodle?.r2ImageUrl || noodle?.r2ImageUrls);

      const shopId = await getOrCreateShop({
        name: shopName,
        address: shopAddress || undefined,
        prefecture: shopPrefecture,
        station: shopStation || undefined,
        userId: user._id,
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
          r2ImageUrls: r2ImageUrls.length > 0 ? r2ImageUrls : undefined,
          r2ImageKeys: r2ImageKeys.length > 0 ? r2ImageKeys : undefined,
          removeImage,
          isArchived: isArchived || undefined,
          isDraft: isDraft || undefined,
        });
        router.push("/noodles");
      } else {
        const result = await createNoodle({
          userId: user._id,
          shopId,
          ramenName,
          genres,
          visitDate: parseDateInput(visitDate),
          comment: comment || undefined,
          evaluation: evaluation ?? undefined,
          r2ImageUrls: r2ImageUrls.length > 0 ? r2ImageUrls : undefined,
          r2ImageKeys: r2ImageKeys.length > 0 ? r2ImageKeys : undefined,
          isArchived: isArchived || undefined,
          isDraft: isDraft || undefined,
        });

        const noodleId = result.noodleId;

        const isNewShop = !userNoodles?.items.some((n: any) => n.shopId === shopId);
        if (isNewShop && prevShopCountRef.current !== null) {
          const newShopCount = prevShopCountRef.current + 1;
          const prevRank = getRankByShopCount(prevShopCountRef.current);
          const newRank = getRankByShopCount(newShopCount);

          if (newRank.level > prevRank.level) {
            setRankUpInfo({ from: prevRank, to: newRank });
            return;
          }
        }

        const badgeResult = await checkBadges({ userId: user._id });

        const { hiddenBadgeInfo } = badgeResult;
        const milestones = [5, 10, 20, hiddenBadgeInfo.totalAvailable];
        const prevEarned = hiddenBadgeInfo.totalEarned - hiddenBadgeInfo.newHiddenBadges.length;
        const currentEarned = hiddenBadgeInfo.totalEarned;

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
      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={4 / 3}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 写真 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            写真（最大5枚）
          </label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <div key={index} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-3 h-3" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">メイン</span>
                )}
              </div>
            ))}
            {images.length < 5 && !isCompressing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px]">{images.length}/5</span>
              </button>
            )}
            {isCompressing && (
              <div className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-orange-300 rounded-lg flex items-center justify-center">
                <Loading size="sm" />
              </div>
            )}
          </div>
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
                    setShopStation(shop.station || "");
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

        {/* Station */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            最寄り駅（任意）
          </label>
          <StationSelect
            value={shopStation}
            onChange={setShopStation}
            prefecture={shopPrefecture}
            placeholder="駅名を検索"
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
            {!availableGenres ? (
              <Loading size="sm" />
            ) : (
              availableGenres.map((genre) => (
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
              ))
            )}
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

        {/* Archive Option */}
        <div className="bg-gray-50 border border-gray-200 rounded p-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isArchived}
              onChange={(e) => setIsArchived(e.target.checked)}
              className="h-3 w-3 text-gray-400 border-gray-300 rounded focus:ring-gray-300"
            />
            <div className="flex-1">
              <span className="text-xs text-gray-600">
                アーカイブ投稿（タイムライン非表示）
              </span>
            </div>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          {(!noodle || noodle.isDraft) && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={
                isSubmitting || !shopName || !ramenName || genres.length === 0
              }
              onClick={() => {
                setIsDraft(true);
                setTimeout(() => {
                  const form = document.querySelector('form');
                  if (form) form.requestSubmit();
                }, 0);
              }}
            >
              {isSubmitting && isDraft ? (
                <Loading size="sm" />
              ) : (
                "下書き保存"
              )}
            </Button>
          )}
          <Button
            type="button"
            className="flex-1"
            disabled={
              isSubmitting || !shopName || !ramenName || genres.length === 0
            }
            onClick={() => {
              setIsDraft(false);
              setTimeout(() => {
                const form = document.querySelector('form');
                if (form) form.requestSubmit();
              }, 0);
            }}
          >
            {isSubmitting && !isDraft ? (
              <Loading size="sm" className="text-white" />
            ) : noodle ? (
              noodle.isDraft ? "公開する" : "更新する"
            ) : (
              "この一杯を記録"
            )}
          </Button>
        </div>
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
