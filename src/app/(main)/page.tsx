"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { useAuth } from "@clerk/nextjs";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();
  const { isSignedIn } = useAuth();
  const [hasCheckedLanding, setHasCheckedLanding] = useState(false);

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

    // 認証済みユーザーの場合、自分のプロフィールページへ
    if (isLoaded && user?._id) {
      router.replace(`/users/${user._id}`);
    }
  }, [isLoaded, user, router, isSignedIn, hasCheckedLanding]);

  return <LoadingPage />;
}
