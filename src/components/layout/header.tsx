"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserStats } from "@/hooks/useUserStats";
import { Soup, Home, Heart, Trophy, Users } from "lucide-react";

export function Header() {
  const { user } = useCurrentUser();
  const { rank } = useUserStats(user?._id);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Soup className="w-6 h-6 text-orange-500" />
          <span className="font-bold text-lg">ラーメン記録</span>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <div
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{
                background: rank.gradient || rank.color,
              }}
            >
              {rank.name}
            </div>
          )}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-orange-500"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">マイページ</span>
        </Link>
        <Link
          href="/noodles"
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-orange-500"
        >
          <Soup className="w-5 h-5" />
          <span className="text-xs">記録一覧</span>
        </Link>
        <Link
          href="/users"
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-orange-500"
        >
          <Users className="w-5 h-5" />
          <span className="text-xs">ユーザー</span>
        </Link>
        <Link
          href="/likes"
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-orange-500"
        >
          <Heart className="w-5 h-5" />
          <span className="text-xs">お気に入り</span>
        </Link>
        <Link
          href="/ranking"
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-orange-500"
        >
          <Trophy className="w-5 h-5" />
          <span className="text-xs">ランキング</span>
        </Link>
      </div>
    </nav>
  );
}
