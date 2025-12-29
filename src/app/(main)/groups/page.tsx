"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, FileText, Search, Image as ImageIcon } from "lucide-react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

export default function GroupsPage() {
  useScrollRestoration();
  const { user, isLoaded } = useCurrentUser();
  const [searchText, setSearchText] = useState("");

  const myGroups = useQuery(
    api.groups.getByUser,
    user?._id ? { userId: user._id } : "skip"
  );

  if (!isLoaded || myGroups === undefined) {
    return <LoadingPage />;
  }

  // 参加しているグループのみを表示
  const groups = searchText.trim()
    ? myGroups.filter((g) =>
        g.name.toLowerCase().includes(searchText.trim().toLowerCase()) ||
        g.description.toLowerCase().includes(searchText.trim().toLowerCase())
      )
    : myGroups;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">グループ</h1>
        {user?.isAdmin && (
          <Link href="/groups/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              作成
            </Button>
          </Link>
        )}
      </div>

      {/* Description */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-1 text-sm">
              プライベートなグループ空間
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              グループはメンバーだけの特別な空間です。メンバー以外には表示されず、メンバーの投稿だけが見られます。自由にメンバーを追加できます。
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="グループを検索..."
          className="pl-10"
        />
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchText
              ? "検索結果が見つかりませんでした"
              : "まだグループがありません"}
          </p>
          {user?.isAdmin && !searchText && (
            <Link href="/groups/new" className="inline-block mt-4">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                最初のグループを作成
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <Link
              key={group._id}
              href={`/groups/${group._id}`}
              className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex">
                {/* Cover Image */}
                {group.coverImageUrl ? (
                  <img
                    src={group.coverImageUrl}
                    alt={group.name}
                    className="w-24 h-24 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-8 h-8 text-white opacity-50" />
                  </div>
                )}

                {/* Group Info */}
                <div className="flex-1 p-3 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate mb-1">
                    {group.name}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {group.description}
                  </p>

                  <div className="flex gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{group.memberCount}人</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{group.noodleCount}件</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
