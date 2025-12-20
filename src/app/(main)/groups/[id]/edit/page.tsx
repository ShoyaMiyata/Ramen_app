"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/contexts/ThemeContext";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Camera, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function GroupEditPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();
  const groupId = params.id as Id<"groups">;

  const group = useQuery(api.groups.get, {
    groupId,
    viewerId: user?._id,
  });
  const updateGroup = useMutation(api.groups.update);
  const generateUploadUrl = useMutation(api.groups.generateUploadUrl);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // グループデータが読み込まれたら、初期値を設定
  useEffect(() => {
    if (group && name === "" && description === "") {
      setName(group.name);
      setDescription(group.description);
      if (group.coverImageUrl) {
        setPreviewUrl(group.coverImageUrl);
      }
    }
  }, [group]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        setError("画像は5MB以下にしてください");
        return;
      }

      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let coverImageId: Id<"_storage"> | undefined = group?.coverImageId;

      // 新しい画像がアップロードされている場合
      if (coverImage) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": coverImage.type },
          body: coverImage,
        });
        const { storageId } = await result.json();
        coverImageId = storageId;
      }

      await updateGroup({
        groupId,
        name: name.trim(),
        description: description.trim(),
        coverImageId,
        userId: user._id,
      });

      router.push(`/groups/${groupId}`);
    } catch (err) {
      console.error("グループの更新に失敗しました:", err);
      setError(err instanceof Error ? err.message : "グループの更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || !group) {
    return <LoadingPage />;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ログインしてください</p>
      </div>
    );
  }

  // 作成者のみ編集可能
  if (!group.isCreator) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">このグループを編集する権限がありません</p>
        <Link href={`/groups/${groupId}`} className="text-orange-500 mt-2 inline-block">
          グループに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link
          href={`/groups/${groupId}`}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">グループを編集</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cover Image */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カバー画像
          </label>
          <div className="space-y-3">
            {previewUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="カバー画像"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors"
              >
                <Camera className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">
                  カバー画像を選択
                </span>
              </button>
            )}
            {previewUrl && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                画像を変更
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Group Name */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            グループ名 <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：ラーメン好きの会"
            maxLength={50}
            required
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            {name.length}/50文字
          </p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="グループの説明を入力してください"
            maxLength={500}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/500文字
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className={cn("flex-1")}
            style={{
              backgroundColor: themeColor,
              color: "white",
            }}
          >
            {isSubmitting ? "更新中..." : "更新する"}
          </Button>
        </div>
      </form>
    </div>
  );
}
