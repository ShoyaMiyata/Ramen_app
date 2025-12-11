"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface GachaBadgeCardProps {
  name: string;
  description: string;
  icon: string;
  rarity: number;
  owned?: boolean;
}

const RARITY_STYLES = {
  1: {
    gradient: "from-gray-300 to-gray-400",
    border: "border-gray-400",
    glow: "",
    text: "text-gray-700",
    bg: "bg-gray-50",
  },
  2: {
    gradient: "from-green-300 to-green-500",
    border: "border-green-500",
    glow: "shadow-md shadow-green-200",
    text: "text-green-700",
    bg: "bg-green-50",
  },
  3: {
    gradient: "from-blue-300 to-blue-500",
    border: "border-blue-500",
    glow: "shadow-md shadow-blue-200",
    text: "text-blue-700",
    bg: "bg-blue-50",
  },
  4: {
    gradient: "from-purple-300 to-purple-500",
    border: "border-purple-500",
    glow: "shadow-lg shadow-purple-300",
    text: "text-purple-700",
    bg: "bg-purple-50",
  },
  5: {
    gradient: "from-yellow-300 via-orange-400 to-pink-500",
    border: "border-orange-500",
    glow: "shadow-xl shadow-orange-300",
    text: "text-orange-700",
    bg: "bg-gradient-to-br from-yellow-50 to-orange-50",
  },
};

export function GachaBadgeCard({
  name,
  description,
  icon,
  rarity,
  owned = false,
}: GachaBadgeCardProps) {
  const styles = RARITY_STYLES[rarity as keyof typeof RARITY_STYLES] || RARITY_STYLES[1];

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-xl border-2 p-4 ${styles.border} ${styles.bg} ${styles.glow} transition-all cursor-pointer ${
        !owned && "opacity-50 grayscale"
      }`}
    >
      {/* レアリティ背景装飾 */}
      {rarity >= 4 && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className={`absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br ${styles.gradient} opacity-20 blur-3xl`}
          />
        </div>
      )}

      <div className="relative z-10">
        {/* レアリティ星 */}
        <div className="flex gap-0.5 mb-2">
          {[...Array(rarity)].map((_, i) => (
            <Star
              key={i}
              className="w-3 h-3 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>

        {/* バッジアイコン */}
        <div className="flex justify-center mb-3">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${styles.gradient} flex items-center justify-center ${styles.glow}`}>
            <span className="text-3xl">{icon}</span>
          </div>
        </div>

        {/* バッジ名 */}
        <h3 className={`font-bold text-center text-sm mb-1 ${styles.text}`}>
          {name}
        </h3>

        {/* 説明 */}
        <p className="text-xs text-gray-600 text-center leading-tight">
          {description}
        </p>

        {/* 所持状態 */}
        {!owned && (
          <div className="absolute top-2 right-2 bg-gray-700 text-white text-[10px] px-2 py-0.5 rounded-full">
            未所持
          </div>
        )}

        {/* ★5専用: キラキラエフェクト */}
        {rarity === 5 && owned && (
          <motion.div
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-1 -right-1"
          >
            <Star className="w-5 h-5 fill-yellow-300 text-yellow-400" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
