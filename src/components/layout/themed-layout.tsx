"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserStats } from "@/hooks/useUserStats";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Header, BottomNav } from "@/components/layout/header";
import { LoadingPage } from "@/components/ui/loading";
import { RANKS } from "@/lib/constants/ranks";

export function ThemedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useCurrentUser();
  const { rank, isLoading } = useUserStats(user?._id);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingPage />
      </div>
    );
  }

  const currentRank = rank || RANKS[0];
  const selectedThemeLevel = user?.selectedThemeLevel;

  return (
    <ThemeProvider rank={currentRank} selectedThemeLevel={selectedThemeLevel}>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="max-w-md mx-auto px-4 py-4">{children}</main>
        <BottomNav />
      </div>
    </ThemeProvider>
  );
}
