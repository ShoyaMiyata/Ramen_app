"use client";

import { useState, useEffect, useRef } from "react";
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
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils/cn";
import { BADGES, type BadgeCode } from "@/lib/constants/badges";
import { NewBadgeModal } from "./badge-display";
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
  const [shopSearch, setShopSearch] = useState("");
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [ramenName, setRamenName] = useState(noodle?.ramenName || "");
  const [genres, setGenres] = useState<string[]>(noodle?.genres || []);
  // 新規の場合は今日の日付をデフォルトに
  const [visitDate, setVisitDate] = useState(
    noodle ? formatDateInput(noodle.visitDate) : getTodayDateInput()
  );
  const [comment, setComment] = useState(noodle?.comment || "");
  const [evaluation, setEvaluation] = useState<number | null>(
    noodle?.evaluation ?? null
  );

  // 画像
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    noodle?.imageUrl || null
  );
  const [existingImageId, setExistingImageId] = useState<Id<"_storage"> | null>(
    noodle?.imageId || null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBadge, setNewBadge] = useState<(typeof BADGES)[BadgeCode] | null>(
    null
  );

  const shops = useQuery(api.shops.search, { searchText: shopSearch });
  const getOrCreateShop = useMutation(api.shops.getOrCreate);
  const createNoodle = useMutation(api.noodles.create);
  const updateNoodle = useMutation(api.noodles.update);
  const checkBadges = useMutation(api.badges.checkAndAward);
  const generateUploadUrl = useMutation(api.noodles.generateUploadUrl);

  // 画像選択
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  // 画像削除
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

    setIsSubmitting(true);
    try {
      // 画像アップロード
      let imageId: Id<"_storage"> | undefined = existingImageId || undefined;

      if (imageFile) {
        const uploadUrl = await generateUploadUrl();
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        const { storageId } = await uploadResponse.json();
        imageId = storageId;
      }

      const shopId = await getOrCreateShop({
        name: shopName,
        address: shopAddress || undefined,
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
        });
        router.push(`/noodles/${noodle._id}`);
      } else {
        const noodleId = await createNoodle({
          userId: user._id,
          shopId,
          ramenName,
          genres,
          visitDate: parseDateInput(visitDate),
          comment: comment || undefined,
          evaluation: evaluation ?? undefined,
          imageId,
        });

        // Check for new badges
        const newBadges = await checkBadges({ userId: user._id });
        if (newBadges.length > 0) {
          const badge = BADGES[newBadges[0] as BadgeCode];
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
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="プレビュー"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors"
            >
              <Camera className="w-8 h-8" />
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

        {/* Ramen Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メニュー名 <span className="text-red-500">*</span>
          </label>
          <Input
            value={ramenName}
            onChange={(e) => setRamenName(e.target.value)}
            placeholder="例: 特製醤油らーめん"
            required
          />
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
    </>
  );
}
