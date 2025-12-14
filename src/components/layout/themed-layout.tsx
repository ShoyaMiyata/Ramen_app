"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useViewingUser } from "@/hooks/useViewingUser";
import { useUserStats } from "@/hooks/useUserStats";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Header, BottomNav } from "@/components/layout/header";
import { TestModeBanner } from "@/components/layout/test-mode-banner";
import { LoadingPage } from "@/components/ui/loading";
import { RANKS } from "@/lib/constants/ranks";

export function ThemedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // オンボーディングチェック用に実際のユーザーを取得
  const { user: realUser, isLoaded, isSignedIn } = useCurrentUser();
  // テーマ設定用に表示中のユーザーを取得（テストモード対応）
  const { user: viewingUser } = useViewingUser();
  const { rank, isLoading } = useUserStats(viewingUser?._id);

  // オンボーディング未完了時はリダイレクト（実際のユーザーをチェック）
  useEffect(() => {
    if (isLoaded && isSignedIn && realUser && !realUser.onboardingComplete) {
      router.push("/onboarding");
    }
  }, [isLoaded, isSignedIn, realUser, router]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingPage />
      </div>
    );
  }

  // オンボーディング未完了の場合はローディング表示（リダイレクト中）
  if (isSignedIn && realUser && !realUser.onboardingComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingPage />
      </div>
    );
  }

  const currentRank = rank || RANKS[0];
  const selectedThemeLevel = viewingUser?.selectedThemeLevel;

  return (
    <ThemeProvider rank={currentRank} selectedThemeLevel={selectedThemeLevel}>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <TestModeBanner />
        <main className="max-w-md mx-auto px-4 py-4">{children}</main>
        <BottomNav />
      </div>
    </ThemeProvider>
  );
}
