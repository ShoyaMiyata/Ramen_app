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
  sm: { container: 32, bowl: 10, gap: 1 },
  md: { container: 48, bowl: 14, gap: 2 },
  lg: { container: 64, bowl: 18, gap: 3 },
  xl: { container: 96, bowl: 24, gap: 4 },
};

export function RankIcon({ rank, size = "md", animate = true, className }: RankIconProps) {
  const dimensions = sizeMap[size];
  const bowls = Array.from({ length: rank.bowlCount }, (_, i) => i);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        rank.specialEffect === "rainbow" && "animate-pulse",
        className
      )}
      style={{
        width: dimensions.container,
        height: dimensions.container,
      }}
    >
      {/* 金縁エフェクト */}
      {rank.hasGoldBorder && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
            opacity: 0.3,
          }}
          animate={animate ? { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* 虹エフェクト（最高ランク） */}
      {rank.specialEffect === "rainbow" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: rank.gradient,
            opacity: 0.2,
          }}
          animate={animate ? { rotate: 360 } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* メインコンテンツ */}
      <svg
        width={dimensions.container}
        height={dimensions.container}
        viewBox="0 0 100 100"
        className="relative z-10"
      >
        {/* 王冠 */}
        {rank.hasCrown && (
          <g transform="translate(35, 8)">
            <motion.path
              d="M0 20 L5 8 L15 15 L25 8 L30 20 Z"
              fill="#FFD700"
              stroke="#FFA500"
              strokeWidth="1"
              animate={animate ? { y: [-1, 1, -1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {/* 宝石 */}
            <circle cx="5" cy="12" r="2" fill="#FF6B6B" />
            <circle cx="15" cy="9" r="2" fill="#42A5F5" />
            <circle cx="25" cy="12" r="2" fill="#66BB6A" />
          </g>
        )}

        {/* 丼グループ */}
        <g transform={`translate(${50 - (rank.bowlCount * (dimensions.bowl + dimensions.gap)) / 2}, ${rank.hasCrown ? 35 : 25})`}>
          {bowls.map((i) => (
            <g key={i} transform={`translate(${i * (dimensions.bowl + dimensions.gap)}, 0)`}>
              {/* 丼本体 */}
              <Bowl
                size={dimensions.bowl}
                color={rank.color}
                hasGoldBorder={rank.hasGoldBorder}
                specialEffect={rank.specialEffect}
              />

              {/* 湯気（最初の丼のみ、または特別ランク時は全部） */}
              {rank.hasSteam && (i === 0 || rank.specialEffect) && (
                <Steam
                  x={dimensions.bowl / 2}
                  y={-5}
                  animate={animate}
                  color={rank.specialEffect === "gold" ? "#FFD700" : undefined}
                />
              )}
            </g>
          ))}
        </g>

        {/* 箸 */}
        {rank.hasChopsticks && (
          <g transform="translate(62, 30)">
            <motion.g
              animate={animate ? { rotate: [-2, 2, -2] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <rect x="0" y="0" width="3" height="35" rx="1" fill="#8B4513" transform="rotate(-15)" />
              <rect x="8" y="0" width="3" height="35" rx="1" fill="#8B4513" transform="rotate(-15)" />
            </motion.g>
          </g>
        )}

        {/* レンゲ */}
        {rank.hasSpoon && (
          <g transform="translate(15, 45)">
            <motion.g
              animate={animate ? { rotate: [-3, 3, -3] } : {}}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <ellipse cx="8" cy="8" rx="7" ry="5" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="1" />
              <rect x="6" y="13" width="4" height="20" rx="2" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="1" />
            </motion.g>
          </g>
        )}
      </svg>
    </div>
  );
}

interface BowlProps {
  size: number;
  color: string;
  hasGoldBorder: boolean;
  specialEffect?: "gold" | "rainbow";
}

function Bowl({ size, color, hasGoldBorder, specialEffect }: BowlProps) {
  const scale = size / 14;

  return (
    <g transform={`scale(${scale})`}>
      {/* 金縁 */}
      {hasGoldBorder && (
        <ellipse
          cx="7"
          cy="5"
          rx="8"
          ry="3"
          fill="none"
          stroke="#FFD700"
          strokeWidth="2"
        />
      )}

      {/* 丼本体 */}
      <path
        d="M0 5 Q0 18 7 20 Q14 18 14 5 Z"
        fill={color}
        stroke={hasGoldBorder ? "#FFD700" : "#333"}
        strokeWidth="0.5"
      />

      {/* 丼の縁 */}
      <ellipse
        cx="7"
        cy="5"
        rx="7"
        ry="2.5"
        fill={specialEffect === "gold" ? "#FFD700" : specialEffect === "rainbow" ? "#FF6B6B" : color}
        stroke={hasGoldBorder ? "#FFD700" : "#333"}
        strokeWidth="0.5"
      />

      {/* 麺（内部） */}
      <ellipse cx="7" cy="6" rx="5" ry="1.5" fill="#FFF8DC" opacity="0.8" />

      {/* 具材 */}
      <circle cx="5" cy="6" r="1.5" fill="#8B4513" /> {/* チャーシュー */}
      <circle cx="9" cy="5.5" r="1" fill="#228B22" /> {/* ネギ */}
    </g>
  );
}

interface SteamProps {
  x: number;
  y: number;
  animate: boolean;
  color?: string;
}

function Steam({ x, y, animate, color = "#E0E0E0" }: SteamProps) {
  const steamPaths = [
    `M${x - 3} ${y} Q${x - 5} ${y - 8} ${x - 3} ${y - 15}`,
    `M${x} ${y} Q${x + 2} ${y - 10} ${x} ${y - 18}`,
    `M${x + 3} ${y} Q${x + 5} ${y - 8} ${x + 3} ${y - 15}`,
  ];

  return (
    <g>
      {steamPaths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity={0.6}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            animate
              ? {
                  pathLength: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                  y: [0, -5, -10],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </g>
  );
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
