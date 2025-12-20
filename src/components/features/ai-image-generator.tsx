"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Sparkles, RefreshCw, Check } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface AIImageGeneratorProps {
  onImageGenerated?: (storageId: Id<"_storage">) => void;
}

export function AIImageGenerator({ onImageGenerated }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{
    storageId: string;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = useAction(api.aiImages.generateProfileImage);
  const setAsProfile = useAction(api.aiImages.setGeneratedImageAsProfile);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("プロンプトを入力してください");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImage({ prompt: prompt.trim() });
      setGeneratedImage(result);
    } catch (err) {
      console.error("画像生成エラー:", err);
      setError(
        err instanceof Error ? err.message : "画像の生成に失敗しました"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSetAsProfile = async () => {
    if (!generatedImage) return;

    try {
      await setAsProfile({ storageId: generatedImage.storageId as Id<"_storage"> });
      if (onImageGenerated) {
        onImageGenerated(generatedImage.storageId as Id<"_storage">);
      }
      // 成功メッセージ
      alert("プロフィール画像を設定しました！");
      // リセット
      setGeneratedImage(null);
      setPrompt("");
    } catch (err) {
      console.error("プロフィール設定エラー:", err);
      setError("プロフィール画像の設定に失敗しました");
    }
  };

  const handleReset = () => {
    setGeneratedImage(null);
    setPrompt("");
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* タイトル */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="font-bold text-lg">AI画像生成</h3>
      </div>

      <p className="text-sm text-gray-600">
        AIがあなたの説明からアバター画像を生成します
      </p>

      {/* プロンプト入力 */}
      {!generatedImage && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              画像の説明を入力
            </label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例: 青い服を着た笑顔の猫、クールな雰囲気のサイバー風"
              disabled={isGenerating}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              アバター風のイラストが生成されます（生成には20〜40秒かかります）
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loading size="sm" />
                <span className="ml-2">生成中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                画像を生成
              </>
            )}
          </Button>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 生成された画像のプレビュー */}
      {generatedImage && (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={generatedImage.url}
              alt="Generated avatar"
              className="w-full max-w-sm mx-auto rounded-xl shadow-lg"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleSetAsProfile}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              この画像を設定
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              やり直す
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            気に入ったら「この画像を設定」、もう一度生成したい場合は「やり直す」を押してください
          </p>
        </div>
      )}
    </div>
  );
}
