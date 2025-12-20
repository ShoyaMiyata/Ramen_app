"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingPage } from "@/components/ui/loading";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";

export default function NewGroupPage() {
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const create = useMutation(api.groups.create);
  const generateUploadUrl = useMutation(api.groups.generateUploadUrl);

  if (!isLoaded) {
    return <LoadingPage />;
  }

  if (!user) {
    router.push("/sign-in");
    return <LoadingPage />;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
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

    if (!name.trim()) {
      alert("グループ名を入力してください");
      return;
    }

    if (!description.trim()) {
      alert("説明を入力してください");
      return;
    }

    if (name.trim().length > 50) {
      alert("グループ名は50文字以内で入力してください");
      return;
    }

    if (description.trim().length > 500) {
      alert("説明は500文字以内で入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      let coverImageId = undefined;

      // カバー画像があればアップロード
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

      // グループを作成
      const groupId = await create({
        name: name.trim(),
        description: description.trim(),
        coverImageId,
        userId: user._id,
      });

      // グループページにリダイレクト
      router.push(`/groups/${groupId}`);
    } catch (error: any) {
      console.error("Failed to create group:", error);
      alert(error.message || "グループの作成に失敗しました");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/groups">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">新しいグループを作成</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cover Image */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カバー画像（任意）
          </label>
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="カバー画像プレビュー"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">
                クリックして画像を選択
              </span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Group Name */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            グループ名 <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: ラーメン好きの集い"
            maxLength={50}
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            {name.length}/50文字
          </p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            説明 <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このグループについて説明してください"
            maxLength={500}
            required
            rows={5}
          />
          <p className="text-xs text-gray-400 mt-1">
            {description.length}/500文字
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || !name.trim() || !description.trim()}
          >
            {isSubmitting ? "作成中..." : "作成する"}
          </Button>
        </div>
      </form>
    </div>
  );
}
