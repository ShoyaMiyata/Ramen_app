"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { NoodleCard } from "../noodle-card";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Soup } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface GroupTimelineProps {
  groupId: Id<"groups">;
  currentUserId?: Id<"users">;
}

export function GroupTimeline({ groupId, currentUserId }: GroupTimelineProps) {
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

  const noodlesData = useQuery(api.noodles.getByGroup, {
    groupId,
    sortBy,
    limit: 50,
    offset: 0,
  });

  if (noodlesData === undefined) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
            <div className="h-48 bg-gray-200 rounded-lg mb-3" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const noodles = noodlesData.items;

  if (noodles.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm">
        <Soup className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500">まだ投稿がありません</p>
        <p className="text-sm text-gray-400 mt-1">
          最初の一杯を記録してみましょう
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ソート切り替え */}
      <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
        <button
          onClick={() => setSortBy("recent")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            sortBy === "recent"
              ? "bg-orange-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Clock className="w-4 h-4" />
          最新順
        </button>
        <button
          onClick={() => setSortBy("popular")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            sortBy === "popular"
              ? "bg-orange-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          人気順
        </button>
      </div>

      {/* タイムライン */}
      <div className="space-y-3">
        {noodles.map((noodle) => (
          <NoodleCard
            key={noodle._id}
            noodle={noodle}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
