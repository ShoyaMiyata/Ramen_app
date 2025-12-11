"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

interface GachaAnimationProps {
  isOpen: boolean;
  rarity: number;
  badgeName: string;
  badgeIcon: string;
  badgeDescription: string;
  isNew: boolean;
  onComplete: () => void;
}

// レアリティ別の色設定
const RARITY_COLORS = {
  1: {
    gradient: "from-gray-400 to-gray-600",
    glow: "shadow-gray-500/50",
    text: "text-gray-700",
    bg: "bg-gray-100",
  },
  2: {
    gradient: "from-green-400 to-green-600",
    glow: "shadow-green-500/50",
    text: "text-green-700",
    bg: "bg-green-100",
  },
  3: {
    gradient: "from-blue-400 to-blue-600",
    glow: "shadow-blue-500/50",
    text: "text-blue-700",
    bg: "bg-blue-100",
  },
  4: {
    gradient: "from-purple-400 to-purple-600",
    glow: "shadow-purple-500/50",
    text: "text-purple-700",
    bg: "bg-purple-100",
  },
  5: {
    gradient: "from-yellow-400 via-orange-500 to-pink-600",
    glow: "shadow-orange-500/70",
    text: "text-orange-700",
    bg: "bg-gradient-to-br from-yellow-100 to-orange-100",
  },
};

export function GachaAnimation({
  isOpen,
  rarity,
  badgeName,
  badgeIcon,
  badgeDescription,
  isNew,
  onComplete,
}: GachaAnimationProps) {
  const [phase, setPhase] = useState<"rolling" | "reveal" | "result">("rolling");
  const colors = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS[1];

  useEffect(() => {
    if (!isOpen) {
      setPhase("rolling");
      return;
    }

    // ドキドキ演出: 2秒間
    const revealTimer = setTimeout(() => {
      setPhase("reveal");
    }, 2000);

    // 結果表示: さらに0.5秒後
    const resultTimer = setTimeout(() => {
      setPhase("result");
    }, 2500);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(resultTimer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={phase === "result" ? onComplete : undefined}
      >
        {/* ローリングフェーズ */}
        {phase === "rolling" && (
          <motion.div
            initial={{ scale: 0.5, rotate: 0 }}
            animate={{ scale: [0.5, 1.2, 1], rotate: [0, 360, 720] }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="relative"
          >
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/50">
              <Sparkles className="w-20 h-20 text-white animate-pulse" />
            </div>

            {/* 周囲のパーティクル */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 12) * 100,
                  y: Math.sin((i * Math.PI * 2) / 12) * 100,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
                className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-300 rounded-full"
              />
            ))}
          </motion.div>
        )}

        {/* リビールフェーズ */}
        {phase === "reveal" && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`w-40 h-40 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-2xl ${colors.glow}`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-6xl"
              >
                {badgeIcon}
              </motion.div>
            </motion.div>

            {/* ★5専用: 虹色エフェクト */}
            {rarity === 5 && (
              <>
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 2, 0],
                      rotate: i * 18,
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                    className="absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t from-transparent via-yellow-300 to-transparent"
                    style={{ transformOrigin: "center bottom" }}
                  />
                ))}
              </>
            )}

            {/* ★4以上: パーティクル */}
            {rarity >= 4 && (
              <>
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    animate={{
                      opacity: [1, 0],
                      scale: [1, 0],
                      x: (Math.random() - 0.5) * 200,
                      y: (Math.random() - 0.5) * 200,
                    }}
                    transition={{ duration: 1, delay: Math.random() * 0.3 }}
                    className={`absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-br ${colors.gradient} rounded-full`}
                  />
                ))}
              </>
            )}
          </motion.div>
        )}

        {/* 結果表示フェーズ */}
        {phase === "result" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative overflow-hidden"
          >
            {/* 背景装飾 */}
            <div className={`absolute inset-0 ${colors.bg} opacity-30`} />

            {/* NEW!バッジ */}
            {isNew && (
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
              >
                NEW!
              </motion.div>
            )}

            <div className="relative z-10">
              {/* レアリティ表示 */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center gap-1 mb-4"
              >
                {[...Array(rarity)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1 + i * 0.1, type: "spring" }}
                  >
                    <Star className={`w-6 h-6 fill-yellow-400 text-yellow-400`} />
                  </motion.div>
                ))}
              </motion.div>

              {/* バッジアイコン */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex justify-center mb-4"
              >
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-xl ${colors.glow}`}>
                  <span className="text-5xl">{badgeIcon}</span>
                </div>
              </motion.div>

              {/* バッジ名 */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`text-2xl font-bold text-center mb-2 ${colors.text}`}
              >
                {badgeName}
              </motion.h2>

              {/* 説明 */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-600 text-center text-sm mb-6"
              >
                {badgeDescription}
              </motion.p>

              {/* 閉じるボタン */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={onComplete}
                className={`w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r ${colors.gradient} hover:opacity-90 transition-opacity shadow-lg`}
              >
                閉じる
              </motion.button>
            </div>

            {/* ★5専用: 紙吹雪エフェクト */}
            {rarity === 5 && (
              <>
                {[...Array(50)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, y: -20, x: Math.random() * 400 - 200 }}
                    animate={{
                      opacity: [1, 1, 0],
                      y: [0, 600],
                      rotate: [0, Math.random() * 360],
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      delay: Math.random() * 0.5,
                    }}
                    className={`absolute w-3 h-3 bg-gradient-to-br ${colors.gradient} rounded-sm`}
                  />
                ))}
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
