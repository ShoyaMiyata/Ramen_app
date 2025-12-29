"use client";

import { RANKS, Rank } from "@/lib/constants/ranks";
import { cn } from "@/lib/utils/cn";
import { X, Check, Lock } from "lucide-react";
import { RankIcon } from "./rank-icon";

interface RankListModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRank: Rank;
  selectedThemeLevel?: number;
  onThemeSelect: (level: number) => void;
}

export function RankListModal({
  isOpen,
  onClose,
  currentRank,
  selectedThemeLevel,
  onThemeSelect,
}: RankListModalProps) {
  if (!isOpen) return null;

  const handleRankSelect = (rank: Rank) => {
    if (rank.level <= currentRank.level) {
      onThemeSelect(rank.level);
      onClose();
    }
  };

  const selectedLevel = selectedThemeLevel || currentRank.level;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">ランク一覧</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 説明文 */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 shrink-0">
          <p className="text-sm text-gray-600">
            店舗数に応じてランクが上がります。取得済みのランクをタップするとテーマカラーを変更できます。
          </p>
        </div>

        {/* ランクリスト */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {RANKS.map((rank) => {
            const isUnlocked = rank.level <= currentRank.level;
            const isSelected = selectedLevel === rank.level;
            const isCurrent = currentRank.level === rank.level;

            return (
              <button
                key={rank.level}
                onClick={() => handleRankSelect(rank)}
                disabled={!isUnlocked}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all relative",
                  "flex items-center gap-4",
                  isSelected && isUnlocked
                    ? "border-orange-500 bg-orange-50"
                    : isUnlocked
                    ? "border-gray-200 hover:border-gray-300 bg-white"
                    : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                )}
                style={
                  isUnlocked
                    ? {
                        backgroundColor: isSelected
                          ? rank.themeBgColor
                          : undefined,
                      }
                    : undefined
                }
              >
                {/* ランクアイコン */}
                <div className="relative flex-shrink-0">
                  <div className={cn(!isUnlocked && "grayscale")}>
                    <RankIcon rank={rank} size="lg" animate={false} />
                  </div>
                  {!isUnlocked && (
                    <div className="absolute top-0 right-0 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {isSelected && isUnlocked && (
                    <div
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                      style={{ backgroundColor: rank.themeColor }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* ランク情報 */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={cn(
                        "font-bold text-lg",
                        isUnlocked ? "text-gray-900" : "text-gray-400"
                      )}
                      style={
                        isUnlocked
                          ? { color: rank.themeColor }
                          : undefined
                      }
                    >
                      {rank.name}
                    </h3>
                    {isCurrent && isUnlocked && (
                      <span className="px-2 py-0.5 text-xs font-medium text-white bg-orange-500 rounded-full">
                        現在
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-sm",
                      isUnlocked ? "text-gray-600" : "text-gray-400"
                    )}
                  >
                    {isUnlocked
                      ? `${rank.requiredShops}店舗以上`
                      : `${rank.requiredShops}店舗で解放`}
                  </p>
                </div>

                {/* カラープレビュー */}
                <div className="flex gap-1.5">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full",
                      !isUnlocked && "grayscale"
                    )}
                    style={{
                      background: rank.gradient || rank.color,
                    }}
                  />
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full",
                      !isUnlocked && "grayscale"
                    )}
                    style={{
                      backgroundColor: rank.themeColor,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
