"use client";

import { motion } from "framer-motion";
import { type Rank } from "@/lib/constants/ranks";
import { cn } from "@/lib/utils/cn";

interface RankIconProps {
  rank: Rank;
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: 32, scale: 0.32 },
  md: { container: 48, scale: 0.48 },
  lg: { container: 64, scale: 0.64 },
  xl: { container: 96, scale: 0.96 },
};

export function RankIcon({ rank, size = "md", animate = true, className }: RankIconProps) {
  const dimensions = sizeMap[size];

  // ランクレベルに応じた装飾を決定
  const showInnerGlow = rank.level >= 3;
  const showOuterRing = rank.level >= 5;
  const showSparkles = rank.level >= 7;
  const showCrown = rank.hasCrown;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        className
      )}
      style={{
        width: dimensions.container,
        height: dimensions.container,
      }}
    >
      {/* レインボーエフェクト（最高ランク） */}
      {rank.specialEffect === "rainbow" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, #FF6B6B, #FFA726, #FFD54F, #66BB6A, #42A5F5, #AB47BC, #FF6B6B)`,
            filter: "blur(4px)",
            opacity: 0.6,
          }}
          animate={animate ? { rotate: 360 } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* ゴールドエフェクト */}
      {rank.specialEffect === "gold" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
            filter: "blur(3px)",
            opacity: 0.5,
          }}
          animate={animate ? { scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* 外側リング（高ランク） */}
      {showOuterRing && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${rank.color}`,
            opacity: 0.4,
          }}
          animate={animate && rank.level >= 8 ? { scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* メインアイコン */}
      <svg
        width={dimensions.container}
        height={dimensions.container}
        viewBox="0 0 100 100"
        className="relative z-10"
      >
        <defs>
          {/* メイングラデーション */}
          <linearGradient id={`rankGradient-${rank.level}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={rank.color} />
            <stop offset="50%" stopColor={adjustBrightness(rank.color, 20)} />
            <stop offset="100%" stopColor={rank.color} />
          </linearGradient>

          {/* 光沢グラデーション */}
          <linearGradient id={`gloss-${rank.level}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="40%" stopColor="white" stopOpacity="0.1" />
            <stop offset="60%" stopColor="black" stopOpacity="0.05" />
            <stop offset="100%" stopColor="black" stopOpacity="0.2" />
          </linearGradient>

          {/* 内側の輝き */}
          <radialGradient id={`innerGlow-${rank.level}`} cx="30%" cy="30%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* ドロップシャドウ */}
          <filter id={`shadow-${rank.level}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={rank.color} floodOpacity="0.4" />
          </filter>

          {/* レインボーグラデーション */}
          {rank.specialEffect === "rainbow" && (
            <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="20%" stopColor="#FFA726" />
              <stop offset="40%" stopColor="#FFD54F" />
              <stop offset="60%" stopColor="#66BB6A" />
              <stop offset="80%" stopColor="#42A5F5" />
              <stop offset="100%" stopColor="#AB47BC" />
            </linearGradient>
          )}
        </defs>

        {/* 王冠 */}
        {showCrown && (
          <g>
            <motion.g
              animate={animate ? { y: [-1, 1, -1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {/* 王冠ベース */}
              <path
                d="M30 28 L35 12 L42 22 L50 8 L58 22 L65 12 L70 28 Z"
                fill="url(#goldCrownGradient)"
                stroke="#DAA520"
                strokeWidth="1"
                filter={`url(#shadow-${rank.level})`}
              />
              <defs>
                <linearGradient id="goldCrownGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFE066" />
                  <stop offset="50%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#DAA520" />
                </linearGradient>
              </defs>
              {/* 宝石 */}
              <circle cx="35" cy="18" r="3" fill="#FF6B6B" />
              <circle cx="35" cy="18" r="1.5" fill="#FFB3B3" />
              <circle cx="50" cy="12" r="3.5" fill="#42A5F5" />
              <circle cx="50" cy="12" r="1.5" fill="#90CAF9" />
              <circle cx="65" cy="18" r="3" fill="#66BB6A" />
              <circle cx="65" cy="18" r="1.5" fill="#A5D6A7" />
            </motion.g>
          </g>
        )}

        {/* メインの丼アイコン */}
        <g transform={showCrown ? "translate(0, 8)" : "translate(0, -5)"}>
          {/* 丼のシャドウ */}
          <ellipse
            cx="50"
            cy="78"
            rx="28"
            ry="6"
            fill="black"
            opacity="0.15"
          />

          {/* 丼本体 */}
          <g filter={`url(#shadow-${rank.level})`}>
            {/* 丼の器 */}
            <path
              d="M22 45 Q20 70 50 75 Q80 70 78 45 Z"
              fill={rank.specialEffect === "rainbow" ? "url(#rainbowGradient)" : `url(#rankGradient-${rank.level})`}
              stroke={rank.hasGoldBorder ? "#FFD700" : adjustBrightness(rank.color, -30)}
              strokeWidth={rank.hasGoldBorder ? "2" : "1"}
            />

            {/* 丼の縁 - 上部 */}
            <ellipse
              cx="50"
              cy="45"
              rx="28"
              ry="10"
              fill={rank.specialEffect === "rainbow" ? "url(#rainbowGradient)" : `url(#rankGradient-${rank.level})`}
              stroke={rank.hasGoldBorder ? "#FFD700" : adjustBrightness(rank.color, -30)}
              strokeWidth={rank.hasGoldBorder ? "2" : "1"}
            />

            {/* 光沢オーバーレイ */}
            <ellipse
              cx="50"
              cy="45"
              rx="26"
              ry="8"
              fill={`url(#gloss-${rank.level})`}
            />
          </g>

          {/* 麺とスープ */}
          <ellipse
            cx="50"
            cy="47"
            rx="22"
            ry="6"
            fill="#FFF8DC"
            opacity="0.9"
          />

          {/* 具材 */}
          <g>
            {/* チャーシュー */}
            <ellipse cx="40" cy="47" rx="8" ry="4" fill="#CD853F" />
            <ellipse cx="40" cy="47" rx="6" ry="3" fill="#DEB887" />
            <ellipse cx="40" cy="47" rx="3" ry="1.5" fill="#8B4513" opacity="0.5" />

            {/* 味玉 */}
            <ellipse cx="58" cy="46" rx="5" ry="3.5" fill="#FFF8DC" stroke="#DAA520" strokeWidth="0.5" />
            <ellipse cx="58" cy="46" rx="2" ry="1.5" fill="#FF8C00" />

            {/* ネギ */}
            <circle cx="48" cy="43" r="2" fill="#228B22" />
            <circle cx="52" cy="44" r="1.5" fill="#32CD32" />
            <circle cx="45" cy="45" r="1.5" fill="#228B22" />

            {/* 海苔 */}
            <rect x="62" y="40" width="8" height="12" rx="1" fill="#1A1A1A" opacity="0.8" transform="rotate(15, 66, 46)" />
          </g>

          {/* 湯気 */}
          {rank.hasSteam && (
            <g>
              {[0, 1, 2].map((i) => (
                <motion.path
                  key={i}
                  d={`M${42 + i * 8} 38 Q${40 + i * 8} 28 ${44 + i * 8} 20`}
                  stroke={rank.specialEffect === "gold" ? "#FFD700" : "#E0E0E0"}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  opacity={0.6}
                  animate={
                    animate
                      ? {
                          pathLength: [0, 1, 0],
                          opacity: [0, 0.7, 0],
                          y: [0, -5, -10],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </g>
          )}
        </g>

        {/* 箸 */}
        {rank.hasChopsticks && (
          <motion.g
            transform={showCrown ? "translate(0, 8)" : "translate(0, -5)"}
            animate={animate ? { rotate: [-2, 2, -2] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ transformOrigin: "70px 50px" }}
          >
            <rect x="68" y="30" width="3" height="35" rx="1.5" fill="#8B4513" transform="rotate(-20, 70, 47)" />
            <rect x="68" y="30" width="1.5" height="35" rx="0.75" fill="#A0522D" transform="rotate(-20, 70, 47)" />
            <rect x="74" y="28" width="3" height="35" rx="1.5" fill="#8B4513" transform="rotate(-15, 76, 45)" />
            <rect x="74" y="28" width="1.5" height="35" rx="0.75" fill="#A0522D" transform="rotate(-15, 76, 45)" />
          </motion.g>
        )}

        {/* レンゲ */}
        {rank.hasSpoon && (
          <motion.g
            transform={showCrown ? "translate(0, 8)" : "translate(0, -5)"}
            animate={animate ? { rotate: [-3, 3, -3] } : {}}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ transformOrigin: "25px 55px" }}
          >
            <ellipse cx="20" cy="52" rx="8" ry="5" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="1" />
            <ellipse cx="20" cy="52" rx="5" ry="3" fill={`url(#gloss-${rank.level})`} />
            <rect x="17" y="57" width="6" height="22" rx="3" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="1" />
          </motion.g>
        )}

        {/* キラキラエフェクト */}
        {showSparkles && animate && (
          <g>
            {[
              { x: 25, y: 35, delay: 0 },
              { x: 75, y: 40, delay: 0.5 },
              { x: 50, y: 25, delay: 1 },
              { x: 30, y: 60, delay: 1.5 },
              { x: 70, y: 65, delay: 2 },
            ].map((spark, i) => (
              <motion.g
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: spark.delay,
                }}
              >
                <path
                  d={`M${spark.x} ${spark.y - 4} L${spark.x} ${spark.y + 4} M${spark.x - 4} ${spark.y} L${spark.x + 4} ${spark.y}`}
                  stroke={rank.specialEffect === "gold" ? "#FFD700" : "white"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </motion.g>
            ))}
          </g>
        )}

        {/* 内側の輝き（高ランク） */}
        {showInnerGlow && (
          <circle
            cx="35"
            cy="50"
            r="15"
            fill={`url(#innerGlow-${rank.level})`}
            opacity="0.3"
          />
        )}
      </svg>

      {/* ランクレベル表示バッジ */}
      {rank.level > 1 && (
        <div
          className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center text-white font-bold shadow-md"
          style={{
            width: dimensions.container * 0.35,
            height: dimensions.container * 0.35,
            fontSize: dimensions.container * 0.18,
            background: rank.gradient || `linear-gradient(135deg, ${rank.color}, ${adjustBrightness(rank.color, -20)})`,
            border: "2px solid white",
          }}
        >
          {rank.level}
        </div>
      )}
    </div>
  );
}

// 色の明るさを調整するヘルパー関数
function adjustBrightness(color: string, percent: number): string {
  const hex = color.replace("#", "");
  const r = Math.min(255, Math.max(0, parseInt(hex.substring(0, 2), 16) + percent));
  const g = Math.min(255, Math.max(0, parseInt(hex.substring(2, 4), 16) + percent));
  const b = Math.min(255, Math.max(0, parseInt(hex.substring(4, 6), 16) + percent));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ランクアップ演出用のアニメーションアイコン
interface RankUpIconProps {
  fromRank: Rank;
  toRank: Rank;
  onComplete?: () => void;
}

export function RankUpIcon({ fromRank, toRank, onComplete }: RankUpIconProps) {
  return (
    <div className="relative w-32 h-32">
      {/* 旧ランク（フェードアウト） */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        <RankIcon rank={fromRank} size="xl" animate={false} />
      </motion.div>

      {/* 光のエフェクト */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      {/* パーティクルエフェクト */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: "50%",
            top: "50%",
            background: toRank.gradient || toRank.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: Math.cos((i * Math.PI * 2) / 8) * 60,
            y: Math.sin((i * Math.PI * 2) / 8) * 60,
            opacity: 0,
            scale: [1, 1.5, 0],
          }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
      ))}

      {/* 新ランク（フェードイン） */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        onAnimationComplete={onComplete}
      >
        <RankIcon rank={toRank} size="xl" animate={true} />
      </motion.div>
    </div>
  );
}
