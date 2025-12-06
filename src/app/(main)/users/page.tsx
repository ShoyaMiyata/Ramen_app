"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { UserCard } from "@/components/features/user-card";

export default function UsersPage() {
  const { user, isLoaded } = useCurrentUser();
  const [searchText, setSearchText] = useState("");

  const searchResults = useQuery(
    api.users.search,
    searchText.length >= 1 ? { searchText } : "skip"
  );

  const allUsers = useQuery(api.users.list);

  if (!isLoaded) {
    return <LoadingPage />;
  }

  const displayUsers = searchText.length >= 1 ? searchResults : allUsers;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-orange-500" />
        <h1 className="text-xl font-bold text-gray-900">ユーザー</h1>
      </div>

      {/* 検索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="ユーザー名で検索"
          className="pl-9"
        />
      </div>

      {/* ユーザー一覧 */}
      <div className="space-y-2">
        {displayUsers === undefined ? (
          <div className="text-center py-8 text-gray-400">読み込み中...</div>
        ) : displayUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchText ? "ユーザーが見つかりません" : "ユーザーがいません"}
          </div>
        ) : (
          displayUsers
            .filter((u) => u._id !== user?._id) // 自分以外を表示
            .map((u) => (
              <UserCard key={u._id} user={u} currentUserId={user?._id} />
            ))
        )}
      </div>
    </div>
  );
}
