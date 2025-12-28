"use client";

import { RANKS, Rank } from "@/lib/constants/ranks";
import { cn } from "@/lib/utils/cn";
import { Check, Lock } from "lucide-react";

interface ThemeSelectorProps {
  currentRank: Rank;
  selectedThemeLevel?: number;
  onThemeSelect: (level: number) => void;
  isUpdating?: boolean;
}

export function ThemeSelector({
  currentRank,
  selectedThemeLevel,
  onThemeSelect,
  isUpdating = false,
}: ThemeSelectorProps) {
  // 利用可能なランク（現在のランク以下）
  const availableRanks = RANKS.filter((rank) => rank.level <= currentRank.level);
  const lockedRanks = RANKS.filter((rank) => rank.level > currentRank.level);

  return (
    <div className="space-y-4">
      {/* 利用可能なテーマカラー */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          選択可能なテーマカラー
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableRanks.map((rank) => {
            const isSelected = selectedThemeLevel
              ? selectedThemeLevel === rank.level
              : rank.level === currentRank.level;

            return (
              <button
                key={rank.level}
                onClick={() => onThemeSelect(rank.level)}
                disabled={isUpdating}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all",
                  "hover:shadow-md active:scale-95",
                  isSelected
                    ? "border-gray-800 shadow-lg"
                    : "border-gray-200 hover:border-gray-300",
                  isUpdating && "opacity-50 cursor-not-allowed"
                )}
                style={{
                  backgroundColor: rank.themeBgColor,
                }}
              >
                {/* チェックマーク */}
                {isSelected && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: rank.themeColor }}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* カラープレビュー */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-full shadow-md"
                    style={{
                      background: rank.gradient || rank.color,
                    }}
                  />
                  <div className="text-center">
                    <p
                      className="font-bold text-sm"
                      style={{ color: rank.themeColor }}
                    >
                      {rank.name}
                    </p>
                    <p className="text-xs text-gray-500">Lv.{rank.level}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ロックされたテーマカラー */}
      {lockedRanks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            未解放のテーマカラー
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {lockedRanks.map((rank) => (
              <div
                key={rank.level}
                className="relative p-4 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-60"
              >
                {/* ロックアイコン */}
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                  <Lock className="w-3 h-3 text-white" />
                </div>

                {/* カラープレビュー（グレースケール） */}
                <div className="flex flex-col items-center gap-2 grayscale">
                  <div
                    className="w-12 h-12 rounded-full shadow-md"
                    style={{
                      background: rank.gradient || rank.color,
                    }}
                  />
                  <div className="text-center">
                    <p className="font-bold text-sm text-gray-600">
                      {rank.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {rank.requiredShops}店舗で解放
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
