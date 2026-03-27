"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useViewingUser } from "@/hooks/useViewingUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { NoodleCard } from "@/components/features/noodle-card";
import { Plus, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

const ITEMS_PER_PAGE = 10;

export default function LoungePage() {
  const { user, isLoaded } = useViewingUser();
  const { themeColor } = useTheme();
  useScrollRestoration();

  const [offset, setOffset] = useState(0);
  const [allItems, setAllItems] = useState<any[]>([]);

  const noodlesData = useQuery(api.noodles.list, {
    sortBy: "newest",
    limit: ITEMS_PER_PAGE,
    offset,
    viewerId: user?._id,
    room: "lounge",
  });

  useEffect(() => {
    if (noodlesData?.items) {
      if (offset === 0) {
        setAllItems(noodlesData.items);
      } else {
        setAllItems((prev) => {
          const existingIds = new Set(prev.map((item) => item._id));
          const newItems = noodlesData.items.filter(
            (item) => !existingIds.has(item._id)
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [noodlesData, offset]);

  const handleLoadMore = useCallback(() => {
    if (noodlesData?.hasMore) {
      setOffset((prev) => prev + ITEMS_PER_PAGE);
    }
  }, [noodlesData?.hasMore]);

  if (!isLoaded) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5" style={{ color: themeColor }} />
          <h1 className="font-bold text-xl text-gray-900">ラウンジ</h1>
        </div>
        <Link href="/lounge/new">
          <Button size="icon" style={{ backgroundColor: themeColor }}>
            <Plus className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <p className="text-sm text-gray-500">なんでも自由に記録できる場所</p>

      {noodlesData === undefined && allItems.length === 0 ? (
        <Loading className="py-8" />
      ) : allItems.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">まだ投稿がありません</p>
          <p className="text-sm text-gray-400">なんでも自由に記録してみましょう</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allItems.map((noodle) => (
            <NoodleCard key={noodle._id} noodle={noodle} currentUserId={user?._id} hideGenres />
          ))}
          {noodlesData?.hasMore && (
            <button
              onClick={handleLoadMore}
              className="w-full py-3 text-sm text-gray-500 hover:text-gray-700"
            >
              もっと見る
            </button>
          )}
        </div>
      )}
    </div>
  );
}
