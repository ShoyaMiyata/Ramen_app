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
  Sparkles,
  Flame,
  Bone,
  Store,
  Dumbbell,
  Rainbow,
  Eye,
  Star,
  type LucideIcon,
} from "lucide-react";
import { BADGES, type BadgeCode, type BadgeRarity } from "@/lib/constants/badges";
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
  Sparkles,
  Flame,
  Bone,
  Store,
  Dumbbell,
  Rainbow,
  Eye,
  Star,
};

interface BadgeDisplayProps {
  userBadges: Array<
    Doc<"userBadges"> & {
      badge?: (typeof BADGES)[BadgeCode];
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

interface NewBadgeModalProps {
  badge: (typeof BADGES)[BadgeCode] | null;
  onClose: () => void;
}

export function NewBadgeModal({ badge, onClose }: NewBadgeModalProps) {
  if (!badge) return null;

  const IconComponent = iconMap[badge.icon] || Award;

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
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center"
          >
            <IconComponent className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-bold text-gray-900 mb-2"
          >
            バッジ獲得！
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
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
          >
            閉じる
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
