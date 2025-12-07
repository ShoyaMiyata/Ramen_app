"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Store, Utensils } from "lucide-react";
import {
  getPrefectureByCode,
  BADGE_TIERS,
  type PrefectureCode,
} from "@/lib/constants/prefectures";
import { useTheme } from "@/contexts/ThemeContext";

interface PrefectureDetailModalProps {
  prefectureCode: PrefectureCode | null;
  userId: Id<"users">;
  onClose: () => void;
}

export function PrefectureDetailModal({
  prefectureCode,
  userId,
  onClose,
}: PrefectureDetailModalProps) {
  const { themeColor } = useTheme();

  const detail = useQuery(
    api.prefectures.getPrefectureDetail,
    prefectureCode ? { userId, prefecture: prefectureCode } : "skip"
  );

  const prefecture = prefectureCode
    ? getPrefectureByCode(prefectureCode)
    : null;

  if (!prefecture) return null;

  const tierInfo = detail?.tier ? BADGE_TIERS[detail.tier] : null;
  const nextTier =
    detail?.tier === "bronze"
      ? BADGE_TIERS.silver
      : detail?.tier === "silver"
        ? BADGE_TIERS.gold
        : null;
  const nextRequired = nextTier?.requiredVisits || 0;
  const progress = detail?.visitCount
    ? Math.min((detail.visitCount / (nextRequired || 10)) * 100, 100)
    : 0;

  return (
    <Dialog.Root open={!!prefectureCode} onOpenChange={() => onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl w-[90%] max-w-sm max-h-[80vh] overflow-hidden z-50 shadow-xl">
          {/* Header */}
          <div
            className="relative p-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${prefecture.colors[0]}, ${prefecture.colors[1]})`,
            }}
          >
            <Dialog.Close asChild>
              <button className="absolute top-3 right-3 p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>

            {/* Badge Circle */}
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3"
              style={{
                backgroundColor: "white",
                border: tierInfo
                  ? `4px solid ${tierInfo.color}`
                  : "4px solid #E9ECEF",
              }}
            >
              <span className="text-3xl">{prefecture.symbol}</span>
            </div>

            <h2 className="text-xl font-bold text-white">{prefecture.name}</h2>

            {tierInfo && (
              <div
                className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-bold"
                style={{ backgroundColor: tierInfo.color, color: "white" }}
              >
                {tierInfo.name}バッジ獲得!
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[50vh]">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Store className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                <div className="text-xl font-bold" style={{ color: themeColor }}>
                  {detail?.visitCount || 0}
                </div>
                <div className="text-xs text-gray-500">訪問店舗</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Utensils className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                <div className="text-xl font-bold" style={{ color: themeColor }}>
                  {detail?.totalVisits || 0}
                </div>
                <div className="text-xs text-gray-500">総杯数</div>
              </div>
            </div>

            {/* Progress to next tier */}
            {nextTier && detail?.visitCount && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">次のバッジまで</span>
                  <span className="font-medium">
                    {detail.visitCount}/{nextRequired}店舗
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: nextTier.color,
                    }}
                  />
                </div>
              </div>
            )}

            {detail?.tier === "gold" && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-xl text-center">
                <span className="text-yellow-600 font-medium">
                  最高ランク達成!
                </span>
              </div>
            )}

            {/* Shop List */}
            {detail?.shops && detail.shops.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">訪問した店舗</h3>
                <div className="space-y-2">
                  {detail.shops.map((shop) => (
                    <div
                      key={shop._id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {shop.name}
                        </div>
                        {shop.address && (
                          <div className="text-xs text-gray-400 truncate">
                            {shop.address}
                          </div>
                        )}
                      </div>
                      <div
                        className="text-sm font-bold ml-2"
                        style={{ color: themeColor }}
                      >
                        {shop.visitCount}杯
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!detail?.shops || detail.shops.length === 0) && (
              <div className="text-center py-6">
                <div className="text-gray-400 text-sm">
                  まだこの県では食べていません
                </div>
                <div className="text-gray-300 text-xs mt-1">
                  投稿時に都道府県を選択すると記録されます
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
