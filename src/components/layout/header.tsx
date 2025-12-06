"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserStats } from "@/hooks/useUserStats";
import { useTheme } from "@/contexts/ThemeContext";
import { Soup, Home, Heart, Trophy, Search } from "lucide-react";

export function Header() {
  const { user } = useCurrentUser();
  const { rank } = useUserStats(user?._id);
  const { themeColor } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Soup className="w-6 h-6" style={{ color: themeColor }} />
          <span className="font-bold text-lg">麺ログ</span>
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
  const pathname = usePathname();
  const { themeColor } = useTheme();

  const navItems = [
    { href: "/", icon: Home, label: "マイページ" },
    { href: "/noodles", icon: Soup, label: "タイムライン" },
    { href: "/users", icon: Search, label: "友達を探す" },
    { href: "/likes", icon: Heart, label: "いいね" },
    { href: "/ranking", icon: Trophy, label: "ランキング" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 transition-colors"
              style={{
                color: isActive ? themeColor : "#6B7280",
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
