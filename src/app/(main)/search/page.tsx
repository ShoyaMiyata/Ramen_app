"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useViewingUser } from "@/hooks/useViewingUser";
import { LoadingPage } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Store } from "lucide-react";
import { UserCard } from "@/components/features/user-card";
import { ShopCard } from "@/components/features/shop-card";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils/cn";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

type Tab = "users" | "shops";

export default function SearchPage() {
  useScrollRestoration();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useViewingUser();
  const { themeColor } = useTheme();

  // クエリパラメータからタブを取得（デフォルトは "users"）
  const tabParam = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam === "shops" ? "shops" : "users");
  const [searchText, setSearchText] = useState("");
  const [shopOffset, setShopOffset] = useState(0);
  const SHOP_LIMIT = 20;

  // ユーザー検索
  const userSearchResults = useQuery(
    api.users.search,
    searchText.length >= 1 && activeTab === "users" ? { searchText } : "skip"
  );
  const allUsers = useQuery(api.users.list, activeTab === "users" ? {} : "skip");

  // 店舗検索
  const shopSearchResults = useQuery(
    api.shops.searchWithStats,
    activeTab === "shops"
      ? {
          searchText: searchText || "",
          viewerId: user?._id,
          limit: SHOP_LIMIT,
          offset: shopOffset,
        }
      : "skip"
  );

  // 既読データを保持
  type ShopItem = NonNullable<typeof shopSearchResults>["items"][number];
  const [allLoadedShops, setAllLoadedShops] = useState<ShopItem[]>([]);

  // 店舗データが更新されたら追加
  useEffect(() => {
    if (shopSearchResults?.items) {
      setAllLoadedShops((prev) => {
        const existingIds = new Set(prev.map((s) => s._id));
        const newItems = shopSearchResults.items.filter((s) => !existingIds.has(s._id));
        return [...prev, ...newItems];
      });
    }
  }, [shopSearchResults]);

  // オフセットがリセットされたら既読データもリセット
  useEffect(() => {
    if (shopOffset === 0) {
      setAllLoadedShops([]);
    }
  }, [shopOffset]);

  // タブ切り替え時にリセット
  const handleTabChange = (tab: Tab) => {
    // 同じタブをクリックした場合は何もしない
    if (tab === activeTab) return;

    setActiveTab(tab);
    setSearchText("");
    setShopOffset(0);
    setAllLoadedShops([]);
  };

  // 検索テキスト変更時にリセット
  useEffect(() => {
    setShopOffset(0);
    setAllLoadedShops([]);
  }, [searchText]);

  const loadMoreShops = () => {
    if (shopSearchResults?.hasMore) {
      setShopOffset((prev) => prev + SHOP_LIMIT);
    }
  };

  if (!isLoaded) {
    return <LoadingPage />;
  }

  const displayUsers =
    activeTab === "users"
      ? searchText.length >= 1
        ? userSearchResults
        : allUsers
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-6 h-6" style={{ color: themeColor }} />
        <h1 className="text-xl font-bold text-gray-900">検索</h1>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => handleTabChange("users")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors relative",
            activeTab === "users"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          <Users className="w-4 h-4" />
          <span>ユーザー</span>
          {activeTab === "users" && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: themeColor }}
            />
          )}
        </button>

        <button
          onClick={() => handleTabChange("shops")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors relative",
            activeTab === "shops"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          <Store className="w-4 h-4" />
          <span>店舗</span>
          {activeTab === "shops" && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: themeColor }}
            />
          )}
        </button>
      </div>

      {/* 検索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={
            activeTab === "users" ? "ユーザーを検索" : "店舗名で検索"
          }
          className="pl-9"
        />
      </div>

      {/* ユーザー一覧 */}
      {activeTab === "users" && (
        <div className="space-y-2">
          {displayUsers === undefined ? (
            <div className="text-center py-8 text-gray-400">読み込み中...</div>
          ) : displayUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchText
                ? "該当するユーザーがいません"
                : "まだユーザーがいません"}
            </div>
          ) : (
            displayUsers
              .filter((u) => u._id !== user?._id) // 自分以外を表示
              .map((u) => (
                <UserCard key={u._id} user={u} currentUserId={user?._id} />
              ))
          )}
        </div>
      )}

      {/* 店舗一覧 */}
      {activeTab === "shops" && (
        <div className="space-y-2">
          {shopSearchResults === undefined ? (
            <div className="text-center py-8 text-gray-400">読み込み中...</div>
          ) : allLoadedShops.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchText
                ? "該当する店舗がありません"
                : "まだ店舗がありません"}
            </div>
          ) : (
            <>
              {allLoadedShops.map((shop) => (
                <ShopCard key={shop._id} shop={shop} />
              ))}
              {shopSearchResults?.hasMore && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={loadMoreShops} className="w-full">
                    もっと見る (
                    {shopSearchResults.totalCount - allLoadedShops.length}件)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
