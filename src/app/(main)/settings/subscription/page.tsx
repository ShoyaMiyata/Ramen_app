"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Crown, Zap } from "lucide-react";
import { PLAN_LIMITS } from "@/lib/constants/plans";

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);

  const subscriptionStatus = useQuery(api.subscriptions.getStatus);
  const createCheckoutSession = useAction(api.subscriptions.createCheckoutSession);
  const createPortalSession = useAction(api.subscriptions.createPortalSession);

  if (!isLoaded) {
    return <LoadingPage />;
  }

  const currentPlan = subscriptionStatus?.plan || "free";
  const isPremium = currentPlan === "premium";

  const handleUpgrade = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await createCheckoutSession({
        successUrl: `${window.location.origin}/settings/subscription?success=true`,
        cancelUrl: `${window.location.origin}/settings/subscription?canceled=true`,
      });

      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      alert("決済ページの作成に失敗しました");
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await createPortalSession({
        returnUrl: `${window.location.origin}/settings/subscription`,
      });

      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Failed to create portal session:", error);
      alert("サブスクリプション管理ページの作成に失敗しました");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">プラン・お支払い</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* 現在のプラン */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">現在のプラン</p>
              <div className="flex items-center gap-2 mt-1">
                {isPremium && <Crown className="w-5 h-5 text-yellow-500" />}
                <p className="text-2xl font-bold">
                  {isPremium ? "Premium" : "Free"}
                </p>
              </div>
            </div>
            {isPremium && (
              <Button
                onClick={handleManageSubscription}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                管理
              </Button>
            )}
          </div>

          {subscriptionStatus?.subscriptionStatus && (
            <p className="text-sm text-gray-500">
              ステータス: {subscriptionStatus.subscriptionStatus}
            </p>
          )}
        </div>

        {/* プラン比較 */}
        <div className="grid gap-4">
          {/* Free Plan */}
          <div
            className={`bg-white rounded-xl p-6 border-2 ${
              !isPremium ? "border-blue-500" : "border-gray-200"
            }`}
          >
            <h3 className="text-xl font-bold mb-2">Freeプラン</h3>
            <p className="text-3xl font-bold mb-4">
              ¥0<span className="text-base font-normal text-gray-500">/月</span>
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm">
                  投稿 {PLAN_LIMITS.free.maxNoodlesPerMonth}件/月
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm">
                  お気に入り {PLAN_LIMITS.free.maxLikes}件
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm">基本バッジ機能</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm">ランキング機能</span>
              </li>
            </ul>

            {!isPremium && (
              <div className="text-center py-2 text-sm text-gray-500">
                現在のプラン
              </div>
            )}
          </div>

          {/* Premium Plan */}
          <div
            className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 ${
              isPremium ? "border-yellow-500" : "border-yellow-200"
            } relative overflow-hidden`}
          >
            <div className="absolute top-4 right-4">
              <Crown className="w-8 h-8 text-yellow-500 opacity-20" />
            </div>

            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Premiumプラン
            </h3>
            <p className="text-3xl font-bold mb-4">
              ¥500<span className="text-base font-normal text-gray-500">/月</span>
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">投稿無制限</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">お気に入り無制限</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <span className="text-sm">Premium限定バッジ</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <span className="text-sm">データエクスポート</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <span className="text-sm">優先サポート</span>
              </li>
            </ul>

            {isPremium ? (
              <div className="text-center py-2 text-sm font-semibold text-yellow-700">
                現在のプラン
              </div>
            ) : (
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
              >
                {isLoading ? "処理中..." : "Premiumにアップグレード"}
              </Button>
            )}
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-semibold mb-2">💡 お支払いについて</p>
          <ul className="space-y-1 text-xs">
            <li>• 月額制のサブスクリプションです</li>
            <li>• いつでもキャンセル可能です</li>
            <li>• キャンセル後も有効期限まで利用できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
