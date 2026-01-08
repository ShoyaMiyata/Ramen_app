"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

export function useCurrentUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  // 開発モード: 最初のユーザーを取得
  const devUser = useQuery(api.users.getDevUser, SKIP_AUTH ? {} : "skip");

  // 本番モード: Clerkユーザーに紐づくConvexユーザーを取得
  const convexUser = useQuery(
    api.users.getCurrent,
    !SKIP_AUTH && clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // 開発モードの場合
  if (SKIP_AUTH) {
    return {
      user: devUser,
      clerkUser: null,
      isLoaded: devUser !== undefined,
      isSignedIn: true,
    };
  }

  // 本番モードの場合
  return {
    user: convexUser,
    clerkUser,
    isLoaded: isClerkLoaded && convexUser !== undefined,
    isSignedIn: !!clerkUser,
  };
}
