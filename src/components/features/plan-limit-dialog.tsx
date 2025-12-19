"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanLimitDialogProps {
  type: "noodles" | "likes";
  current: number;
  limit: number;
  onClose: () => void;
}

export function PlanLimitDialog({
  type,
  current,
  limit,
  onClose,
}: PlanLimitDialogProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/settings/subscription");
  };

  const title = type === "noodles" ? "投稿上限に達しました" : "お気に入り上限に達しました";
  const description =
    type === "noodles"
      ? `今月の投稿数が上限（${limit}件）に達しました。Premiumプランにアップグレードすると無制限で投稿できます。`
      : `お気に入りの登録数が上限（${limit}件）に達しました。Premiumプランにアップグレードすると無制限で登録できます。`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>

          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="text-gray-700">
              現在: <span className="font-bold">{current}/{limit}</span>
            </p>
          </div>
        </div>

        {/* Premium Features */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-600" />
            <p className="font-semibold text-gray-900">Premiumプランの特典</p>
          </div>

          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600 shrink-0" />
              <span>投稿無制限</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600 shrink-0" />
              <span>お気に入り無制限</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600 shrink-0" />
              <span>Premium限定バッジ</span>
            </li>
          </ul>

          <div className="mt-3 text-center">
            <p className="text-2xl font-bold text-gray-900">
              ¥500<span className="text-sm font-normal text-gray-600">/月</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
          >
            Premiumにアップグレード
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full">
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * エラーハンドリング用のヘルパー関数
 * Convex mutationのエラーをキャッチして制限ダイアログを表示するかどうか判定
 */
export function isPlanLimitError(error: unknown): {
  isLimit: boolean;
  type?: "noodles" | "likes";
  message?: string;
} {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes("投稿上限")) {
      return { isLimit: true, type: "noodles", message };
    }

    if (message.includes("お気に入りの上限")) {
      return { isLimit: true, type: "likes", message };
    }
  }

  return { isLimit: false };
}
