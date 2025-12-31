"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Link as LinkIcon, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ShopInfo {
  shopName: string | null;
  prefecture: string | null;
  station: string | null;
  address: string | null;
  confidence: number;
}

interface AIAutoFillProps {
  onDataFetched: (data: ShopInfo) => void;
}

export function AIAutoFill({ onDataFetched }: AIAutoFillProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<ShopInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractShopInfo = useAction(api.aiActions.extractShopInfo);

  const handleExtract = async () => {
    if (!url.trim()) {
      setError("URLを入力してください");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFetchedData(null);

    try {
      const data = await extractShopInfo({ url: url.trim() });
      console.log("Extracted data:", data);
      setFetchedData(data);

      // フォームに自動入力
      console.log("Calling onDataFetched with:", data);
      onDataFetched(data);

      // 成功メッセージ
      if (data.confidence < 70) {
        setError("情報の信頼度が低いです。確認してください。");
      }
    } catch (err) {
      console.error("AI抽出エラー:", err);
      setError(
        err instanceof Error
          ? err.message
          : "店舗情報の取得に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleExtract();
    }
  };

  return (
    <div className="space-y-4">
      {/* タイトル */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-gray-900">AIで自動入力</h3>
        <span className="text-xs text-gray-400 bg-purple-50 px-2 py-0.5 rounded-full">
          Powered by Gemini
        </span>
      </div>

      {/* URL入力フィールド */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600 flex items-center gap-1">
          <LinkIcon className="w-4 h-4" />
          お店のURL
        </label>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="お店のURL（食べログ、Googleマップなど）"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleExtract}
            disabled={isLoading || !url.trim()}
            className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                取得中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                自動入力
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400">
          どんなURLでも対応（AIがWeb検索して情報を取得します）
        </p>
      </div>

      {/* ローディング表示 */}
      {isLoading && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                AIが情報を取得しています...
              </p>
              <p className="text-xs text-gray-500">数秒お待ちください</p>
            </div>
          </div>
        </div>
      )}

      {/* 取得結果表示 */}
      {fetchedData && !isLoading && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">取得完了</h4>
            <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              信頼度: {fetchedData.confidence}%
            </span>
          </div>

          <div className="space-y-2 text-sm">
            {fetchedData.shopName && (
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-medium min-w-[80px]">店名:</span>
                <span className="text-gray-900">{fetchedData.shopName}</span>
              </div>
            )}
            {fetchedData.prefecture && (
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-medium min-w-[80px]">都道府県:</span>
                <span className="text-gray-900">{fetchedData.prefecture}</span>
              </div>
            )}
            {fetchedData.station && (
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-medium min-w-[80px]">最寄り駅:</span>
                <span className="text-gray-900">{fetchedData.station}</span>
              </div>
            )}
            {fetchedData.address && (
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-medium min-w-[80px]">住所:</span>
                <span className="text-gray-600 text-xs">{fetchedData.address}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-green-600">
            ✓ フォームに自動入力されました。内容を確認してください。
          </p>
        </div>
      )}

      {/* エラー表示 */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{error}</p>
              <p className="text-xs text-red-600 mt-1">
                手動で入力するか、別のURLをお試しください
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
