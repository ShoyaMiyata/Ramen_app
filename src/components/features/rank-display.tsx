"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ChevronRight, Check, Palette } from "lucide-react";
import { getRankByShopCount, getNextRank, RANKS, type Rank } from "@/lib/constants/ranks";
import { RankIcon } from "./rank-icon";
import { cn } from "@/lib/utils/cn";
import { api } from "../../../convex/_generated/api";
import { useTheme } from "@/contexts/ThemeContext";
import { Id } from "../../../convex/_generated/dataModel";

interface RankDisplayProps {
  shopCount: number;
  userId?: Id<"users">;
}

export function RankDisplay({ shopCount, userId }: RankDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentRank = getRankByShopCount(shopCount);
  const { selectedThemeRank } = useTheme();
  const nextRank = getNextRank(currentRank);

  const progress = nextRank
    ? ((shopCount - currentRank.requiredShops) /
        (nextRank.requiredShops - currentRank.requiredShops)) *
      100
    : 100;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-white rounded-xl p-4 shadow-sm text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <RankIcon rank={currentRank} size="md" />
            <div>
              <h3 className="font-bold text-gray-900">{currentRank.name}</h3>
              <p className="text-sm text-gray-500">
                {shopCount}店舗制覇
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {nextRank && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">次のランク:</span>
                <span
                  className="font-bold px-2 py-0.5 rounded-full text-white text-[10px]"
                  style={{
                    background: nextRank.gradient || nextRank.color,
                  }}
                >
                  {nextRank.name}
                </span>
              </div>
              <span className="text-gray-500">
                あと<span className="font-bold text-gray-700">{nextRank.requiredShops - shopCount}</span>店舗
              </span>
            </div>
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full relative"
                style={{
                  background: currentRank.gradient || currentRank.color,
                  boxShadow: `0 0 8px ${currentRank.color}`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: "linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
                  }}
                />
              </motion.div>
              {/* 目盛り */}
              <div className="absolute inset-0 flex justify-between px-0.5">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="w-px h-full bg-gray-300/50"
                    style={{ marginLeft: i === 0 ? 0 : "auto" }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>{currentRank.requiredShops}</span>
              <span>{nextRank.requiredShops}店舗</span>
            </div>
          </div>
        )}

        {!nextRank && (
          <p className="text-center text-sm text-amber-600 font-medium">
            最高ランク達成！
          </p>
        )}
      </button>

      <RankListModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        currentRank={currentRank}
        shopCount={shopCount}
        userId={userId}
        selectedThemeRank={selectedThemeRank}
      />
    </>
  );
}

interface RankListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRank: Rank;
  shopCount: number;
  userId?: Id<"users">;
  selectedThemeRank: Rank;
}

function RankListModal({ open, onOpenChange, currentRank, shopCount, userId, selectedThemeRank }: RankListModalProps) {
  const updateThemeLevel = useMutation(api.users.updateThemeLevel);

  const handleSelectTheme = async (rank: Rank) => {
    if (!userId) return;
    try {
      await updateThemeLevel({ userId, themeLevel: rank.level });
    } catch (error) {
      console.error("Failed to update theme level:", error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <Dialog.Title className="font-bold text-lg">
              ランク一覧
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <p className="text-sm text-gray-500 mb-4">
              店舗数に応じてランクが上がります。取得済みのランクをタップするとテーマカラーを変更できます。
            </p>

            <div className="space-y-2">
              {RANKS.map((rank) => {
                const isAchieved = shopCount >= rank.requiredShops;
                const isCurrent = rank.level === currentRank.level;
                const isSelectedTheme = rank.level === selectedThemeRank.level;

                return (
                  <button
                    key={rank.level}
                    onClick={() => isAchieved && handleSelectTheme(rank)}
                    disabled={!isAchieved}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      isCurrent
                        ? "bg-orange-50 border-2 border-orange-300"
                        : isAchieved
                        ? "bg-gray-50 hover:bg-gray-100"
                        : "bg-gray-50 opacity-60 cursor-not-allowed"
                    )}
                  >
                    <RankIcon rank={rank} size="sm" animate={isCurrent} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {rank.name}
                        </span>
                        {isCurrent && (
                          <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                            現在
                          </span>
                        )}
                        {isAchieved && !isCurrent && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {rank.requiredShops === 0
                          ? "スタート"
                          : `${rank.requiredShops}店舗以上`}
                      </p>
                    </div>
                    {/* テーマカラー選択インジケーター */}
                    {isAchieved && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full border-2"
                          style={{
                            backgroundColor: rank.themeColor,
                            borderColor: isSelectedTheme ? rank.themeColor : "transparent",
                            boxShadow: isSelectedTheme ? `0 0 0 2px white, 0 0 0 4px ${rank.themeColor}` : undefined,
                          }}
                        />
                        {isSelectedTheme && (
                          <Palette className="w-4 h-4" style={{ color: rank.themeColor }} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
