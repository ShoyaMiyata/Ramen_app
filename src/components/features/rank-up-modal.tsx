"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { type Rank } from "@/lib/constants/ranks";
import { RankIcon, RankUpIcon } from "./rank-icon";

interface RankUpModalProps {
  fromRank: Rank | null;
  toRank: Rank | null;
  onClose: () => void;
}

export function RankUpModal({ fromRank, toRank, onClose }: RankUpModalProps) {
  if (!fromRank || !toRank) return null;

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-b from-orange-50 to-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              {/* 背景パーティクル */}
              <ParticleEffect />

              {/* ランクアップタイトル */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10"
              >
                <motion.h2
                  className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  ランクアップ！
                </motion.h2>
              </motion.div>

              {/* アイコン変化アニメーション */}
              <motion.div
                className="my-8 flex justify-center relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <RankUpIcon fromRank={fromRank} toRank={toRank} />
              </motion.div>

              {/* ランク名変化 */}
              <motion.div
                className="relative z-10 space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center justify-center gap-3 text-sm">
                  <span className="text-gray-400">{fromRank.name}</span>
                  <motion.span
                    className="text-orange-500"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    →
                  </motion.span>
                  <span
                    className="font-bold text-lg"
                    style={{ color: toRank.color }}
                  >
                    {toRank.name}
                  </span>
                </div>

                {/* 新ランクの説明 */}
                <p className="text-gray-500 text-sm mt-2">
                  {getRankDescription(toRank)}
                </p>
              </motion.div>

              {/* 経験値ゲージ */}
              <motion.div
                className="mt-6 relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: toRank.gradient || toRank.color }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Lv.{toRank.level} 到達！
                </p>
              </motion.div>

              {/* 閉じるボタン */}
              <motion.button
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-shadow relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                すごい！
              </motion.button>
            </motion.div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// パーティクルエフェクト
function ParticleEffect() {
  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: `hsl(${30 + Math.random() * 30}, 100%, ${60 + Math.random() * 20}%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: [0, -100],
          }}
          transition={{
            duration: 2,
            delay: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// ランク説明文
function getRankDescription(rank: Rank): string {
  const descriptions: Record<number, string> = {
    1: "ラーメンの道はここから始まる",
    2: "一歩踏み出した麺への旅",
    3: "美味しい一杯を探求中",
    4: "匠への道を歩み始めた",
    5: "確かな舌を持つ麺の匠",
    6: "麺の宗として敬われる存在",
    7: "後進を導く麺の指導者",
    8: "仙人の域に達した麺の求道者",
    9: "麺界の王として君臨",
    10: "麺の皇帝、その威光は絶大",
    11: "麺を極めし者、尊崇の対象",
    12: "麺の極み、伝説の存在",
  };

  return descriptions[rank.level] || "";
}
