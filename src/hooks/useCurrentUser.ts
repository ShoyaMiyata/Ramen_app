"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

export function useCurrentUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsert);
  const createDevUser = useMutation(api.users.createDevUser);
  const hasUpserted = useRef(false);

  // 開発モード: 最初のユーザーを取得
  const devUser = useQuery(api.users.getDevUser, SKIP_AUTH ? {} : "skip");

  // 本番モード: Clerkユーザーに紐づくConvexユーザーを取得
  const convexUser = useQuery(
    api.users.getCurrent,
    !SKIP_AUTH && clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // 開発モード: ユーザーがいなければ作成
  useEffect(() => {
    if (SKIP_AUTH && devUser === null && !hasUpserted.current) {
      hasUpserted.current = true;
      createDevUser();
    }
  }, [devUser, createDevUser]);

  // 本番モード: Sync user to Convex on first load or when profile changes
  useEffect(() => {
    if (!SKIP_AUTH && clerkUser) {
      // 新規ユーザー作成
      if (convexUser === null && !hasUpserted.current) {
        hasUpserted.current = true;
        upsertUser({
          clerkId: clerkUser.id,
          name:
            clerkUser.fullName ||
            clerkUser.username ||
            clerkUser.emailAddresses[0]?.emailAddress ||
            "ユーザー",
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          imageUrl: clerkUser.imageUrl,
        });
      }
      // 既存ユーザーのアイコン同期
      else if (convexUser && convexUser.imageUrl !== clerkUser.imageUrl) {
        upsertUser({
          clerkId: clerkUser.id,
          name: convexUser.name || "ユーザー",
          email: convexUser.email || "",
          imageUrl: clerkUser.imageUrl,
        });
      }
    }
  }, [clerkUser, convexUser, upsertUser]);

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
