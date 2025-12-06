"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { BadgeRarity } from "@/lib/constants/badges";

interface BadgeProps {
  children: React.ReactNode;
  rarity?: BadgeRarity;
  className?: string;
  animate?: boolean;
}

const rarityStyles: Record<BadgeRarity, string> = {
  common: "bg-gray-100 text-gray-700 border-gray-300",
  uncommon: "bg-green-100 text-green-700 border-green-300",
  rare: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300",
  epic: "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-300 shadow-md shadow-purple-200",
  legendary:
    "bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-100 text-amber-700 border-amber-400 shadow-lg shadow-amber-200",
};

export function Badge({
  children,
  rarity = "common",
  className,
  animate = false,
}: BadgeProps) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        rarityStyles[rarity],
        className
      )}
    >
      {children}
    </span>
  );

  if (animate && rarity === "legendary") {
    return (
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
