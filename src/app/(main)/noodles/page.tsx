"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoodleCard } from "@/components/features/noodle-card";
import { GENRES } from "@/lib/constants/genres";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SortOption = "newest" | "rating" | "visitDate";

export default function NoodlesPage() {
  const { isLoaded } = useCurrentUser();
  const [searchText, setSearchText] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const noodles = useQuery(api.noodles.list, {
    genres: selectedGenres.length > 0 ? selectedGenres : undefined,
    searchText: searchText || undefined,
    sortBy,
  });

  if (!isLoaded) {
    return <LoadingPage />;
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSearchText("");
    setSortBy("newest");
  };

  const hasFilters =
    selectedGenres.length > 0 || searchText || sortBy !== "newest";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl text-gray-900">ラーメン記録一覧</h1>
        <Link href="/noodles/new">
          <Button size="icon">
            <Plus className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="店名・商品名で検索"
          className="pl-9 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            showFilters && "text-orange-500"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              並び替え
            </label>
            <div className="flex gap-2">
              {[
                { value: "newest" as const, label: "新着順" },
                { value: "rating" as const, label: "評価順" },
                { value: "visitDate" as const, label: "訪問日順" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    sortBy === option.value
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ジャンル
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre.code}
                  type="button"
                  onClick={() => toggleGenre(genre.code)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    selectedGenres.includes(genre.code)
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              フィルタをクリア
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {noodles === undefined ? (
        <Loading className="py-8" />
      ) : noodles.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">
            {hasFilters
              ? "条件に一致する記録がありません"
              : "まだ記録がありません"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {noodles.map((noodle) => (
            <NoodleCard key={noodle._id} noodle={noodle} />
          ))}
        </div>
      )}
    </div>
  );
}
