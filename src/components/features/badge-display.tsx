"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Award,
  Soup,
  Home,
  FileText,
  Library,
  Crown,
  Map,
  Compass,
  Trophy,
  Droplet,
  Droplets,
  Sparkles,
  Flame,
  Bone,
  Store,
  Dumbbell,
  Rainbow,
  Eye,
  Star,
  MapPin,
  Plane,
  Globe,
  Medal,
  MessageSquare,
  MessagesSquare,
  Users,
  Sparkle,
  Heart,
  Calendar,
  Zap,
  Mountain,
  Footprints,
  Utensils,
  Bird,
  Stars,
  ThumbsUp,
  Target,
  Network,
  MessageCircle,
  CalendarDays,
  Shield,
  Timer,
  Gift,
  PartyPopper,
  Cake,
  Rocket,
  CalendarCheck,
  Gem,
  Snowflake,
  Wheat,
  Leaf,
  Wind,
  Ship,
  Sword,
  Palmtree,
  Cloud,
  Sun,
  Coffee,
  Package,
  Shuffle,
  Fish,
  Salad,
  Layers,
  Disc,
  Egg,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { BADGES, HIDDEN_BADGES, ALL_BADGES, type BadgeCode, type BadgeRarity, type HiddenBadgeCode, type AllBadgeCode } from "@/lib/constants/badges";
import { formatDate } from "@/lib/utils/date";
import { Doc } from "../../../convex/_generated/dataModel";

const iconMap: Record<string, LucideIcon> = {
  Award,
  Soup,
  Home,
  FileText,
  Library,
  Crown,
  Map,
  Compass,
  Trophy,
  Droplet,
  Droplets,
  Sparkles,
  Flame,
  Bone,
  Store,
  Dumbbell,
  Rainbow,
  Eye,
  Star,
  MapPin,
  Plane,
  Globe,
  Medal,
  MessageSquare,
  MessagesSquare,
  Users,
  Sparkle,
  Heart,
  Calendar,
  Zap,
  Mountain,
  Footprints,
  Utensils,
  Bird,
  Stars,
  ThumbsUp,
  Target,
  Network,
  MessageCircle,
  CalendarDays,
  Shield,
  Timer,
  Gift,
  PartyPopper,
  Cake,
  Rocket,
  CalendarCheck,
  Gem,
  Pepper: Flame, // Pepperがないので代替
  // 隠しバッジ用アイコン
  Snowflake,
  Wheat,
  Leaf,
  Wind,
  Ship,
  Sword,
  Palmtree,
  Cloud,
  Sun,
  Coffee,
  Package,
  Shuffle,
  Fish,
  Salad,
  Layers,
  Disc,
  Egg,
  GraduationCap,
};

interface BadgeDisplayProps {
  userBadges: Array<
    Doc<"userBadges"> & {
      badge?: (typeof ALL_BADGES)[AllBadgeCode];
    }
  >;
  showAll?: boolean;
}

export function BadgeDisplay({ userBadges, showAll = false }: BadgeDisplayProps) {
  const displayBadges = showAll ? userBadges : userBadges.slice(0, 6);

  return (
    <Tooltip.Provider>
      <div className="flex flex-wrap gap-2">
        {displayBadges.map((ub) => {
          if (!ub.badge) return null;

          const IconComponent = iconMap[ub.badge.icon] || Award;

          return (
            <Tooltip.Root key={ub._id}>
              <Tooltip.Trigger asChild>
                <div>
                  <Badge
                    rarity={ub.badge.rarity as BadgeRarity}
                    animate={ub.badge.rarity === "legendary"}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    {ub.badge.name}
                  </Badge>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50"
                  sideOffset={5}
                >
                  <p className="font-medium">{ub.badge.description}</p>
                  <p className="text-gray-400 mt-1">
                    獲得日: {formatDate(ub.acquiredAt)}
                  </p>
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}
        {!showAll && userBadges.length > 6 && (
          <span className="text-xs text-gray-400 self-center">
            +{userBadges.length - 6}
          </span>
        )}
      </div>
    </Tooltip.Provider>
  );
}

// バッジ一覧モーダル
interface BadgeListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  earnedBadgeCodes: string[];
}

// バッジをカテゴリ別にグループ化
const BADGE_CATEGORIES = [
  {
    name: "投稿バッジ",
    badges: ["FIRST_POST", "REGULAR", "CONNOISSEUR", "RECORD_KEEPER", "LEGEND", "MYTHICAL"] as BadgeCode[],
  },
  {
    name: "探索バッジ",
    badges: ["FIRST_SHOP", "ADVENTURER", "PIONEER", "NATIONAL_CONQUEST", "EXPLORER_KING"] as BadgeCode[],
  },
  {
    name: "都道府県制覇",
    badges: ["REGIONAL_EXPLORER", "NATIONWIDE_TRAVELER", "HALF_JAPAN", "JAPAN_MASTER"] as BadgeCode[],
  },
  {
    name: "ジャンルマスター",
    badges: ["SHOYU_MASTER", "SHIO_MASTER", "MISO_MASTER", "TONKOTSU_MASTER", "IEKEI_MASTER", "JIRO_MASTER", "TSUKEMEN_MASTER", "TANTANMEN_MASTER", "CHICKEN_MASTER", "ALL_ROUNDER"] as BadgeCode[],
  },
  {
    name: "評価バッジ",
    badges: ["QUALITY_HUNTER", "CRITICAL_TASTER", "PERFECTIONIST"] as BadgeCode[],
  },
  {
    name: "ソーシャルバッジ",
    badges: ["COMMENTATOR", "ACTIVE_MEMBER", "DISCUSSION_LEADER", "SOCIAL_BUTTERFLY", "NETWORKING_PRO", "POPULAR_MEMBER", "RAMEN_CELEBRITY", "RAMEN_LEGEND"] as BadgeCode[],
  },
  {
    name: "いいねバッジ",
    badges: ["FIRST_LIKE", "CONNOISSEUR_EYE", "INFLUENCER", "SUPERSTAR"] as BadgeCode[],
  },
  {
    name: "連続投稿",
    badges: ["THREE_DAY_STREAK", "FIRST_WEEK", "TWO_WEEK_STREAK", "DEDICATED_EATER", "IRON_STOMACH", "RAMEN_MARATHON", "YEARLY_STREAK"] as BadgeCode[],
  },
  {
    name: "アニバーサリー",
    badges: ["ONE_MONTH_MEMBER", "THREE_MONTH_MEMBER", "HALF_YEAR_MEMBER", "ONE_YEAR_MEMBER", "TWO_YEAR_MEMBER"] as BadgeCode[],
  },
  {
    name: "チャレンジ",
    badges: ["WEEKLY_CHALLENGER", "WEEKLY_CHAMPION", "MONTHLY_REGULAR", "MONTHLY_MASTER", "YEARLY_CENTURION", "YEARLY_LEGEND"] as BadgeCode[],
  },
];

export function BadgeListModal({ open, onOpenChange, earnedBadgeCodes }: BadgeListModalProps) {
  const earnedSet = new Set(earnedBadgeCodes);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg">全バッジ一覧</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <span className="sr-only">閉じる</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-6">
              <p className="text-sm text-gray-500">
                獲得済み: {earnedBadgeCodes.filter(code => !HIDDEN_BADGES[code as HiddenBadgeCode]).length}/{Object.keys(BADGES).length}
              </p>

              {BADGE_CATEGORIES.map((category) => (
                <div key={category.name}>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{category.name}</h3>
                  <div className="space-y-2">
                    {category.badges.map((code) => {
                      const badge = BADGES[code];
                      const isEarned = earnedSet.has(code);
                      const IconComponent = iconMap[badge.icon] || Award;

                      return (
                        <div
                          key={code}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isEarned ? "bg-gray-50" : "bg-gray-100 opacity-60"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isEarned
                                ? "bg-gradient-to-br from-yellow-300 to-orange-400"
                                : "bg-gray-300"
                            }`}
                          >
                            <IconComponent
                              className={`w-5 h-5 ${isEarned ? "text-white" : "text-gray-500"}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isEarned ? "text-gray-900" : "text-gray-500"}`}>
                                {badge.name}
                              </span>
                              {isEarned && (
                                <Badge rarity={badge.rarity as BadgeRarity} className="text-[10px] px-1.5 py-0.5">
                                  獲得済
                                </Badge>
                              )}
                            </div>
                            <p className={`text-sm ${isEarned ? "text-gray-500" : "text-gray-400"}`}>
                              {badge.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* 隠しバッジセクション（獲得済みのみ表示） */}
              {(() => {
                const earnedHiddenBadges = earnedBadgeCodes.filter(
                  (code) => HIDDEN_BADGES[code as HiddenBadgeCode]
                );
                if (earnedHiddenBadges.length === 0) return null;

                return (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-purple-500">✨</span>
                      シークレットバッジ
                      <span className="text-xs text-gray-400">({earnedHiddenBadges.length}個獲得)</span>
                    </h3>
                    <div className="space-y-2">
                      {earnedHiddenBadges.map((code) => {
                        const badge = HIDDEN_BADGES[code as HiddenBadgeCode];
                        if (!badge) return null;
                        const IconComponent = iconMap[badge.icon] || Award;

                        return (
                          <div
                            key={code}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100"
                          >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-500">
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{badge.name}</span>
                                <Badge rarity={badge.rarity as BadgeRarity} className="text-[10px] px-1.5 py-0.5">
                                  獲得済
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">{badge.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface NewBadgeModalProps {
  badge: (typeof ALL_BADGES)[AllBadgeCode] | null;
  onClose: () => void;
}

export function NewBadgeModal({ badge, onClose }: NewBadgeModalProps) {
  if (!badge) return null;

  const IconComponent = iconMap[badge.icon] || Award;
  const isHidden = HIDDEN_BADGES[badge.code as HiddenBadgeCode];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2 }}
            className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isHidden
                ? "bg-gradient-to-br from-purple-400 to-indigo-500"
                : "bg-gradient-to-br from-yellow-300 to-orange-400"
            }`}
          >
            <IconComponent className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-bold text-gray-900 mb-2"
          >
            {isHidden ? "シークレットバッジ獲得！" : "バッジ獲得！"}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Badge rarity={badge.rarity as BadgeRarity} className="text-sm">
              <IconComponent className="w-4 h-4" />
              {badge.name}
            </Badge>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-500 mt-3 text-sm"
          >
            {badge.description}
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={onClose}
            className={`mt-4 px-6 py-2 text-white rounded-full font-medium transition-colors ${
              isHidden
                ? "bg-purple-500 hover:bg-purple-600"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            閉じる
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// 隠しバッジコンプリートモーダル
interface HiddenBadgeCompleteModalProps {
  open: boolean;
  onClose: () => void;
  completedCount: number;
  totalCount: number;
}

export function HiddenBadgeCompleteModal({
  open,
  onClose,
  completedCount,
  totalCount,
}: HiddenBadgeCompleteModalProps) {
  if (!open) return null;

  // ramen_name_contains タイプの隠しバッジの数（究極バッジを除く）
  const baseHiddenBadgeCount = Object.values(HIDDEN_BADGES).filter(
    (b) => b.conditionType === "ramen_name_contains"
  ).length;

  const isAllComplete = completedCount >= baseHiddenBadgeCount;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 max-w-sm w-full text-center relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 背景の星 */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  delay: Math.random() * 2,
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3,
                }}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.3, 1], rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative w-24 h-24 mx-auto mb-4"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/50">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-yellow-300" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-white mb-2"
          >
            {isAllComplete ? "全制覇達成！" : "マイルストーン達成！"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-purple-200 mb-4"
          >
            {isAllComplete
              ? "すべてのシークレットバッジを獲得しました！"
              : `シークレットバッジを${completedCount}個獲得！`}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-white/10 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center justify-center gap-2 text-white">
              <span className="text-3xl font-bold text-yellow-300">
                {completedCount}
              </span>
              <span className="text-purple-300">/</span>
              <span className="text-xl text-purple-300">{totalCount}</span>
            </div>
            <p className="text-xs text-purple-300 mt-1">シークレットバッジ</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
          >
            すごい！
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
