"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserStats } from "@/hooks/useUserStats";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoodleCard } from "@/components/features/noodle-card";
import { RankDisplay } from "@/components/features/rank-display";
import { BadgeDisplay } from "@/components/features/badge-display";
import { Gallery } from "@/components/features/gallery";
import { MyBestDisplay } from "@/components/features/my-best";
import { Plus, ChevronRight, Grid3X3, List, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import * as Dialog from "@radix-ui/react-dialog";

type ViewMode = "list" | "gallery";

export default function HomePage() {
  const { user, isLoaded } = useCurrentUser();
  const { shopCount, postCount, badges, isLoading: statsLoading } = useUserStats(
    user?._id
  );
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [editName, setEditName] = useState("");

  const updateName = useMutation(api.users.updateName);

  const myNoodles = useQuery(
    api.noodles.getByUser,
    user?._id ? { userId: user._id } : "skip"
  );

  const galleryNoodles = useQuery(
    api.noodles.getGalleryByUser,
    user?._id ? { userId: user._id } : "skip"
  );

  if (!isLoaded || statsLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <LoadingPage />;
  }

  const recentNoodles = myNoodles?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
          {user.imageUrl && (
            <button
              onClick={() => {
                setEditName(user.name || "");
                setIsEditNameOpen(true);
              }}
              className="relative group"
            >
              <img
                src={user.imageUrl}
                alt={user.name || ""}
                className="w-16 h-16 rounded-full"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pencil className="w-5 h-5 text-white" />
              </div>
            </button>
          )}
          <div>
            <h1 className="font-bold text-xl text-gray-900">{user.name || "ユーザー"}</h1>
            <p className="text-sm text-gray-500">{postCount}杯を制覇</p>
          </div>
        </div>
      </div>

      {/* Edit Name Dialog */}
      <Dialog.Root open={isEditNameOpen} onOpenChange={setIsEditNameOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-sm z-50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-bold text-gray-900">
                名前を編集
              </Dialog.Title>
              <Dialog.Close className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </Dialog.Close>
            </div>
            <div className="space-y-4">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="名前を入力"
                className="w-full"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditNameOpen(false)}
                >
                  キャンセル
                </Button>
                <Button
                  className="flex-1"
                  onClick={async () => {
                    if (user._id && editName.trim()) {
                      await updateName({
                        userId: user._id,
                        name: editName.trim(),
                      });
                      setIsEditNameOpen(false);
                    }
                  }}
                  disabled={!editName.trim()}
                >
                  保存
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Rank Display */}
      <RankDisplay shopCount={shopCount} />

      {/* My Best */}
      <MyBestDisplay userId={user._id} editable />

      {/* Badges */}
      {badges.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">獲得バッジ</h2>
          <BadgeDisplay userBadges={badges} />
        </div>
      )}

      {/* New Record Button */}
      <Link href="/noodles/new">
        <Button className="w-full gap-2">
          <Plus className="w-5 h-5" />
          一杯を記録する
        </Button>
      </Link>

      {/* Records */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">啜ったラーメン</h2>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("gallery")}
                className={cn(
                  "p-1.5 rounded",
                  viewMode === "gallery"
                    ? "bg-white text-orange-500 shadow-sm"
                    : "text-gray-400"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded",
                  viewMode === "list"
                    ? "bg-white text-orange-500 shadow-sm"
                    : "text-gray-400"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            {myNoodles && myNoodles.length > 5 && viewMode === "list" && (
              <Link
                href="/noodles"
                className="text-sm text-orange-500 flex items-center gap-1"
              >
                すべて
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {viewMode === "gallery" ? (
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <Gallery noodles={galleryNoodles || []} />
          </div>
        ) : recentNoodles.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-4">まだ記録がありません</p>
            <Link href="/noodles/new">
              <Button size="sm">最初の一杯を記録</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentNoodles.map((noodle) => (
              <NoodleCard key={noodle._id} noodle={noodle} showUser={false} currentUserId={user._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
