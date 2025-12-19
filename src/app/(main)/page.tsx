"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { useAuth } from "@clerk/nextjs";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();
  const { isSignedIn } = useAuth();
  const [hasCheckedLanding, setHasCheckedLanding] = useState(false);
  const postLoginDestination = useQuery(api.appSettings.getPostLoginDestination);

  useEffect(() => {
    // 初回訪問チェック: 未認証ユーザーの場合のみ
    if (isLoaded && !isSignedIn && !hasCheckedLanding) {
      setHasCheckedLanding(true);
      const hasVisitedBefore = localStorage.getItem("hasVisitedNooodle");

      if (!hasVisitedBefore) {
        // 初回訪問の場合、フラグを立ててランディングページへ
        localStorage.setItem("hasVisitedNooodle", "true");
        router.replace("/landing");
        return;
      }
    }

    // 認証済みユーザーの場合、管理者設定に基づいてリダイレクト
    if (isLoaded && user?._id && postLoginDestination) {
      if (postLoginDestination === "landing") {
        router.replace("/landing");
      } else {
        // デフォルト: 自分のプロフィールページ（マイページ）へ
        router.replace(`/users/${user._id}`);
      }
    }
  }, [isLoaded, user, router, isSignedIn, hasCheckedLanding, postLoginDestination]);

  return <LoadingPage />;
}
