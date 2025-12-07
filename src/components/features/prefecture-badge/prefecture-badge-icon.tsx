"use client";

import {
  getPrefectureByCode,
  BADGE_TIERS,
  type PrefectureCode,
  type BadgeTier,
} from "@/lib/constants/prefectures";

interface PrefectureBadgeIconProps {
  prefectureCode: PrefectureCode;
  tier: BadgeTier;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const SIZES = {
  sm: { badge: 40, icon: 20, fontSize: 8 },
  md: { badge: 56, icon: 28, fontSize: 10 },
  lg: { badge: 72, icon: 36, fontSize: 12 },
};

// 都道府県ごとのアイコン（絵文字ベース + SVGアクセント）
const PREFECTURE_ICONS: Record<PrefectureCode, string> = {
  hokkaido: "🐻",
  aomori: "🍎",
  iwate: "🍜",
  miyagi: "⚔️",
  akita: "👹",
  yamagata: "🍒",
  fukushima: "🐂",
  ibaraki: "🫘",
  tochigi: "🍓",
  gunma: "🎯",
  saitama: "🍘",
  chiba: "🥜",
  tokyo: "🗼",
  kanagawa: "🧱",
  niigata: "🌾",
  toyama: "🦑",
  ishikawa: "✨",
  fukui: "🦕",
  yamanashi: "🍇",
  nagano: "🍎",
  gifu: "🏔️",
  shizuoka: "🗻",
  aichi: "🐉",
  mie: "🦐",
  shiga: "🌊",
  kyoto: "⛩️",
  osaka: "🐙",
  hyogo: "🐄",
  nara: "🦌",
  wakayama: "🍊",
  tottori: "🏜️",
  shimane: "⛩️",
  okayama: "🍑",
  hiroshima: "🍁",
  yamaguchi: "🐡",
  tokushima: "💃",
  kagawa: "🍝",
  ehime: "🍊",
  kochi: "🐟",
  fukuoka: "🌶️",
  saga: "🏺",
  nagasaki: "🍰",
  kumamoto: "🐻",
  oita: "♨️",
  miyazaki: "🥭",
  kagoshima: "🌋",
  okinawa: "🦁",
};

export function PrefectureBadgeIcon({
  prefectureCode,
  tier,
  size = "md",
  showName = false,
}: PrefectureBadgeIconProps) {
  const prefecture = getPrefectureByCode(prefectureCode);
  if (!prefecture) return null;

  const tierInfo = BADGE_TIERS[tier];
  const sizeConfig = SIZES[size];
  const icon = PREFECTURE_ICONS[prefectureCode] || "🍜";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative rounded-full flex items-center justify-center shadow-md"
        style={{
          width: sizeConfig.badge,
          height: sizeConfig.badge,
          background: `linear-gradient(135deg, ${prefecture.colors[0]}, ${prefecture.colors[1]})`,
          border: `3px solid ${tierInfo.color}`,
          boxShadow: `0 2px 8px ${tierInfo.color}40`,
        }}
      >
        {/* メインアイコン */}
        <span
          style={{ fontSize: sizeConfig.icon }}
          role="img"
          aria-label={prefecture.symbol}
        >
          {icon}
        </span>

        {/* ティアバッジ */}
        <div
          className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center text-white font-bold"
          style={{
            width: sizeConfig.badge * 0.4,
            height: sizeConfig.badge * 0.4,
            backgroundColor: tierInfo.color,
            fontSize: sizeConfig.fontSize,
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          {tier === "gold" ? "★" : tier === "silver" ? "☆" : "●"}
        </div>
      </div>

      {showName && (
        <span
          className="text-center text-gray-700 font-medium"
          style={{ fontSize: sizeConfig.fontSize }}
        >
          {prefecture.name.replace(/[県府都道]$/, "")}
        </span>
      )}
    </div>
  );
}

// 未獲得バッジ表示用
export function PrefectureBadgeLocked({
  prefectureCode,
  size = "md",
  showName = false,
}: Omit<PrefectureBadgeIconProps, "tier">) {
  const prefecture = getPrefectureByCode(prefectureCode);
  if (!prefecture) return null;

  const sizeConfig = SIZES[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: sizeConfig.badge,
          height: sizeConfig.badge,
          backgroundColor: "#E9ECEF",
          border: "3px solid #DEE2E6",
        }}
      >
        <span
          style={{ fontSize: sizeConfig.icon, opacity: 0.3 }}
          role="img"
          aria-label={prefecture.symbol}
        >
          {PREFECTURE_ICONS[prefectureCode] || "🍜"}
        </span>
      </div>

      {showName && (
        <span
          className="text-center text-gray-400 font-medium"
          style={{ fontSize: sizeConfig.fontSize }}
        >
          {prefecture.name.replace(/[県府都道]$/, "")}
        </span>
      )}
    </div>
  );
}
